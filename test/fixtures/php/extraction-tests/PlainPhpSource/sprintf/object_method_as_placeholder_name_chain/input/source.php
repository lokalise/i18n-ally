<?php
$event = new \stdClass();

$msg = sprintf("Welcome, %s!", $event->getRequest()->headers->get());
