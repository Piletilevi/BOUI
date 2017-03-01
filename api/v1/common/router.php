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

	//$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	if (property_exists($r->filter, 'name')) {
		$filter['name'] = $r->filter->name;
	}
	if (property_exists($r->filter, 'groupByShow')) {
		$filter['groupByShow'] = $r->filter->groupByShow;
	}
	if (property_exists($r->filter, 'status')) {
		$filter['status'] = $r->filter->status;
		
		if ($r->filter->status == "onsale") {
			if (property_exists($r->filter, 'openStart')) {
				$filter['start'] = $r->filter->openStart;
			}
		} else if ($r->filter->status == "past") {
			if (property_exists($r->filter, 'pastStart')) {
				$filter['start'] = $r->filter->pastStart;
			}
		}
	}
	if (property_exists($r->filter, 'period')) {
		if (property_exists($r->filter->period, 'startDate')) {
			$filter['startDate'] = $r->filter->period->startDate;
		}
		if (property_exists($r->filter->period, 'endDate')) {
			$filter['endDate'] = $r->filter->period->endDate;
		}
	}

    $piletileviApi = $app->container->get("piletileviApi");
    $myEvents = $piletileviApi->myEvents($filter);

    //$app->log->debug( print_r($myEvents,true) );
	
	$response = "";
	if ($myEvents && !property_exists($myEvents, 'errors')) {
		if ($myEvents && property_exists($myEvents, 'data')) {
	        $response['status'] = "success";
	        $response['data'] = $myEvents->data;
	        $response['count'] = $myEvents->count;
		} else {
	        $response['status'] = "info";
	        $response['message'] = "Empty result";
		}
    } else if ($myEvents && property_exists($myEvents, 'errors')){
        $response['status'] = "error";
        $response['message'] = $dataHandler->getMessages($myEvents->errors);
    }

	$dataHandler->response(200, $response);
});

$app->post('/relatedEvents', function() use ($app) {
    $dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id'), $r);

	$filter = array();
	$filter['id'] = $r->id;
	$filter['type'] = $r->type;
	if (property_exists($r, 'start')) {
		$filter['start'] = $r->start;
	}

    $piletileviApi = $app->container->get("piletileviApi");
    $relatedEvents = $piletileviApi->relatedEvents($filter);

	$response = "";
	if ($relatedEvents && !property_exists($relatedEvents, 'errors')) {
		if ($relatedEvents && property_exists($myEvents, 'data')) {
	        $response['status'] = "success";
	        $response['data'] = $relatedEvents->data;
		}
    } else if ($relatedEvents && property_exists($relatedEvents, 'errors')){
        $response['status'] = "error";
        $response['message'] = $dataHandler->getMessages($relatedEvents->errors);
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
	
	if ($languages && !property_exists($languages, 'errors')) {
		if ($languages->data) {
			$response["status"] = "success";
			$response["languages"] = $languages->data;
		} else {
	        $response['status'] = "info";
	        $response['message'] = "Empty result";
		}
    } else {
        $response['status'] = "error";
        $response['message'] = $dataHandler->getMessages($languages->errors);
    }

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

	if (!empty($translations->data)) {
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

$app->post('/concertInfo', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id'), $r);

	$filter = array();
	$filter['id'] = $r->id;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->concertInfo( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/showInfo', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id'), $r);

	$filter = array();
	$filter['id'] = $r->id;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->showInfo( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/concertSales', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id'), $r);

	$filter = array();
	$filter['id'] = $r->id;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->concertSales( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/showSales', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id'), $r);

	$filter = array();
	$filter['id'] = $r->id;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->showSales( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/concertOpSales', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['id'] = $r->id;
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->concertOpSales( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/showOpSales', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['id'] = $r->id;
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->showOpSales( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByStatus', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByStatus( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByDate', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByDate( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByWeek', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByWeek( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByMonth', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByMonth( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByPriceType', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceType( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByPriceTypeDate', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceTypeDate( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByPriceTypeWeek', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceTypeWeek( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByPriceTypeMonth', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceTypeMonth( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByPriceClass', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceClass( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByPriceClassDate', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceClassDate( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByPriceClassWeek', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceClassWeek( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByPriceClassMonth', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceClassMonth( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportBySectors', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportBySectors( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/ticketStatus', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('concertId', 'seatId'), $r);

	$filter = array();
	$filter['concertId'] = $r->concertId;
	$filter['seatId'] = $r->seatId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->ticketStatus( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/concertInfoOfVenue', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('concertId'), $r);

	$filter = array();
	$filter['concertId'] = $r->concertId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->concertInfoOfVenue( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/sectionInfo', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('concertId'), $r);
	$dataHandler->verifyParams(array('sectionId'), $r->filter);

	$filter = array();
	$filter['concertId'] = $r->concertId;
	$filter['sectionId'] = $r->filter->sectionId;
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->sectionInfo( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/sectionTickets', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('concertId'), $r);
	$dataHandler->verifyParams(array('sectionId'), $r->filter);

	$filter = array();
	$filter['concertId'] = $r->concertId;
	$filter['sectionId'] = $r->filter->sectionId;
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->sectionTickets( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->post('/rejectTicket', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('ticketId'), $r);

	$filter = array();
	$filter['ticketId'] = $r->ticketId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->rejectTicket( $filter );
	
	if ($reportResponse) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["errors"] = array("error" => "no response");
		$dataHandler->response(200, $response);
	}
});

$app->get('/cache/clear', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $piletileviApi = $app->container->get("piletileviApi");

	$piletileviApi->clearCache();

	$response["status"] = "success";
	$dataHandler->response(200, $response);
});

$app->get('/cache/stat', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $piletileviApi = $app->container->get("piletileviApi");

	$statistics = $piletileviApi->getStats();

	$response["status"] = "success";
	$response["data"] = $statistics;
	$dataHandler->response(200, $response);
});


?>