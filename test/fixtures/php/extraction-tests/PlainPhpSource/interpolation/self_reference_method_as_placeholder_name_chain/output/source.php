<?php

class User {
    function get($arg) {
        return $arg;
    }

    function index($name) {
        return $translator->trans('welcome', ['method' => $this->get($name)->attribute->method()]);
    }
}
