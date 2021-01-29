<?php
$key = 'key';
$arrayExample = ['key' => 'value'];

$msg = $translator->trans('both_and_are_valid', ['arrayExample' => $arrayExample[$key]]);
