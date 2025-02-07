// @ts-ignore
import { Parser } from "./base";
import {
  Array as PhpArray,
  Engine,
  Entry,
  Node,
  Return,
  String
} from "php-parser";
import { KeyInDocument } from "~/core";

export class PhpParser extends Parser {
  id = "php";
  readonly = false;
  phpParser: Engine = new Engine({
    // some options :
    parser: {
      extractDoc: true,
      php7: true
    },
    ast: {
      withPositions: true
    }
  });

  constructor() {
    super(["php"], "php");
  }

  async parse(text: string) {
    // Remove left part of return expression and any ending `?>`.
    const programme = this.phpParser.parseCode(text, "");
    if (!programme.children.length && programme.children[0].kind != "return")
      return {};

    const returnChild = programme.children[0] as Return;
    if (returnChild.expr?.kind != "array") {
      return {};
    }
    const returnExpression = returnChild.expr;

    return this.parsePhpArray(returnExpression);
  }

  async dump(
    object: object,
    sort: boolean,
    compare: ((x: string, y: string) => number) | undefined
  ) {
    const indent =
      this.options.tab === "\t"
        ? this.options.tab
        : " ".repeat(this.options.indent);

    return `<?php

${indent.repeat(1)}return ${this.arrayToPhp(object, indent, 2, sort, compare)};
    
    `;
  }

  annotationSupported = true;
  annotationLanguageIds = ["php"];

  parseAST(text: string) {
    const programme = this.phpParser.parseCode(text, "");
    if (!programme.children.length && programme.children[0].kind != "return")
      return [];

    const returnChild = programme.children[0] as Return;
    if (returnChild.expr?.kind != "array") {
      return [];
    }
    const returnExpression = returnChild.expr;

    return this.phpToAST(returnExpression, "");
  }


  private phpToAST(initialData: Node, parent: string): KeyInDocument[] {
    if (initialData.kind != "array") {
      return [];
    }

    const array = initialData as PhpArray;
    return array.items
      .filter(item => {
        const entery = item as Entry;
        if (item.kind != "entry") {
          return false;
        }

        if (entery.key?.kind != "string") {
          return false;
        }

        if (entery.value?.kind != "string" && entery.value?.kind != "array") {
          return false;
        }

        if (!entery.value.loc) {
          return false;
        }

        return true;
      })
      .map((item): KeyInDocument | KeyInDocument[] => {
        const entery = item as Entry;
        const keyString = ((entery.key as unknown) as String).value;

        if (entery.value.kind == "array") {
          return this.phpToAST(entery.value, keyString);
        }

        return {
          quoted: true,
          key: parent ? `${parent}.${keyString}` : keyString,
          start: entery.value.loc?.start.offset ?? 0,
          end: entery.value.loc?.end.offset ?? 0
        };
      })
      .flatMap(item => (Array.isArray(item) ? item : [item]));
  }

  private parsePhpArray(initialData: Node) {
    if (initialData.kind != "array") {
      return {};
    }

    const returnValue = {} as Record<string, any>;
    const array = initialData as PhpArray;

    array.items.forEach(item => {
      const entery = item as Entry;

      if (item.kind != "entry") {
        return;
      }

      if (entery.key?.kind != "string") {
        return;
      }

      const keyString = ((entery.key as unknown) as String).value;

      if (entery.value?.kind != "string" && entery.value?.kind != "array") {
        return;
      }

      if (entery.value.kind == "string") {
        returnValue[keyString] = ((entery.value as unknown) as String).value;
      } else if (entery.value.kind == "array") {
        returnValue[keyString] = this.parsePhpArray(entery.value);
      }
    });

    return returnValue;
  }

  private arrayToPhp(
    object: object,
    identEl: string,
    indent: number,
    sort: boolean,
    compare: ((x: string, y: string) => number) | undefined
  ): string {
    if (typeof object == "string") {
      return `"${object}"`;
    }

    if (typeof object == "boolean") {
      return object ? "true" : "false";
    }

    if (typeof object == "number") {
      return object;
    }

    const indentation = identEl.repeat(indent);

    if (typeof object === "object") {
      let entries = Object.entries(object);
      if (sort) {
        entries.sort(([keyA], [keyB]) =>
          compare ? compare(keyA, keyB) : keyA.localeCompare(keyB)
        );
      }

      return (
        "[\n" +
        entries
          .map(
            ([key, value]) =>
              `${indentation}    "${key}" => ${this.arrayToPhp(
                value,
                identEl,
                indent + 1,
                sort,
                compare
              )}`
          )
          .join(",\n") +
        "\n" +
        indentation +
        "]"
      );
    }

    return "";
  }
}
