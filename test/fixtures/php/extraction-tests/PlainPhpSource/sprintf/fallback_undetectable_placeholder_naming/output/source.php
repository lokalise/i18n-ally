<?php
$name = 'John';

$msg = $translator->trans('welcome', ['expr' => !empty($name) ? trim($name) : $name]);
