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
		} else if ($r->filter->status == "draft") {
			if (property_exists($r->filter, 'draftStart')) {
				$filter['start'] = $r->filter->draftStart;
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

$app->post('/myEventsCount', function() use ($app) {
    $dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

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
		} else if ($r->filter->status == "draft") {
			if (property_exists($r->filter, 'draftStart')) {
				$filter['start'] = $r->filter->draftStart;
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
    $myEvents = $piletileviApi->myEventsCount($filter);

    //$app->log->debug( print_r($myEvents,true) );
	
	$response = "";
	if ($myEvents && !property_exists($myEvents, 'errors')) {
		if ($myEvents && property_exists($myEvents, 'count')) {
			$response['count'] = $myEvents->count;
		} else {
			$response['count'] = "";
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
		if ($relatedEvents && property_exists($relatedEvents, 'data')) {
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
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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

	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByStatus( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByDate( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByWeek( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByMonth( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceType( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceTypeDate( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceTypeWeek( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceTypeMonth( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	if (property_exists($r->filter, 'sectionId')) {
		$filter['sectionId'] = $r->filter->sectionId;
	}
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceClass( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceClassDate( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceClassWeek( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByPriceClassMonth( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportBySectors( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/concertData', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('concertId'), $r);

	$filter = array();
	$filter['concertId'] = $r->concertId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->concertData( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/eventSalesReportByLocation', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesReportByLocation( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/getCsvByOverview', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['display'] = $r->filter->display;
	$filter['groupBy'] = $r->filter->groupBy;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesCsvReportByOverview( $filter );
	
	$dataHandler->responseAsCsv(200, $reportResponse);
});

$app->post('/getXlsByOverview', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['display'] = $r->filter->display;
	$filter['groupBy'] = $r->filter->groupBy;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesXlsReportByOverview( $filter );
	
	$dataHandler->responseAsXls(200, $reportResponse);
});

$app->post('/getCsvByPriceType', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['display'] = $r->filter->display;
	$filter['groupBy'] = $r->filter->groupBy;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesCsvReportByPriceType( $filter );
	
	$dataHandler->responseAsCsv(200, $reportResponse);
});

$app->post('/getXlsByPriceType', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['display'] = $r->filter->display;
	$filter['groupBy'] = $r->filter->groupBy;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesXlsReportByPriceType( $filter );
	
	$dataHandler->responseAsXls(200, $reportResponse);
});

$app->post('/getCsvByPriceClass', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['display'] = $r->filter->display;
	$filter['groupBy'] = $r->filter->groupBy;
	$filter['sectionId'] = $r->filter->sectionId;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesCsvReportByPriceClass( $filter );
	
	$dataHandler->responseAsCsv(200, $reportResponse);
});

$app->post('/getXlsByPriceClass', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['display'] = $r->filter->display;
	$filter['groupBy'] = $r->filter->groupBy;
	$filter['sectionId'] = $r->filter->sectionId;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesXlsReportByPriceClass( $filter );
	
	$dataHandler->responseAsXls(200, $reportResponse);
});

$app->post('/getCsvBySectors', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesCsvReportBySectors( $filter );
	
	$dataHandler->responseAsCsv(200, $reportResponse);
});

$app->post('/getXlsBySectors', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesXlsReportBySectors( $filter );
	
	$dataHandler->responseAsXls(200, $reportResponse);
});

$app->post('/getCsvByLocation', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesCsvReportByLocation( $filter );
	
	$dataHandler->responseAsCsv(200, $reportResponse);
});

$app->post('/getXlsByLocation', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('id', 'type'), $r);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['eventId'] = $r->id;
	$filter['isShow'] = $r->type=="show";
	$filter['startDate'] = $r->filter->period->startDate;
	$filter['endDate'] = $r->filter->period->endDate;
	$filter['centerId'] = $r->filter->centerId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->eventSalesXlsReportByLocation( $filter );
	
	$dataHandler->responseAsXls(200, $reportResponse);
});

$app->post('/getSectorInfo', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('concertId', 'sectionId'), $r);

	$filter = array();
	$filter['concertId'] = $r->concertId;
	$filter['sectionId'] = $r->sectionId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->getSectorInfo( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/addToBasket', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('concertId', 'sectionId'), $r);

	$filter = array();
	$filter['concertId'] = $r->concertId;
	$filter['sectionId'] = $r->sectionId;
	
	/*
	classes structure:
		array("priceClassId1" => quantity1,
			  "priceClassId2" => quantity2,
			  ...)
	*/
	if (property_exists($r, 'classes')) {
		$filter['classes'] = $r->classes;
	}
	if (property_exists($r, 'seatId')) {
		$filter['seatId'] = $r->seatId;
	}

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->addToBasket( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["succeeded"] = $reportResponse->succeeded;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/changeBasketTicketType', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('ticketId', 'typeId'), $r);

	$filter = array();
	$filter['ticketId'] = $r->ticketId;
	$filter['typeId'] = $r->typeId;
	
    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->changeBasketTicketType( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["succeeded"] = $reportResponse->succeeded;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/changeBookingTicketType', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('ticketId', 'typeId'), $r);

	$filter = array();
	$filter['ticketId'] = $r->ticketId;
	$filter['typeId'] = $r->typeId;
	
    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->changeBookingTicketType( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["succeeded"] = $reportResponse->succeeded;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/removeFromBasket', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$filter = array();
	if (property_exists($r, 'ticketId')) {
		$filter['ticketId'] = $r->ticketId;
	}

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->removeFromBasket( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["succeeded"] = $reportResponse->succeeded;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/removeFromBooking', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('ticketId'), $r);
	
	$filter = array();
	$filter['ticketId'] = $r->ticketId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->removeFromBooking( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["succeeded"] = $reportResponse->succeeded;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/myBasket', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$filter = array();
	if ($r) {
		if (property_exists($r, 'discount')) {
			$filter['discount'] = $r->discount;
		}
	}
	
    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->myBasket($filter);

	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/confirmBasket', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('from', 'subject', 'body'), $r);
	
	if (property_exists($r, 'personType') && $r->personType == "organization") {
		$dataHandler->verifyParams(array('organizationName'), $r);
	} else {
		$dataHandler->verifyParams(array('firstName', 'lastName', 'contactEmail'), $r);
	}
	
	$filter = array();
	
	$fields = array("discount", "expireAt", "reservationType", "personType", 
					"firstName", "lastName", "contactEmail", "contactPhone", 
					"address", "city", "postalCode", "region", "countryId", 
					"organizationName", "regNumber", "vatNumber", "notes", 
					"from", "subject", "body");
	
	foreach ($fields as $field) {
		if (property_exists($r, $field)) {
			$filter[$field] = $r->$field;
		}
	}
	
    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->confirmBasket($filter);

	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["succeeded"] = $reportResponse->succeeded;
		$response["bookingId"] = $reportResponse->bookingId;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/confirmBooking', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('bookingId'), $r);
	
	if (property_exists($r, 'personType') && $r->personType == "organization") {
		$dataHandler->verifyParams(array('organizationName'), $r);
	} else {
		$dataHandler->verifyParams(array('firstName', 'lastName', 'contactEmail'), $r);
	}
	
	$filter = array();
	$filter['bookingId'] = $r->bookingId;
	
	$fields = array("discount", "expireAt", "reservationType", "personType", 
					"firstName", "lastName", "contactEmail", "contactPhone", 
					"address", "city", "postalCode", "region", "countryId", 
					"organizationName", "regNumber", "vatNumber", "notes", 
					"from", "subject", "body");
	
	foreach ($fields as $field) {
		if (property_exists($r, $field)) {
			$filter[$field] = $r->$field;
		}
	}
	
    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->confirmBooking($filter);

	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["succeeded"] = $reportResponse->succeeded;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/bookingList', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('concertId'), $r->filter);
	$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	$filter['concertId'] = $r->filter->concertId;

	if (property_exists($r->filter, 'bookingNr')) {
		$filter['bookingNr'] = $r->filter->bookingNr;
	}
	if (property_exists($r->filter, 'clientName')) {
		$filter['clientName'] = $r->filter->clientName;
	}
	if (property_exists($r->filter, 'statusId')) {
		$filter['statusId'] = $r->filter->statusId;
	}
	if (property_exists($r->filter, 'typeId')) {
		$filter['typeId'] = $r->filter->typeId;
	}

	if (property_exists($r->filter, 'period')) {
		if (property_exists($r->filter->period, 'startDate')) {
			$filter['bookingStartDate'] = $r->filter->period->startDate;
		}
		if (property_exists($r->filter->period, 'endDate')) {
			$filter['bookingEndDate'] = $r->filter->period->endDate;
		}
	}
	if (property_exists($r->filter, 'start')) {
		$filter['start'] = $r->filter->start;
	}
	
	$filter = $dataHandler->clearData($filter);
	
    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->bookingList( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/getCountries', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->getCountries();
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/getBookingTypes', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->getBookingTypes();
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/getBookingStatuses', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->getBookingStatuses();
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/cancelBooking', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('bookingId'), $r);

	$filter = array();
	$filter['bookingId'] = $r->bookingId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->cancelBooking( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["succeeded"] = $reportResponse->succeeded;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->post('/myBooking', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('bookingId'), $r);

	$filter = array();
	$filter['bookingId'] = $r->bookingId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->myBooking( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
		$dataHandler->response(200, $response);
	}
});

$app->get('/test', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");

	$filter = array();
	/*
	$filter['bookingStartDate'] = "2016-03-01T00:00:00.000";
	$filter['bookingEndDate'] = "2017-03-01T00:00:00.000";
	$filter['sectionId'] = 5605;
	$filter['ticketId'] = 130712500;
	*/
	$filter['bookingId'] = 1178338;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->myBooking($filter);

	$dataHandler->response(200, $reportResponse);
});

$app->post('/rejectTicket', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $r = json_decode($app->request->getBody());

	$dataHandler->verifyParams(array('ticketId'), $r);

	$filter = array();
	$filter['ticketId'] = $r->ticketId;

    $piletileviApi = $app->container->get("piletileviApi");
    $reportResponse = $piletileviApi->rejectTicket( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$response["status"] = "success";
		$response["data"] = $reportResponse->data;
	    $dataHandler->response(200, $response);
	} else {
	    $response["status"] = "error";
        $response["message"] = $dataHandler->getMessages($reportResponse->errors);
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

$app->get('/cache/stats', function() use ($app)  {
	$dataHandler = $app->container->get("dataHandler");
    $piletileviApi = $app->container->get("piletileviApi");

	$statistics = $piletileviApi->getStats();

	$response["status"] = "success";
	$response["data"] = $statistics;
	$dataHandler->response(200, $response);
});


?>