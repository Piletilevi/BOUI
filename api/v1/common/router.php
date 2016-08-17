<?php 

$app->get('/session', function() {
	$sessionHandler = new PiletileviSessionHandler();
    $session = $sessionHandler->getSession();
    $response["user"] = $session['user'];
    
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
    $piletileviApi = new PiletileviApi();
    $languages = $piletileviApi->languages();
    $response["status"] = "info";
    $response["message"] = "Logged out successfully";
    $response["languages"] = $languages;

    DataHandler::response(200, $response);
});

?>