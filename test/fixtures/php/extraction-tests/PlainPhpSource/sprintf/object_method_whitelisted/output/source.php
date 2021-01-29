<?php
$name = 'John';

class User {
    function setErrorMessage($param) {
        return $param;
    }
}

$user = new User();
$msg = $user->setErrorMessage($translator->trans('welcome', ['name' => $name]));
