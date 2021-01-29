<?php
$name = 'John';

$msg = $translator->trans('welcome', ['trim' => trim($name)]);
