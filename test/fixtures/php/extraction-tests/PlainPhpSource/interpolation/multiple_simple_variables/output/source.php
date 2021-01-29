<?php
$name = 'John';
$price = 10.50;

$msg = $translator->trans('price_for', ['name' => $name, 'price' => $price]);
