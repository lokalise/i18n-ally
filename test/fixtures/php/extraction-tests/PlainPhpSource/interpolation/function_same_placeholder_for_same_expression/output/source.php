<?php
$name = 'John';

$msg = $translator->trans('welcome_and', ['trim' => trim($name)]);
