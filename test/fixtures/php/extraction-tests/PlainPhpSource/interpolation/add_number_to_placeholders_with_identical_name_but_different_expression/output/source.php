<?php
$key = 'key';
$arrayExample = ['key' => 'value'];

$msg = $translator->trans('both_and_are_valid', ['arrayExample' => $arrayExample['key'], 'arrayExample_2' => $arrayExample[$key]]);
