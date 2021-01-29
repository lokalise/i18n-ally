<?php

class User {

    public $attribute;

    function index() {
        return $translator->trans('welcome', ['attribute' => $this->attribute]);
    }
}
