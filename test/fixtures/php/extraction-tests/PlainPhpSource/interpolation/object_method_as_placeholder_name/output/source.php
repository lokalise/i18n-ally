<?php
$event = new \stdClass();

$msg = $translator->trans('welcome', ['getRequest' => $event->getRequest()]);
