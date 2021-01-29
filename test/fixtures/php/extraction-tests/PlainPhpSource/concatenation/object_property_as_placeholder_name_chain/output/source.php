<?php
$objectExample = new \stdClass();

$msg = $translator->trans('welcome', ['anotherProperty' => $objectExample->property->anotherProperty]);
