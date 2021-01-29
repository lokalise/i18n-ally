<?php
class MyClass
{
    static function create() {
        return new \stdClass();
    }
}

echo sprintf("Method: %s", MyClass::create()->someMethod());