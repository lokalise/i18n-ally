<?php
$name = 'John';
$generic = 'customer';

$msg = $translator->trans('welcome', ['expr' => (!empty($name) ? $name : $generic)]);
