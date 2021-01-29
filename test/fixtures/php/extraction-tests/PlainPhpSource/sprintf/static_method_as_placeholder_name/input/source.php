<?php
class MyClass
{
    static function showConstant() {
        return 'st';
    }
}

echo sprintf("Method: %s", MyClass::showConstant());