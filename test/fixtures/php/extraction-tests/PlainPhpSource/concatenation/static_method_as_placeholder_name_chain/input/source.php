<?php
class MyClass
{
    static function create() {
        return new \stdClass();
    }
}

echo "Method: " . MyClass::create()->someMethod();