<?php
use \Slim\Logger\DateTimeFileWriter;


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

$app->post('/getSessionKey', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $logger = new DateTimeFileWriter(array(
        'path' => __DIR__.'/../../../logs',
        'name_format' => 'Y-m-d',
        'message_format' => '%label% - %date% - %message%'
    ));

    /*DataHandler::verifyParams(array('username', 'password'), $r->user);*/
    $sessionHandler = new PiletileviSessionHandler();
    $session = $sessionHandler->getSession();
    //$logger->write( print_r($r,true),"INFO");
    $username = $r->username;

    $piletileviApi = new PiletileviApi();
    $sessionReq = $piletileviApi->getSessionKey($username, $app->request->getIp(),$session['lang']->code);
    $logger->write( print_r($app->request->getIp(),true),"INFO");
    if ($sessionReq && !empty($sessionReq->data)) {
        $response['status'] = "success";
        $response['message'] = 'Successfully retrieved session key';

        $response['boSession'] = $sessionReq->data[0];
    } else {
        $response['status'] = "error";
        $response['message'] = 'Failed to get session key';
    }
    if  (isset($_SERVER)) {
    $logger->write( print_r($_SERVER,true),"INFO");
    }
    else $logger->write( "no server","INFO");
    DataHandler::response(200, $response);
});

$app->post('/setlanguage', function() use ($app) {
    $r = json_decode($app->request->getBody());
    DataHandler::verifyParams(array('code', 'name'), $r->lang);
    if (!isset($_SESSION)) {
        session_start();
    }
    if ( !empty($r) ){
        $_SESSION['lang'] = $r->lang;
    $response['status'] = "success";
    $response['message'] = 'Language  set successfully.';
    }
    else {
        $response['status'] = "failure";
        $response['message'] = 'Language  set unsuccessfully.';
    }
    DataHandler::response(200, $response);
});
$app->post('/login', function() use ($app) {

	$r = json_decode($app->request->getBody());
	
	DataHandler::verifyParams(array('username', 'password'), $r->customer);

    $username = $r->customer->username;
	$password = $r->customer->password;
	
	$piletileviApi = new PiletileviApi();
	$userData = $piletileviApi->login($username, $password, $app->request->getIp());

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


$app->get(
    '/languages', function() {
    $logger = new DateTimeFileWriter(array(
        'path' => __DIR__.'/../../../logs',
        'name_format' => 'Y-m-d',
        'message_format' => '%label% - %date% - %message%'
    ));
    $piletileviApi = new PiletileviApi();
    $languages = $piletileviApi->languages();

    $response["status"] = "success";
    $response["message"] = "Got languages";
    //foreach ($languages->data as $language){

      $response["languages"] = $languages->data;
   // }

    $logger->write( print_r($response,true),"INFO");
    DataHandler::response(200, $response);
});
$app->post(
    '/translations', function() use ($app)  {
    $logger = new DateTimeFileWriter(array(
        'path' => __DIR__.'/../../../logs',
        'name_format' => 'Y-m-d',
        'message_format' => '%label% - %date% - %message%'
    ));
    $r = json_decode($app->request->getBody());
    $logger->write(print_r($r,true),"INFO");
    DataHandler::verifyParams(array('languageId'), $r);

    $languageId= $r->languageId;

    $piletileviApi = new PiletileviApi();
    $translations = $piletileviApi->translations($languageId);

    $response["status"] = "success";
    $response["message"] = "Got translations";
    //$logger->write( print_r($translations,true),"INFO");


        $response["translations"] = $translations->data->translations;



    DataHandler::response(200, $response);
});



?>