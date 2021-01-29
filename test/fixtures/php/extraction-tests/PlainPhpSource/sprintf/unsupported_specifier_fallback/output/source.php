<?php
$price = 10.15;

$msg = $translator->trans('welcome', ['price' => sprintf('%f', $price)]);
