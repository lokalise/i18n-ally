<?php
$name = 'John';

throw new \Exception($translator->trans('welcome', ['name' => $name]));
