<?php
class MyClass
{
    static function showConstant() {
        return 'st';
    }
}

echo $translator->trans('method', ['showConstant' => MyClass::showConstant()]);