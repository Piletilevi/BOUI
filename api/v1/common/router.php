<?php

$app->get('/session', function() {
	$sessionHandler = new PiletileviSessionHandler();
    $session = $sessionHandler->getSession();
    $response["user"] = $session["user"];
    
	DataHandler::response(200, $response);
});

$app->get('/sessionlang', function() {
    $sessionHandler = new PiletileviSessionHandler();
    $session = $sessionHandler->getSession();
    $response["lang"] = $session["lang"];

    DataHandler::response(200, $response);
});

$app->get('/bourl', function() {
    $piletileviApi = new PiletileviApi();
    $urlReq = $piletileviApi->boUrl();
    if ($urlReq){
		$response['status'] = "succcess";
		$response['message'] = 'BO URL retrieved';
		$response['bobaseurl'] = $urlReq;
    }else {
        $response['status'] = "error";
        $response['message'] = 'No BO url defined ';
    }

    DataHandler::response(200, $response);
});

$app->post('/getSessionKey', function() use ($app) {
    $r = json_decode($app->request->getBody());

    $app->log->debug( print_r($r,true) );

	DataHandler::verifyParams(array('username', 'clientip'), $r);

    $sessionHandler = new PiletileviSessionHandler();
    $session = $sessionHandler->getSession();
    $username = $r->username;
    $ip = $r->clientip;

    $piletileviApi = new PiletileviApi();
    $sessionReq = $piletileviApi->getSessionKey($username, $ip, $session['lang']->code);

    if ($sessionReq && !empty($sessionReq->data)) {
        $response['status'] = "success";
        $response['message'] = 'Successfully retrieved session key';

        $response['boSession'] = $sessionReq->data[0];
    } else {
        $response['status'] = "error";
        $response['message'] = 'Failed to retrieve session key';
    }
    
    DataHandler::response(200, $response);
});

$app->post('/setlanguage', function() use ($app) {
    $r = json_decode($app->request->getBody());

	DataHandler::verifyParams(array('code', 'name'), $r->lang);
    
	if (!isset($_SESSION)) {
        session_start();
    }
    if (!empty($r) ){
        $_SESSION['lang'] = $r->lang;
		$response['status'] = "success";
		$response['message'] = 'Language set successfully.';
    } else {
        $response['status'] = "failure";
        $response['message'] = 'Language set unsuccessfully.';
    }
    DataHandler::response(200, $response);
});

$app->post('/verifySessionKey', function() use ($app) {

    $r = json_decode($app->request->getBody());

    DataHandler::verifyParams(array('sessionkey'), $r);

    $sessionkey = $r->sessionkey;


    $piletileviApi = new PiletileviApi();
    $userData = $piletileviApi->verifySessionKey($sessionkey);

    if ($userData && $userData->valid == "true" && $userData->user) {
        $response['status'] = "success";
        $response['message'] = 'Verified session successfully.';

        $response['user'] = $userData->user;

        if (!isset($_SESSION)) {
            session_start();
        }
        $_SESSION['user'] = $userData->user;
    } else {
        $response['status'] = "error";
        $response['message'] = 'Not a valid session key.';
    }

    DataHandler::response(200, $response);
});

$app->post('/login', function() use ($app) {

	$r = json_decode($app->request->getBody());
	
	DataHandler::verifyParams(array('username', 'password', 'clientip'), $r->customer);

    $username = $r->customer->username;
	$password = $r->customer->password;
	$clientip = $r->customer->clientip;
	
	$piletileviApi = new PiletileviApi();
	$userData = $piletileviApi->login($username, $password, $clientip);

    if ($userData && $userData->valid == "true" && $userData->user) {
		$response['status'] = "success";
        $response['message'] = 'Logged in successfully.';
		
        $response['user'] = $userData->user;

		if (!isset($_SESSION)) {
            session_start();
        }
        $_SESSION['user'] = $userData->user;
    } else {
		$response['status'] = "error";
		$response['message'] = 'No such user is registered';
	}

	DataHandler::response(200, $response);
});

$app->get('/logout', function() {
    $sessionHandler = new PiletileviSessionHandler();
    $session = $sessionHandler->destroySession();
    $response["status"] = "info";
    $response["message"] = "Logged out successfully";

	DataHandler::response(200, $response);
});

$app->get('/languages', function() use ($app) {

	$piletileviApi = new PiletileviApi();
    $languages = $piletileviApi->languages();

    $response["status"] = "success";
    $response["languages"] = $languages->data;

    $app->log->debug( print_r($response,true) );

	DataHandler::response(200, $response);
});

$app->post('/translations', function() use ($app)  {

	$r = json_decode($app->request->getBody());

	$app->log->debug( print_r($r,true) );

    DataHandler::verifyParams(array('languageId'), $r);

    $languageId= $r->languageId;

    $piletileviApi = new PiletileviApi();
    $translations = $piletileviApi->translations($languageId);

    $response["status"] = "success";

	if (!empty( $translations->data)) {
        $response["translations"] = $translations->data->translations;
	}

    DataHandler::response(200, $response);
});



?>