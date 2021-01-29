<?php
$key = 'key';
$key2 = 'key2';
$arrayExample = ['key' => 'value'];

$msg = $translator->trans('userfacing_string_and', ['arrayExample' => $arrayExample[$key], 'arrayExample_2' => $arrayExample[$key2]]);
