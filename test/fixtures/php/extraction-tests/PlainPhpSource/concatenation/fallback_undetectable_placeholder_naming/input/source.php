<?php
$name = 'John';
$generic = 'customer';

$msg = 'Welcome, ' . (!empty($name) ? $name : $generic) . '!';
