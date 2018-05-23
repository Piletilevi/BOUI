<?php

require_once __DIR__.'/../config.php';
require_once __DIR__.'/../vendor/autoload.php';

use \Slim\Logger\DateTimeFileWriter;
use phpFastCache\CacheManager;

$app = new \Slim\App(
	array(
		"settings"   => $config
	)
);

$container = $app->getContainer();

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

$container['cacheManager'] = function($c) { 
	$settings = $c->get("settings");
	return CacheManager::getInstance('files', $settings['cache']); 
};

$container['piletileviApi'] = function($c) { 
	return PiletileviApi::getInstance(); 
};

$container['piletileviSessionHandler'] = function($c) { 
	return PiletileviSessionHandler::getInstance(); 
};

$container['dataHandler'] = function($c) { 
	return DataHandler::getInstance(); 
};

$container['logger'] = function($c) {
	$settings = $c->get("settings");
    return new DateTimeFileWriter( $settings['log'] );
};

$container['view'] = function($c) { 
	$view = new \Slim\Views\Smarty(__DIR__.'/../templates', [
        'cacheDir' => __DIR__.'/../cache/html',
		'compileDir' => __DIR__.'/../compile',
        'pluginsDir' => [__DIR__.'/../plugins']
    ]);
    
    // Add Slim specific plugins
    $smartyPlugins = new \Slim\Views\SmartyPlugins($c['router'], $c['request']->getUri());
    $view->registerPlugin('function', 'path_for', [$smartyPlugins, 'pathFor']);
    $view->registerPlugin('function', 'base_url', [$smartyPlugins, 'baseUrl']);

    return $view;
};

$container['notFoundHandler'] = function ($c) {
    return function ($request, $response) use ($c) {
        return $c['view']->render($response->withStatus(404), '404.tpl', [
            "myMagic" => "Let's roll"
        ]);
    };
};

$app->run();

?>