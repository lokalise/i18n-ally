<?php
$name = 'John';

class User {
    function get($arg) {
        return $arg;
    }

    function index($name) {
        return "Welcome, {$this->get($name)}!";
    }
}
