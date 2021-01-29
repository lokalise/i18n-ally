<?php
$name = 'John';
$price = 10;

$msg = $translator->trans('welcome', ['price' => (int)$price, 'name' => $name]);
