import { parse } from '@babel/parser'
// @ts-ignore
import traverse from '@babel/traverse'
import * as path from 'path'

/**
 * Analysis result for a useTranslations/getTranslations call
 */
export interface UseTranslationsAnalysis {
  /** Variable name assigned (e.g., 't', 'common') */
  variableName: string
  /** Resolved namespace, or null if dynamic */
  namespace: string | null
  /** True if namespace couldn't be statically resolved */
  isDynamic: boolean
  /** Dynamic placeholder for unresolved namespaces */
  dynamicPlaceholder?: string
  /** Location in source */
  location: { start: number; end: number; line: number }
}

/**
 * Result of translation usage analysis compatible with KeyInDocument
 */
export interface AnalyzedKey {
  key: string
  start: number
  end: number
  quoted: boolean
  namespace?: string
  variableName: string
}

/**
 * Helper to parse code
 */
function parseCode(code: string) {
  try {
    return parse(code, {
      sourceType: 'unambiguous',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
      ],
    })
  }
  catch {
    return null
  }
}

/**
 * Resolved value from AST
 */
interface ResolvedValue {
  value: string | string[] | Record<string, string>[] | null
  isDynamic: boolean
}

/**
 * Perform constant folding on AST nodes to resolve static values.
 * This simplifies constant expressions (e.g., string concatenation, template literals)
 * at analysis time to determine values without runtime execution.
 */
function foldConstant(
  node: any, 
  scope: any, 
  importer?: (path: string) => string | undefined, 
  depth = 0
): ResolvedValue {
  if (!node) return { value: null, isDynamic: true }
  
  // Unwrap TS expressions
  while (
    node.type === 'TSAsExpression' || 
    node.type === 'TSTypeAssertion' || 
    node.type === 'TSNonNullExpression' ||
    node.type === 'TSSatisfiesExpression'
  ) {
    node = node.expression
  }

  if (depth > 5) return { value: null, isDynamic: true } // Recursion limit

  // 1. Literals
  if (node.type === 'StringLiteral') {
    return { value: node.value, isDynamic: false }
  }
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return { value: node.quasis[0]?.value?.cooked || '', isDynamic: false }
  }

  // 2. Arrays
  if (node.type === 'ArrayExpression') {
    const stringElements: string[] = []
    const objectElements: Record<string, string>[] = []
    let type: 'string' | 'object' | 'mixed' | 'unknown' = 'unknown'

    for (const el of node.elements) {
      if (!el) continue

      // Resolve element value recursively to handle specific cases if needed, 
      // but for array elements we often expect direct literals. 
      // Checking for identifiers inside array elements is possible but costly? 
      // Let's do a shallow check for now or basic recursion.
      // For shadowing test case, likely we just need constant resolution of strings.
      
      const res = foldConstant(el, scope, importer, depth + 1)
      
      if (!res.isDynamic && typeof res.value === 'string') {
          if (type === 'unknown') type = 'string'
          if (type === 'string') {
            stringElements.push(res.value)
          } else {
            type = 'mixed'
            break
          }
      }
      else if (!res.isDynamic && typeof res.value === 'object' && res.value !== null && !Array.isArray(res.value)) {
           // It's likely an object setup from ObjectExpression below, but foldConstant currently doesn't return single object.
           // Let's handle ObjectExpression explicitly here for element structure
      }
      // Direct ObjectExpression handling to match previous logic
      else if (el.type === 'ObjectExpression') {
         if (type === 'unknown') type = 'object'
         if (type === 'object') {
            const obj: Record<string, string> = {}
            let isSimpleObject = true
            for (const prop of el.properties) {
               if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
                  const valRes = foldConstant(prop.value, scope, importer, depth + 1)
                  if (!valRes.isDynamic && typeof valRes.value === 'string') {
                      obj[prop.key.name] = valRes.value
                  }
               }
               // Ignore complex properties for now
            }
            if (isSimpleObject) {
                objectElements.push(obj)
            }
         } else {
            type = 'mixed'
            break
         }
      }
      else {
        type = 'mixed'
        break
      }
    }

    if (type === 'string') {
      return { value: stringElements, isDynamic: false }
    } else if (type === 'object') {
      return { value: objectElements, isDynamic: false }
    } else {
      return { value: null, isDynamic: true }
    }
  }

  // 3. Identifiers - Lookup Binding
  if (node.type === 'Identifier') {
    const binding = scope.getBinding(node.name)
    if (!binding) return { value: null, isDynamic: true }

    // Handle Imports
    if (binding.kind === 'module') {
       if (binding.path.isImportSpecifier()) {
           const importedName = binding.path.node.imported.name
           const importDecl = binding.path.parentPath.node
           const source = importDecl.source.value
           
           if (importer) {
              const code = importer(source)
              if (code) {
                 const subAst = parseCode(code)
                 if (subAst) {
                    let importedValue: ResolvedValue = { value: null, isDynamic: true }
                    // Traverse the imported file to find the export
                    traverse(subAst, {
                       ExportNamedDeclaration(path: any) {
                          const declaration = path.node.declaration
                          if (declaration?.type === 'VariableDeclaration') {
                             for (const decl of declaration.declarations) {
                                if (decl.id.name === importedName) {
                                   // Found valid export, resolve its value in its own scope (global in that file)
                                   // We create a dummy scope or just resolve based on init node since top level
                                   // For simplicity, we call foldConstant with a dummy scope or standard AST traversal for that node
                                   // Note: Cross-file scope resolution is hard. We'll reuse the logic by passing the sub-file AST path
                                   // But we don't have scope path easily.
                                   // Simplified: Just check the init node directly if it's simple literal.
                                   // Scope usage in imported file is not supported yet (except simple constants)
                                   importedValue = foldConstant(decl.init, { getBinding: () => null }, undefined, depth + 1)
                                }
                             }
                          }
                       }
                    })
                    return importedValue
                 }
              }
           }
       }
       return { value: null, isDynamic: true }
    }

    // Handle Local Variables
    if (binding.path.isVariableDeclarator()) {
       const init = binding.path.node.init
       
       // Unwrap TS expressions
       let valueNode = init
       while (
        valueNode?.type === 'TSAsExpression' || 
        valueNode?.type === 'TSTypeAssertion' || 
        valueNode?.type === 'TSNonNullExpression'
       ) {
        valueNode = valueNode.expression
       }

       return foldConstant(valueNode, scope, importer, depth + 1)
    }
  }

  // 4. Template Literals with Expressions (Recursive)
  if (node.type === 'TemplateLiteral') {
    const resolvedParts: string[] = []
    let isDynamic = false

    for (let i = 0; i < node.quasis.length; i++) {
        const quasi = node.quasis[i]
        resolvedParts.push(quasi.value.cooked || '')
        
        if (i < node.expressions.length) {
            const expr = node.expressions[i]
            const valRes = foldConstant(expr, scope, importer, depth + 1)
            if (!valRes.isDynamic && typeof valRes.value === 'string') {
                resolvedParts.push(valRes.value)
            } else {
                isDynamic = true
                break
            }
        }
    }

    if (!isDynamic) {
        return { value: resolvedParts.join(''), isDynamic: false }
    }
  }

  // 5. Binary Expressions (Concatenation)
  if (node.type === 'BinaryExpression' && node.operator === '+') {
      const left = foldConstant(node.left, scope, importer, depth + 1)
      const right = foldConstant(node.right, scope, importer, depth + 1)

      if (
          !left.isDynamic && typeof left.value === 'string' &&
          !right.isDynamic && typeof right.value === 'string'
      ) {
          return { value: left.value + right.value, isDynamic: false }
      }
  }

  return { value: null, isDynamic: true }
}


/**
 * Resolve namespace from a CallExpression node (e.g., useTranslations('ns'))
 */
function resolveNamespaceFromCall(
  callExpr: any, 
  scope: any,
  importer: ((path: string) => string | undefined) | undefined,
  fileName: string, 
  line: number
): { namespace: string | null; isDynamic: boolean; dynamicPlaceholder?: string } {
  const firstArg = callExpr.arguments[0]
  
  if (!firstArg) {
    return { namespace: null, isDynamic: true, dynamicPlaceholder: `<no-namespace:${fileName}:L${line}>` }
  }
  
  const res = foldConstant(firstArg, scope, importer)

  if (!res.isDynamic && typeof res.value === 'string') {
     return { namespace: res.value, isDynamic: false }
  }
  
  // Template Literal with expressions
  if (firstArg.type === 'TemplateLiteral' && firstArg.expressions.length > 0) {
    const resolvedParts: string[] = []
    let canResolve = true

    for (let i = 0; i < firstArg.quasis.length; i++) {
      resolvedParts.push(firstArg.quasis[i].value.cooked || '')

      if (i < firstArg.expressions.length) {
        const expr = firstArg.expressions[i]
        const valRes = foldConstant(expr, scope, importer)
        if (!valRes.isDynamic && typeof valRes.value === 'string') {
          resolvedParts.push(valRes.value)
        }
        else {
          canResolve = false
          break
        }
      }
    }

    if (canResolve) {
      return { namespace: resolvedParts.join(''), isDynamic: false }
    }
  }

  // If we reached here, it's dynamic
  return { namespace: null, isDynamic: true, dynamicPlaceholder: `<dynamic:${fileName}:L${line}>` }
}

/**
 * Parse TypeScript/JavaScript code and extract useTranslations calls with constant propagation
 */
export function analyzeUseTranslations(
  code: string,
  filePath?: string,
  importer?: (path: string) => string | undefined,
): UseTranslationsAnalysis[] {
  const results: UseTranslationsAnalysis[] = []
  const ast = parseCode(code)
  
  if (!ast) return results

  const fileName = filePath ? path.basename(filePath) : 'unknown'

  traverse(ast, {
    VariableDeclarator(nodePath: any) {
      const id = nodePath.node.id
      const init = nodePath.node.init

      if (id?.type !== 'Identifier')
        return

      // Check for useTranslations() or getTranslations() or await getTranslations()
      let callExpr = init
      if (init?.type === 'AwaitExpression')
        callExpr = init.argument

      if (callExpr?.type !== 'CallExpression')
        return

      const callee = callExpr.callee
      let functionName: string | null = null

      if (callee?.type === 'Identifier') {
        functionName = callee.name
      }
      else if (callee?.type === 'MemberExpression' && callee.property?.type === 'Identifier') {
        functionName = callee.property.name
      }

      if (functionName !== 'useTranslations' && functionName !== 'getTranslations')
        return

      const variableName = id.name
      const line = nodePath.node.loc?.start?.line || 0

      // Use scope from the path to resolve arguments
      const { namespace, isDynamic, dynamicPlaceholder } = resolveNamespaceFromCall(
         callExpr, 
         nodePath.scope, 
         importer, 
         fileName, 
         line
      )

      results.push({
        variableName,
        namespace,
        isDynamic,
        dynamicPlaceholder,
        location: {
          start: nodePath.node.start || 0,
          end: nodePath.node.end || 0,
          line,
        },
      })
    },
  })

  return results
}

/**
 * Find all t('key') usages with namespace prefixing and constant propagation for keys
 * Now supports Array.map iteration and imported constants!
 */
export function analyzeTranslationUsages(
  code: string,
  varNamespaceMap: Map<string, string>, // Optional fallback map
  importer?: (path: string) => string | undefined,
): AnalyzedKey[] {
  const results: AnalyzedKey[] = []
  const ast = parseCode(code)

  if (!ast) return results

  const fileName = 'unknown'

  traverse(ast, {
    CallExpression(nodePath: any) {
      const callee = nodePath.node.callee
      let variableName: string | null = null
      let methodName: string | null = null

      if (callee?.type === 'Identifier') {
        variableName = callee.name
      }
      else if (
        callee?.type === 'MemberExpression'
        && callee.object?.type === 'Identifier'
      ) {
        variableName = callee.object.name
        methodName = callee.property?.name
        // Filter out irrelevant methods if needed, but we check binding later
        if (methodName && !['rich', 'markup', 'raw'].includes(methodName))
           return
      }

      if (!variableName)
        return

      // Scope-based resolution first
      let namespace: string | undefined = undefined
      
      const binding = nodePath.scope.getBinding(variableName)
      if (binding) {
        const init = binding.path.node.init
        let callExpr = init
        if (init?.type === 'AwaitExpression') callExpr = init.argument
        
        if (callExpr?.type === 'CallExpression') {
           const fnName = callExpr.callee?.name || callExpr.callee?.property?.name
           if (fnName === 'useTranslations' || fnName === 'getTranslations') {
              // Now we pass the correct scope for the useTranslations call!
              // The scope should be the one where useTranslations was called (binding scope)
              // Or just nodePath.scope is fine? binding.path.scope is the scope where 't' is defined.
              const bindingScope = binding.path.scope
              const res = resolveNamespaceFromCall(callExpr, bindingScope, importer, fileName, 0)
              if (res.namespace) {
                namespace = res.namespace
              }
           }
        }
      }

      // Fallback to map if scope resolution failed
      if (!namespace && varNamespaceMap.has(variableName)) {
        namespace = varNamespaceMap.get(variableName)
      }

      if (!namespace && !varNamespaceMap.has(variableName)) {
         return 
      }

      const firstArg = nodePath.node.arguments[0]
      if (!firstArg)
        return

      let keysToEmit: string[] = [] // Support multiple keys for one location
      let locationNode = firstArg
      
      const valRes = foldConstant(firstArg, nodePath.scope, importer)

      // 1. Single String (Literal or Constant)
      if (!valRes.isDynamic && typeof valRes.value === 'string') {
          keysToEmit.push(valRes.value)
      }
      // 2. Map Iteration (Array) handled via Scope Binding checks on Argument
      // foldConstant might fail for 'cat' in map(cat => ...), so we need specific logic for map params
      else if (firstArg.type === 'Identifier') {
          // Check if it's a map parameter
          const binding = nodePath.scope.getBinding(firstArg.name)
          if (binding && binding.kind === 'param') {
            const fnPath = binding.path.parentPath
            if (fnPath.parentPath?.isCallExpression()) {
              const callExprPath = fnPath.parentPath
              const callCallee = callExprPath.get('callee')
              
              if (callCallee.isMemberExpression()) {
                  const property = callCallee.get('property')
                  const object = callCallee.get('object')

                  if (property.isIdentifier({ name: 'map' }) && object.isIdentifier()) {
                     // Resolve array constant!
                     const arrayRes = foldConstant(object.node, nodePath.scope, importer)
                     
                     if (!arrayRes.isDynamic && Array.isArray(arrayRes.value)) {
                         // String Array
                         if (arrayRes.value.length > 0 && typeof arrayRes.value[0] === 'string') {
                             keysToEmit.push(...(arrayRes.value as string[]))
                         }
                     }
                  }
              }
            }
          }
      }
      // 3. Object Map Iteration e.g. section.label
      else if (firstArg.type === 'MemberExpression' && firstArg.property.type === 'Identifier') {
          const propertyName = firstArg.property.name
          const objectName = firstArg.object.type === 'Identifier' ? firstArg.object.name : null
          
          if (objectName) {
              const binding = nodePath.scope.getBinding(objectName)
              if (binding && binding.kind === 'param') {
                  const fnPath = binding.path.parentPath
                   if (fnPath.parentPath?.isCallExpression()) {
                      const callExprPath = fnPath.parentPath
                      const callCallee = callExprPath.get('callee')
                      
                      if (callCallee.isMemberExpression()) {
                          const property = callCallee.get('property')
                          const object = callCallee.get('object')
                          
                          if (property.isIdentifier({ name: 'map' }) && object.isIdentifier()) {
                             const arrayRes = foldConstant(object.node, nodePath.scope, importer)

                             if (!arrayRes.isDynamic && Array.isArray(arrayRes.value)) {
                                 const values = arrayRes.value
                                 if (values.length > 0 && typeof values[0] === 'object') {
                                     for (const item of values as Record<string, string>[]) {
                                         if (item[propertyName]) {
                                             keysToEmit.push(item[propertyName])
                                         }
                                     }
                                 }
                             }
                          }
                      }
                   }
              }
          }
      }

      if (keysToEmit.length > 0) {
        for (const key of keysToEmit) {
            const fullKey = namespace ? `${namespace}.${key}` : key
            results.push({
              key: fullKey,
              start: locationNode.start || 0,
              end: locationNode.end || 0,
              quoted: firstArg.type === 'StringLiteral' || firstArg.type === 'TemplateLiteral',
              variableName,
              namespace,
            })
        }
      }
    },
  })

  return results
}
