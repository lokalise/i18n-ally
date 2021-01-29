<?php
$name = 'John';
$last = 'Doe';

$msg = $translator->trans('welcome', ['name' => $name, 'last' => $last]);
