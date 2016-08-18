<?php

require_once __DIR__.'/../config.php';
require_once __DIR__.'/../vendor/autoload.php';

use Slim\Slim;
use Slim\Logger\DateTimeFileWriter;

$app = new Slim(array("settings" => $config,
    'log.writer' => new DateTimeFileWriter(array(
        'path' => __DIR__.'/../../logs',
        'name_format' => 'Y-m-d',
        'message_format' => '%label% - %date% - %message%'
    ))));

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