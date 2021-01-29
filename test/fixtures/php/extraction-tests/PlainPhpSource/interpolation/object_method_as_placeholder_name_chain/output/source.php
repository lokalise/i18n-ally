<?php
$event = new \stdClass();

$msg = $translator->trans('welcome', ['get' => $event->getRequest()->headers->get()]);
