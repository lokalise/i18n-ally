<?php
$objectExample = new \stdClass();

$msg = $translator->trans('welcome', ['property' => $objectExample->property]);
