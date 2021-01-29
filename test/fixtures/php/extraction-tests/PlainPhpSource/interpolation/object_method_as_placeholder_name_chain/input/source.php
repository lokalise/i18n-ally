<?php
$event = new \stdClass();

$msg = "Welcome, {$event->getRequest()->headers->get()}!";
