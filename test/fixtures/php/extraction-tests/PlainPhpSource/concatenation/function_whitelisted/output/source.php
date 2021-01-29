<?php
$name = 'John';

$msg = purpose($translator->trans('welcome', ['name' => $name]));

$msg = notInWhileList('Welcome ' . $name);
