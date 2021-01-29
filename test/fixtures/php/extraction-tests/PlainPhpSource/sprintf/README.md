A conversion specification follows this prototype:
```
%[argnum$][flags][width][.precision]specifier
```
© https://www.php.net/manual/en/function.sprintf.php

Plugin supports only `s` and `d` as specifiers (`d` replaced by casting to integer),
all other specifiers should be replaced by a smaller `sprintf` as a fallback.

If there is any `flags`, `width` or `precision` then
plugin should apply a fallback.

In this way we are getting things done
while leaving a room for manual fixed by developer if needed.
