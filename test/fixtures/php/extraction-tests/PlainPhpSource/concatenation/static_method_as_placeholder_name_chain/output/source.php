<?php
class MyClass
{
    static function create() {
        return new \stdClass();
    }
}

echo $translator->trans('method', ['someMethod' => MyClass::create()->someMethod()]);