<?php

class User {

    public $attribute;

    function index() {
        return "Welcome, {$this->attribute}!";
    }
}
