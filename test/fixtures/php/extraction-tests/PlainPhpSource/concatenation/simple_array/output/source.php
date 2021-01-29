<?php
$arrayExample = ['key' => 'value'];

$msg = $translator->trans('hardcoded_array_key', ['arrayExample' => $arrayExample['key']]);
