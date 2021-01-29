<?php
$price = 10;

$msg = $translator->trans('welcome', ['price' => sprintf('%\'.9d', $price)]);
