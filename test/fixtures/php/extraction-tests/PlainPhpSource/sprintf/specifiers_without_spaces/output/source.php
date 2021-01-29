<?php
$name = 'John';
$price = 10;

$msg = $translator->trans('welcome_dawn_of_serral', ['price' => (int)$price, 'name' => $name]);
