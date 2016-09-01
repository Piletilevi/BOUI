<?php

require_once __DIR__.'/../config.php';
require_once __DIR__.'/../vendor/autoload.php';

use Slim\Slim;
use Slim\Logger\DateTimeFileWriter;
use phpFastCache\CacheManager;

$app = new Slim(
	array(
		"settings"   => $config,
		"log.writer" => new DateTimeFileWriter( $config['log'] )
	)
);

$app->container->set('cacheManager', function() use ($app) { 
	$settings = $app->config("settings");
	return CacheManager::getInstance('files', $settings['cache']); 
});

$app->container->set('piletileviApi', function() use ($app) { 
	return PiletileviApi::getInstance(); 
});

$app->container->set('piletileviSessionHandler', function() use ($app) { 
	return PiletileviSessionHandler::getInstance(); 
});

$app->container->set('dataHandler', function() use ($app) { 
	return DataHandler::getInstance(); 
});

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