<?php
$name = 'John';

class User {
    function get($arg) {
        return $arg;
    }

    function index($name) {
        return $translator->trans('welcome', ['get' => $this->get($name)]);
    }
}
