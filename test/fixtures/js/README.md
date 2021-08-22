Extraction tests runs automatically.

Prepare tests in this format:
```
source class name/
├─ expression_from_extraction (concatenation, interpolation, functions, methods)/
│  ├─ test_case_name/
│  │  ├─ input/
│  │  │  ├─ source files
│  │  │  ├─ sink file
│  │  ├─ output/
│  │  │  ├─ changed input files (source, sinks, etc)
```

# Test structure
```
<?php                                  // setup test data so test compiles
$name = 'John';                        //

$msg = sprintf('Welcome, %s!', $name); // prepare the last expression
                                       // that should trigger the extraction intention.
                                       // ONLY the last intention would be executed
```

# Style guide

### Use underscores to separate words in folder and file names
```
// bad
function as placeholder name
function-as-placeholder-name
function_as-placeholder-name

// GOOD
function_as_placeholder_name
```

### Use lower case letters in files and folders names
```
// bad
Skip_html
skip_HTML

// GOOD
skip_html
```

### Omit articles (`a`, `the`)
```
// bad
skip_the_html

// GOOD
skip_html
```

### Omit strings word as we always deal with strings during code inspections/extraction
```
// bad
strings_interpolation

// GOOD
interpolation
```