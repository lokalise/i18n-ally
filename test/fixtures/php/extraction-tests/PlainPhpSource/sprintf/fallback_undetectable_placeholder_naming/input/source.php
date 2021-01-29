<?php
$name = 'John';

$msg = sprintf('Welcome, %s!', !empty($name) ? trim($name) : $name);
