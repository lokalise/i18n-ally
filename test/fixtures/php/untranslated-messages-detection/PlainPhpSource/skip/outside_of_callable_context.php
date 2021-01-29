<?php

define('OUTSIDE_OF_CALLABLE_CONTEXT', 42);

const OUTSIDE_OF_CALLABLE_CONTEXT_1 = 'Default';

class FalsePositivesController extends AbstractController
{
    static $outsideOfCallableContext_2 = 'Default';

    const OUTSIDE_OF_CALLABLE_CONTEXT_3 = 'Default';

    function index ($outsideOfCallableContext5 = 'Default value') {
        $closure = function (string $outsideOfCallableContext6 = 'Default value') {
            return $outsideOfCallableContext6;
        };
    }
}