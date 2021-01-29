<?php
$name = 'John';

class User {
    function get($arg) {
        return $arg;
    }

    function index($name) {
        return $translator->trans('welcome_and', ['get' => $this->get($name), 'get_2' => $this->get(trim($name))]);
    }
}

$user = new User();
echo $user->index($name);
