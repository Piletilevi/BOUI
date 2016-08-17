<?php

$app->hook('slim.after.router', function () use ($app) {
    $request = $app->request;
    $response = $app->response;

    $app->log->debug('Request path: ' . $request->getPathInfo());
    $app->log->debug('Response status: ' . $response->getStatus());

});
?>