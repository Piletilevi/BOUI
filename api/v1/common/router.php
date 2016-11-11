<?php

$app->get('/session', function() use ($app) {
	$sessionHandler = $app->container->get("piletileviSessionHandler");
    $session = $sessionHandler->getSession();
    $response["user"] = $session["user"];
    
	$dataHandler = $app->container->get("dataHandler");
	$dataHandler->response(200, $response);
});

$app->get('/sessionLang', function() use ($app) {
    $sessionHandler = $app->container->get("piletileviSessionHandler");
    $session = $sessionHandler->getSession();
    $response["lang"] = $session["lang"];

	$dataHandler = $app->container->get("dataHandler");
	$dataHandler->response(200, $response);
});

$app->get('/boUrl', function() use ($app) {
    $piletileviApi = $app->container->get("piletileviApi");
    $urlReq = $piletileviApi->boUrl();
    if ($urlReq){
		$response['status'] = "success";
		$response['message'] = 'BO URL retrieved';
		$response['boBaseUrl'] = $urlReq;
    }else {
        $response['status'] = "error";
        $response['message'] = 'No BO url defined ';
    }

	$dataHandler = $app->container->get("dataHandler");
	$dataHandler->response(200, $response);
});

$app->post('/getSessionKey', function() use ($app) {
    $r = json_decode($app->request->getBody());

    $app->log->debug( print_r($r,true) );
	$dataHandler = $app->container->get("dataHandler");

	$dataHandler->verifyParams(array('username', 'clientip'), $r);

    $sessionHandler = $app->container->get("piletileviSessionHandler");
    $session = $sessionHandler->getSession();
    $username = $r->username;
    $ip = $r->clientip;

    $piletileviApi = $app->container->get("piletileviApi");
    $sessionReq = $piletileviApi->getSessionKey($username, $ip);

    if ($sessionReq && !empty($sessionReq->data)) {
        $response['status'] = "success";
        $response['message'] = 'Successfully retrieved session key';

        $response['boSession'] = $sessionReq->data[0];
    } else {
        $response['status'] = "error";
        $response['message'] = 'Failed to retrieve session key';
    }
    
	$dataHandler->response(200, $response);
});

$app->post('/setLanguage', function() use ($app) {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('code', 'name'), $r->lang);
    
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

	$dataHandler->response(200, $response);
});

$app->post('/setPoint', function() use ($app) {
    $dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

    $dataHandler->verifyParams(array('pointId'), $r);

    if (!isset($_SESSION)) {
        session_start();
    }
    if (!empty($r) ){
        $_SESSION['user']->point = $r->pointId;
        $response['status'] = "success";
        $response['message'] = 'Point set successfully.';
    } else {
        $response['status'] = "failure";
        $response['message'] = 'Point set unsuccessfully.';
    }

    $dataHandler->response(200, $response);
});

$app->post('/verifySessionKey', function() use ($app) {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

    $dataHandler->verifyParams(array('sessionkey'), $r);

    $sessionkey = $r->sessionkey;

    $piletileviApi = $app->container->get("piletileviApi");
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

	$dataHandler->response(200, $response);
});

$app->post('/login', function() use ($app) {
    $dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

    $dataHandler->verifyParams(array('username', 'password', 'clientip'), $r->customer);

    $username = $r->customer->username;
    $password = $r->customer->password;
    $clientip = $r->customer->clientip;

    $piletileviApi = $app->container->get("piletileviApi");
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

    $dataHandler->response(200, $response);
});

$app->post('/myEvents', function() use ($app) {
    $dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$app->log->debug( print_r($r,true) );

	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['name'] = $r->filter->name;
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $myEvents = $piletileviApi->myEvents($filter);

	if ($myEvents) {
        $response['status'] = "success";
        $response['data'] = $myEvents;
    } else {
        $response['status'] = "error";
    }

	$dataHandler->response(200, $response);
});

$app->post('/changePassword', function() use ($app) {
    $dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

    $dataHandler->verifyParams(array('oldPassword', 'newPassword'), $r->passwordSet);

    $oldPassword = $r->passwordSet->oldPassword;
    $newPassword = $r->passwordSet->newPassword;

	$piletileviApi = $app->container->get("piletileviApi");
    $data = $piletileviApi->changePassword( $oldPassword, $newPassword );
    
	$app->log->debug( print_r($data,true) );
    $app->log->debug( print_r($data->data->success,true) );
    
	if ($data && $data->data->success == "true" ) {
        $response['status'] = "success";
        $response['message'] = 'Password changed successfully.';

    } else {
        $response['status'] = "error";
        $response['message'] = 'Password change failed';
    }

    $dataHandler->response(200, $response);
});

$app->get('/logout', function() use ($app) {
	$dataHandler = $app->container->get("dataHandler");
    $sessionHandler = $app->container->get("piletileviSessionHandler");
    $session = $sessionHandler->destroySession();
    $response["status"] = "info";
    $response["message"] = "Logged out successfully";

	$dataHandler->response(200, $response);
});

$app->get('/languages', function() use ($app) {
	$dataHandler = $app->container->get("dataHandler");
	$piletileviApi = $app->container->get("piletileviApi");
    $languages = $piletileviApi->languages();

    $response["status"] = "success";
    $response["languages"] = $languages->data;

	$dataHandler->response(200, $response);
});

$app->post('/translations', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
	$r = json_decode($app->request->getBody());

    $dataHandler->verifyParams(array('languageId'), $r);

    $languageId = $r->languageId;

    $piletileviApi = $app->container->get("piletileviApi");
    $translations = $piletileviApi->translations($languageId);

    $response["status"] = "success";

	if (!empty( $translations->data)) {
        $response["translations"] = $translations->data->translations;
	}

    $dataHandler->response(200, $response);
});

$app->get('/powerbiReport', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
	$dataHandler->verifyToken();

	$filter = $app->request->params("filter");

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->powerbiReport( $filter );
	
	if ($reportResponse) {
	    $dataHandler->responseAsText(200, $reportResponse);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->get('/cardsReport', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
	$dataHandler->verifyToken();

	$filter = $app->request->params("filter");

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->cardsReport( $filter );
	
	if ($reportResponse) {
	    $dataHandler->responseAsText(200, $reportResponse);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

?>