<?php

require_once __DIR__.'/../config.php';
require_once __DIR__.'/../vendor/autoload.php';

use Slim\Slim; 

$app = new Slim(array("settings" => $config));

$directories = array(
	'classes/',
	'db/',
	'common/',
);

foreach ($directories as $directory) {
	foreach(glob($directory . "*.php") as $class) {
        include_once $class;
    }
}

$app->run();

?>