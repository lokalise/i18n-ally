<?php
$name = 'John';

$msg = $translator->trans('welcome_and', ['trim' => trim($name), 'trim_2' => trim(strip_tags($name))]);
