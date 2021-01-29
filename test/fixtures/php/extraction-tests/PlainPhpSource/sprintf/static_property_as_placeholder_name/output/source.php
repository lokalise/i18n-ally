<?php
class MyClass
{
    const MODEL_NAME = 'st';
}

echo $translator->trans('constant', ['MODEL_NAME' => MyClass::MODEL_NAME]);