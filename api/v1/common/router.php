<?php

$app->get('/', function ($request, $response, $args)  {
	return $this->view->render($response, 'index.tpl', []);
});

$app->get('/session', function ($request, $response, $args) {
    $piletileviApi = $this->piletileviApi;
	$sessionHandler = $this->piletileviSessionHandler;

    $userData = $piletileviApi->verifySessionKey();

	$r = array();
    if (is_object($userData) && $userData && $userData->valid == "true") {
		$session = $sessionHandler->getSession();
		$r["user"] = $session["user"];
    } else {
		$sessionHandler->destroySession();
	}
	
	$dataHandler = $this->dataHandler;
	return $dataHandler->response($response, $r);
});

$app->get('/sessionLang', function ($request, $response, $args) {
    $sessionHandler = $this->piletileviSessionHandler;
    $session = $sessionHandler->getSession();
    $r["lang"] = $session["lang"];

	$dataHandler = $this->dataHandler;
	return  $dataHandler->response($response, $r);
});

$app->get('/boUrl', function ($request, $response, $args) {
    $piletileviApi = $this->piletileviApi;
    $urlReq = $piletileviApi->boUrl();
    if ($urlReq){
		$r['status'] = "success";
		$r['message'] = "BO URL retrieved";
		$r['boBaseUrl'] = $urlReq;
    }else {
        $r['status'] = "error";
        $r['message'] = "No BO url defined";
    }

	$dataHandler = $this->dataHandler;
	return $dataHandler->response($response, $r);
});

$app->post('/getYellowSessionKey', function ($request, $response, $args) {
    $json = json_decode($request->getBody());
	$dataHandler = $this->dataHandler;

	$validationErrors = $dataHandler->verifyParams(array('clientip'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$ip = $json->clientip;

    $piletileviApi = $this->piletileviApi;
    $sessionReq = $piletileviApi->getYellowSessionKey($ip);

    if ($sessionReq && !empty($sessionReq->data)) {
        $r['status'] = "success";
        $r['message'] = 'Successfully retrieved session key';
        $r['boSession'] = $sessionReq->data[0];
    } else {
        $r['status'] = "error";
        $r['message'] = 'Failed to retrieve session key';
    }
    
	return $dataHandler->response($response, $r);
});

$app->post('/setLanguage', function ($request, $response, $args) {
	$dataHandler = $this->dataHandler;
    $sessionHandler = $this->piletileviSessionHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('code', 'name'), $json->lang);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
    
    if (!empty($json) ){
        $sessionHandler->setCurrentLanguage( $json->lang );
		if ($sessionHandler->isUserExist()) {
			$piletileviApi = $this->piletileviApi;
			$data = $piletileviApi->setCurrentLanguage($json->lang->code);

			if (is_object($data) && $data->data->success == "true" ) {
				$r['status'] = "success";
				$r['message'] = 'Language switched successfully.';
			} else {
				$r['status'] = "error";
				$r['message'] = 'Language switch failed';
			}
		} else {
			$r['status'] = "success";
			$r['message'] = 'Language switched successfully.';
		}
    } else {
        $r['status'] = "failure";
        $r['message'] = 'Language set unsuccessfully.';
    }

	return $dataHandler->response($response, $r);
});

$app->post('/setPoint', function ($request, $response, $args) {
    $dataHandler = $this->dataHandler;
    $sessionHandler = $this->piletileviSessionHandler;

    $json = json_decode($request->getBody());

    $validationErrors = $dataHandler->verifyParams(array('pointId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

    if (!empty($json) ){
        $sessionHandler->setUserPointId($json->pointId);
		$piletileviApi = $this->piletileviApi;
		$data = $piletileviApi->setCurrentPoint($json->pointId);
		
		if ($data && $data->data->success == "true" ) {
        $r['status'] = "success";
			$r['message'] = 'Point switched successfully.';
		} else {
			$r['status'] = "error";
			$r['message'] = 'Point switch failed';
		}
    } else {
        $r['status'] = "failure";
        $r['message'] = 'Point set unsuccessfully.';
    }

    return $dataHandler->response($response, $r);
});

$app->post('/verifySessionKey', function ($request, $response, $args) {
	$dataHandler = $this->dataHandler;
    $sessionHandler = $this->piletileviSessionHandler;

    $piletileviApi = $this->piletileviApi;
    $userData = $piletileviApi->verifySessionKey();

    if ($userData && $userData->valid == "true") {
        $r['status'] = "success";
        $r['message'] = 'Verified session successfully.';
        $r['user'] = $userData->user;
		$sessionHandler->setUser( $userData->user );
    }

	return $dataHandler->response($response, $r);
});

$app->post('/login', function ($request, $response, $args) {
	$dataHandler = $this->dataHandler;
    $sessionHandler = $this->piletileviSessionHandler;
    $json = json_decode($request->getBody());

	$sessionHandler->resetSession();
	
    $validationErrors = $dataHandler->verifyParams(array('username', 'password', 'clientip'), $json->customer);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

    $username = $json->customer->username;
    $password = $json->customer->password;
    $clientip = $json->customer->clientip;

    $piletileviApi = $this->piletileviApi;
    $userData = $piletileviApi->login($username, $password, $clientip);

	if ($userData && !property_exists($userData, 'errors')) {
		if ($userData && property_exists($userData, 'valid') && $userData->valid == "true") {
			$r['status'] = "success";
			$r['message'] = 'Logged in successfully.';

			$r['user'] = $userData->user;
			$r['sessionId'] = $userData->sessionId;

			$sessionHandler->setSessionId($userData->sessionId);
			$sessionHandler->setUser( $userData->user );
		} else {
			$r['status'] = "error";
			$r['message'] = 'No such user is registered';
		}
    } else if ($userData && property_exists($userData, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($myEvents->errors);
    }

    return $dataHandler->response($response, $r);
});

$app->post('/myEvents', function ($request, $response, $args) {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	//$dataHandler->verifyParams(array('startDate'), $r->filter->period);

	$filter = array();
	if (property_exists($json->filter, 'name')) {
		$filter['name'] = $json->filter->name;
	}
	if (property_exists($json->filter, 'groupByShow')) {
		$filter['groupByShow'] = $json->filter->groupByShow;
	}
	if (property_exists($json->filter, 'status')) {
		$filter['status'] = $json->filter->status;
		
		if ($json->filter->status == "onsale") {
			if (property_exists($json->filter, 'openStart')) {
				$filter['start'] = $json->filter->openStart;
			}
		} else if ($json->filter->status == "past") {
			if (property_exists($json->filter, 'pastStart')) {
				$filter['start'] = $json->filter->pastStart;
			}
		} else if ($json->filter->status == "draft") {
			if (property_exists($json->filter, 'draftStart')) {
				$filter['start'] = $json->filter->draftStart;
			}
		}
	}
	if (property_exists($json->filter, 'period')) {
		if (property_exists($json->filter->period, 'startDate')) {
			$filter['startDate'] = $json->filter->period->startDate;
		}
		if (property_exists($json->filter->period, 'endDate')) {
			$filter['endDate'] = $json->filter->period->endDate;
		}
	}

    $piletileviApi = $this->piletileviApi;
    $myEvents = $piletileviApi->myEvents($filter);

    //$app->log->debug( print_r($myEvents,true) );
	
	$r = array();
	if ($myEvents && !property_exists($myEvents, 'errors')) {
		if ($myEvents && property_exists($myEvents, 'data')) {
	        $r['status'] = "success";
	        $r['data'] = $myEvents->data;
		} else {
	        $r['status'] = "info";
	        $r['message'] = "Empty result";
		}
    } else if ($myEvents && property_exists($myEvents, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($myEvents->errors);
    }

	return $dataHandler->response($response, $r);
});

$app->post('/myEventsCount', function ($request, $response, $args) {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$filter = array();
	if (property_exists($json->filter, 'name')) {
		$filter['name'] = $json->filter->name;
	}
	if (property_exists($json->filter, 'groupByShow')) {
		$filter['groupByShow'] = $json->filter->groupByShow;
	}
	if (property_exists($json->filter, 'status')) {
		$filter['status'] = $json->filter->status;
		if ($json->filter->status == "onsale") {
			if (property_exists($json->filter, 'openStart')) {
				$filter['start'] = $json->filter->openStart;
			}
		} else if ($json->filter->status == "past") {
			if (property_exists($json->filter, 'pastStart')) {
				$filter['start'] = $json->filter->pastStart;
			}
		} else if ($json->filter->status == "draft") {
			if (property_exists($json->filter, 'draftStart')) {
				$filter['start'] = $json->filter->draftStart;
			}
		}
	}
	if (property_exists($json->filter, 'period')) {
		if (property_exists($json->filter->period, 'startDate')) {
			$filter['startDate'] = $json->filter->period->startDate;
		}
		if (property_exists($json->filter->period, 'endDate')) {
			$filter['endDate'] = $json->filter->period->endDate;
		}
	}

    $piletileviApi = $this->piletileviApi;
    $myEvents = $piletileviApi->myEventsCount($filter);

    //$app->log->debug( print_r($myEvents,true) );
	
	if ($myEvents && !property_exists($myEvents, 'errors')) {
		if ($myEvents && property_exists($myEvents, 'count')) {
			$r['count'] = $myEvents->count;
		} else {
			$r['count'] = "";
		}
    } else if ($myEvents && property_exists($myEvents, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($myEvents->errors);
    }

	return $dataHandler->response($response, $r);
});

$app->post('/relatedEvents', function ($request, $response, $args) {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['id'] = $json->id;
	$filter['type'] = $json->type;
	if (property_exists($json, 'start')) {
		$filter['start'] = $json->start;
	}

    $piletileviApi = $this->piletileviApi;
    $relatedEvents = $piletileviApi->relatedEvents($filter);

	if ($relatedEvents && !property_exists($relatedEvents, 'errors')) {
		if ($relatedEvents && property_exists($relatedEvents, 'data')) {
	        $r['status'] = "success";
	        $r['data'] = $relatedEvents->data;
		}
    } else if ($relatedEvents && property_exists($relatedEvents, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($relatedEvents->errors);
    }

	return $dataHandler->response($response, $r);
});

$app->post('/changePassword', function ($request, $response, $args) {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

    $validationErrors = $dataHandler->verifyParams(array('oldPassword', 'newPassword'), $json->passwordSet);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

    $oldPassword = $json->passwordSet->oldPassword;
    $newPassword = $json->passwordSet->newPassword;

	$piletileviApi = $this->piletileviApi;
    $data = $piletileviApi->changePassword( $oldPassword, $newPassword );
    
	if ($data && $data->data->success == "true" ) {
        $r['status'] = "success";
        $r['message'] = 'Password changed successfully.';
    } else {
        $r['status'] = "error";
        $r['message'] = 'Password change failed';
    }

    return $dataHandler->response($response, $r);
});

$app->get('/logout', function ($request, $response, $args) {
	$dataHandler = $this->dataHandler;
	$piletileviApi = $this->piletileviApi;
    $sessionHandler = $this->piletileviSessionHandler;

    $data = $piletileviApi->logout();
    
	if ($data && $data->success == "true" ) {
		$r["status"] = "info";
		$r["message"] = "Logged out successfully";
    } else {
        $r['status'] = "error";
		$r["message"] = "Logged out failed";
    }

    $session = $sessionHandler->destroySession();
	
	return $dataHandler->response($response, $r);
});

$app->get('/languages', function() use ($app) {
	$dataHandler = $this->dataHandler;
	$piletileviApi = $this->piletileviApi;
    $languages = $piletileviApi->languages();
	
	if ($languages && !property_exists($languages, 'errors')) {
		if ($languages->data) {
			$r["status"] = "success";
			$r["languages"] = $languages->data;
		} else {
	        $r['status'] = "info";
	        $r['message'] = "Empty result";
		}
    } else {
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($languages->errors);
    }

	return $dataHandler->response($response, $r);
});

$app->post('/translations', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	$json = json_decode($request->getBody());

    $validationErrors = $dataHandler->verifyParams(array('languageId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

    $languageId = $json->languageId;

    $piletileviApi = $this->piletileviApi;
    $translations = $piletileviApi->translations($languageId);

    $r["status"] = "success";

	if (!empty($translations->data)) {
        $r["translations"] = $translations->data->translations;
	}

    return $dataHandler->response($response, $r);
});

$app->post('/reloadTranslations', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $piletileviApi = $this->piletileviApi;

    $languages = $piletileviApi->languages();
	if ($languages && !property_exists($languages, 'errors')) {
		$data = $languages->data;
		if ($data) {
			$loaded = array();
			foreach($data as $languageObj) {
				$languageId = $languageObj->code;
				$translations = $piletileviApi->reloadCacheTranslations($languageId);
				if(!is_null($translations) && is_object($translations)) {
					$loaded[$languageId] = "loaded";
				} else {
					$loaded[$languageId] = "not loaded";
				}
			}
			$r['status'] = $loaded;
		} else {
	        $r['status'] = "info";
	        $r['message'] = "Empty result";
		}
    } else {
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($languages->errors);
    }
	
    return $dataHandler->response($response, $r);
});

$app->get('/powerbiReport', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	$validationError = $dataHandler->verifyToken($request);
	if ($validationError != null) {
		return $dataHandler->response($response, $validationError, 401);
	}

	$filter = $request->getParam("filter");
	$token = $request->getParam("token");
	$ip = $dataHandler->getUserIP();

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->powerbiReport( $filter, $token, $ip );
	
	if ($reportResponse && !(strpos($reportResponse, 'errors') !== false)) {
		return $dataHandler->responseAsText($response, $reportResponse);
	} else {
		$json = json_decode($reportResponse);
		return $dataHandler->response($response, $json);
	}
});

$app->get('/cardsReport', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	$validationError = $dataHandler->verifyToken($request);
	if ($validationError != null) {
		return $dataHandler->response($response, $validationError, 401);
	}

	$filter = $request->getParam("filter");
	$token = $request->getParam("token");
	$ip = $dataHandler->getUserIP();

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->cardsReport( $filter, $token, $ip );
	
	if ($reportResponse && !(strpos($reportResponse, 'errors') !== false)) {
		return $dataHandler->responseAsText($response, $reportResponse);
	} else {
		$json = json_decode($reportResponse);
		return $dataHandler->response($response, $json);
	}
});

$app->post('/concertInfo', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['id'] = $json->id;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->concertInfo( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}

	return $dataHandler->response($response, $r);
});

$app->post('/showInfo', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['id'] = $json->id;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->showInfo( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}

	return $dataHandler->response($response, $r);
});

$app->post('/concertSales', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['id'] = $json->id;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->concertSales( $filter );

	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}

	return $dataHandler->response($response, $r);
});

$app->post('/showSales', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['id'] = $json->id;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->showSales( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}

	return $dataHandler->response($response, $r);
});

$app->post('/concertOpSales', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['id'] = $json->id;
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->concertOpSales( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/showOpSales', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['id'] = $json->id;
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->showOpSales( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByStatus', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByStatus( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByDate', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByDate( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByWeek', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByWeek( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByMonth', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByMonth( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByPriceType', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByPriceType( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByPriceTypeDate', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByPriceTypeDate( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByPriceTypeWeek', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByPriceTypeWeek( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByPriceTypeMonth', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByPriceTypeMonth( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByPriceClass', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	if (property_exists($json->filter, 'sectionId')) {
		$filter['sectionId'] = $json->filter->sectionId;
	}
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByPriceClass( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByPriceClassDate', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByPriceClassDate( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByPriceClassWeek', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByPriceClassWeek( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByPriceClassMonth', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByPriceClassMonth( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportBySectors', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportBySectors( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/ticketStatus', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('concertId', 'seatId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['concertId'] = $json->concertId;
	$filter['seatId'] = $json->seatId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->ticketStatus( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/concertData', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('concertId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['concertId'] = $json->concertId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->concertData( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/sectionInfo', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('concertId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('sectionId'), $json->filter);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['concertId'] = $json->concertId;
	$filter['sectionId'] = $json->filter->sectionId;
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->sectionInfo( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/sectionTickets', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('concertId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('sectionId'), $json->filter);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['concertId'] = $json->concertId;
	$filter['sectionId'] = $json->filter->sectionId;
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->sectionTickets( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/eventSalesReportByLocation', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesReportByLocation( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/getCsvByOverview', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['display'] = $json->filter->display;
	$filter['groupBy'] = $json->filter->groupBy;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesCsvReportByOverview( $filter );
	
	return $dataHandler->responseAsCsv($response, $reportResponse);
});

$app->post('/getXlsByOverview', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['display'] = $json->filter->display;
	$filter['groupBy'] = $json->filter->groupBy;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesXlsReportByOverview( $filter );
	
	return $dataHandler->responseAsXls($response, $reportResponse);
});

$app->post('/getCsvByPriceType', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['display'] = $json->filter->display;
	$filter['groupBy'] = $json->filter->groupBy;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesCsvReportByPriceType( $filter );
	
	return $dataHandler->responseAsCsv($response, $reportResponse);
});

$app->post('/getXlsByPriceType', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['display'] = $json->filter->display;
	$filter['groupBy'] = $json->filter->groupBy;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesXlsReportByPriceType( $filter );
	
	return $dataHandler->responseAsXls($response, $reportResponse);
});

$app->post('/getCsvByPriceClass', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['display'] = $json->filter->display;
	$filter['groupBy'] = $json->filter->groupBy;
	$filter['sectionId'] = $json->filter->sectionId;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesCsvReportByPriceClass( $filter );
	
	return $dataHandler->responseAsCsv($response, $reportResponse);
});

$app->post('/getXlsByPriceClass', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['display'] = $json->filter->display;
	$filter['groupBy'] = $json->filter->groupBy;
	$filter['sectionId'] = $json->filter->sectionId;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesXlsReportByPriceClass( $filter );
	
	return $dataHandler->responseAsXls($response, $reportResponse);
});

$app->post('/getCsvBySectors', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesCsvReportBySectors( $filter );
	
	return $dataHandler->responseAsCsv($response, $reportResponse);
});

$app->post('/getXlsBySectors', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesXlsReportBySectors( $filter );
	
	return $dataHandler->responseAsXls($response, $reportResponse);
});

$app->post('/getCsvByLocation', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesCsvReportByLocation( $filter );
	
	return $dataHandler->responseAsCsv($response, $reportResponse);
});

$app->post('/getXlsByLocation', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id', 'type'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['eventId'] = $json->id;
	$filter['isShow'] = $json->type=="show";
	$filter['startDate'] = $json->filter->period->startDate;
	$filter['endDate'] = $json->filter->period->endDate;
	$filter['centerId'] = $json->filter->centerId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->eventSalesXlsReportByLocation( $filter );
	
	return $dataHandler->responseAsXls($response, $reportResponse);
});

$app->post('/getSectorInfo', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('concertId', 'sectionId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['concertId'] = $json->concertId;
	$filter['sectionId'] = $json->sectionId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->getSectorInfo( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/addToBasket', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('concertId', 'sectionId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['concertId'] = $json->concertId;
	$filter['sectionId'] = $json->sectionId;
	
	/*
	classes structure:
		array("priceClassId1" => quantity1,
			  "priceClassId2" => quantity2,
			  ...)
	*/
	if (property_exists($json, 'classes')) {
		$filter['classes'] = $json->classes;
	}
	if (property_exists($json, 'seatId')) {
		$filter['seatId'] = $json->seatId;
	}

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->addToBasket( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["succeeded"] = $reportResponse->succeeded;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/changeBasketTicketType', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('ticketId', 'typeId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['ticketId'] = $json->ticketId;
	$filter['typeId'] = $json->typeId;
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->changeBasketTicketType( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["succeeded"] = $reportResponse->succeeded;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/changeBookingTicketType', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('ticketId', 'typeId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['ticketId'] = $json->ticketId;
	$filter['typeId'] = $json->typeId;
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->changeBookingTicketType( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["succeeded"] = $reportResponse->succeeded;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/removeFromBasket', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$filter = array();
	if (property_exists($json, 'ticketId')) {
		$filter['ticketId'] = $json->ticketId;
	}

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->removeFromBasket( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["succeeded"] = $reportResponse->succeeded;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/removeFromBooking', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('ticketId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	
	$filter = array();
	$filter['ticketId'] = $json->ticketId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->removeFromBooking( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["succeeded"] = $reportResponse->succeeded;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/myBasket', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$filter = array();
	if ($json) {
		if (property_exists($json, 'discount')) {
			$filter['discount'] = $json->discount;
		}
	}
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->myBasket($filter);

	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/confirmBasket', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('from', 'subject', 'body'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	
	if (property_exists($json, 'personType') && $json->personType == "organization") {
		$validationErrors = $dataHandler->verifyParams(array('organizationName'), $json);
	} else {
		$validationErrors = $dataHandler->verifyParams(array('firstName', 'lastName', 'contactEmail'), $json);
	}
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	
	$filter = array();
	
	$fields = array("discount", "expireAt", "reservationType", "personType", 
					"firstName", "lastName", "contactEmail", "contactPhone", 
					"address", "city", "postalCode", "region", "countryId", 
					"organizationName", "regNumber", "vatNumber", "notes", 
					"from", "subject", "body");
	
	foreach ($fields as $field) {
		if (property_exists($json, $field)) {
			$filter[$field] = $json->$field;
		}
	}
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->confirmBasket($filter);

	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["succeeded"] = $reportResponse->succeeded;
		$r["bookingId"] = $reportResponse->bookingId;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/confirmBooking', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('bookingId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	
	if (property_exists($json, 'personType') && $json->personType == "organization") {
		$validationErrors = $dataHandler->verifyParams(array('organizationName'), $json);
	} else {
		$validationErrors = $dataHandler->verifyParams(array('firstName', 'lastName', 'contactEmail'), $json);
	}
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	
	$filter = array();
	$filter['bookingId'] = $json->bookingId;
	
	$fields = array("discount", "expireAt", "reservationType", "personType", 
					"firstName", "lastName", "contactEmail", "contactPhone", 
					"address", "city", "postalCode", "region", "countryId", 
					"organizationName", "regNumber", "vatNumber", "notes", 
					"from", "subject", "body");
	
	foreach ($fields as $field) {
		if (property_exists($json, $field)) {
			$filter[$field] = $json->$field;
		}
	}
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->confirmBooking($filter);

	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["succeeded"] = $reportResponse->succeeded;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/bookingList', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('concertId'), $json->filter);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	$validationErrors = $dataHandler->verifyParams(array('startDate'), $json->filter->period);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['concertId'] = $json->filter->concertId;

	if (property_exists($json->filter, 'bookingNr')) {
		$filter['bookingNr'] = $json->filter->bookingNr;
	}
	if (property_exists($json->filter, 'clientName')) {
		$filter['clientName'] = $json->filter->clientName;
	}
	if (property_exists($json->filter, 'statusId')) {
		$filter['statusId'] = $json->filter->statusId;
	}
	if (property_exists($json->filter, 'typeId')) {
		$filter['typeId'] = $json->filter->typeId;
	}

	if (property_exists($json->filter, 'period')) {
		if (property_exists($json->filter->period, 'startDate')) {
			$filter['bookingStartDate'] = $json->filter->period->startDate;
		}
		if (property_exists($json->filter->period, 'endDate')) {
			$filter['bookingEndDate'] = $json->filter->period->endDate;
		}
	}
	if (property_exists($json->filter, 'start')) {
		$filter['start'] = $json->filter->start;
	}
	
	$filter = $dataHandler->clearData($filter);
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->bookingList( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/getCountries', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->getCountries();
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/getBookingTypes', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->getBookingTypes();
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/getBookingStatuses', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->getBookingStatuses();
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/cancelBooking', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('bookingId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['bookingId'] = $json->bookingId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->cancelBooking( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["succeeded"] = $reportResponse->succeeded;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/myBooking', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('bookingId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['bookingId'] = $json->bookingId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->myBooking( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/rejectTicket', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('ticketId'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['ticketId'] = $json->ticketId;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->rejectTicket( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->get('/cache/clear', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $piletileviApi = $this->piletileviApi;

	$piletileviApi->clearCache();

	$r["status"] = "success";
	return $dataHandler->response($response, $r);
});

$app->get('/cache/stats', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $piletileviApi = $this->piletileviApi;

	$statistics = $piletileviApi->getStats();

	$r["status"] = "success";
	$r["data"] = $statistics;
	return $dataHandler->response($response, $r);
});

$app->post('/bookingPayment', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('bookingId', 'hash'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['bookingId'] = $json->bookingId;
	$filter['hash'] = $json->hash;
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->bookingPayment( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["errors"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->get('/paymentByBookingId', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$filter = array();
	if ($json) {
		$filter['bookingId'] = $json->bookingId;
		$filter['hash'] = $json->hash;
	}
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->paymentByBookingId( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		if ($reportResponse->data && $reportResponse->data->type=="redirect" && $reportResponse->data->url) {
			return $response->withRedirect($reportResponse->data->url);
		} else {
			return $this->view->render($response, 'payment.tpl', [
				'payment' => $reportResponse->data
			]);
		}
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
		return $dataHandler->response($response, $r);
	}
});

$app->post('/addGIftCardToBooking', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('bookingId', 'hash', 'giftCode'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['bookingId'] = $json->bookingId;
	$filter['hash'] = $json->hash;
	$filter['giftCode'] = $json->giftCode;
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->addGIftCardToBooking( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["errors"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/removeGiftCardFromBooking', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('bookingId', 'hash', 'giftCode'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['bookingId'] = $json->bookingId;
	$filter['hash'] = $json->hash;
	$filter['giftCode'] = $json->giftCode;
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->removeGiftCardFromBooking( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["errors"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/reloadConcert', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['id'] = $json->id;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->reloadConcert( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/reloadShow', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$validationErrors = $dataHandler->verifyParams(array('id'), $json);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}

	$filter = array();
	$filter['id'] = $json->id;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->reloadShow( $filter );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->get('/ticketDownload', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	
	$parameters = $request->getParams();
	$ticket = $request->getParam("ticket");
	$busin = $request->getParam("busin");
	
	if ($ticket) {
		$validationErrors = $dataHandler->verifyParams(array('ticket', 'chtmp', 'hash'), $parameters);
	} else if ($busin) {
		$validationErrors = $dataHandler->verifyParams(array('busin', 'hash'), $parameters);
	} else {
		$validationErrors = $dataHandler->verifyParams(array('fnr', 'hash'), $parameters);
	}
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	
	$fnr = $request->getParam("fnr");
	$chtmp = $request->getParam("chtmp");
	$hash = $request->getParam("hash");
	$language = $request->getParam("language");

	$filename = "tickets-";

	$filter = array();
	if ($fnr) {
		$filter['fnr'] = $fnr;
		$filename .= $fnr;
	}
	if ($ticket) {
		$filter['ticket'] = $ticket;
		$filename .= $ticket;
	}
	if ($busin) {
		$filter['busin'] = $busin;
		$filename .= $ticket;
	}
	if ($chtmp) {
		$filter['chtmp'] = $chtmp;
	}
	$filter['hash'] = $hash;
	if ($language) {
		$filter['language'] = $language;
	}

	$filename .= ".pdf";
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->downloadTicket( $filter );
	
	$ticketResponse = $piletileviApi->downloadTicketData($filter);
	if ($ticketResponse && !property_exists($ticketResponse, 'errors')) {
		$ticketData = $ticketResponse->data;
		if ($ticketData) {
			$filename = $dataHandler->getShortName($ticketData->event);
			if ($ticketData->ticketsCount && intval($ticketData->ticketsCount) > 0) {
				$filename .= "_".$ticketData->ticketsCount;
			}
			$filename .= ".pdf";
		}
	}
	
	return $dataHandler->responseAsPdfAttachment($response, $filename, $reportResponse);
});

$app->get('/ticketOpen', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	
	$parameters = $request->getParams();
	$ticket = $request->getParam("ticket");
	$busin = $request->getParam("busin");
	
	if ($ticket) {
		$validationErrors = $dataHandler->verifyParams(array('ticket', 'chtmp', 'hash'), $parameters);
	} else if ($busin) {
		$validationErrors = $dataHandler->verifyParams(array('busin', 'hash'), $parameters);
	} else {
		$validationErrors = $dataHandler->verifyParams(array('fnr', 'hash'), $parameters);
	}
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	
	$fnr = $request->getParam("fnr");
	$chtmp = $request->getParam("chtmp");
	$hash = $request->getParam("hash");
	$language = $request->getParam("language");

	$filter = array();
	if ($fnr) {
		$filter['fnr'] = $fnr;
	}
	if ($ticket) {
		$filter['ticket'] = $ticket;
	}
	if ($busin) {
		$filter['busin'] = $busin;
	}
	if ($chtmp) {
		$filter['chtmp'] = $chtmp;
	}
	$filter['hash'] = $hash;
	if ($language) {
		$filter['language'] = $language;
	}

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->downloadTicket( $filter );
	
	return $dataHandler->responseAsPdf($response, $reportResponse);
});

$app->get('/payment/process', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	
	$ip = $dataHandler->getUserIP();
	$parameters = $request->getParams();

	$validationErrors = $dataHandler->verifyParams(array('key', 'paymentTypeId'), $parameters);
	if ($validationErrors != null) {
		return $dataHandler->response($response, $validationErrors, 401);
	}
	
	$key = $request->getParam("key");
	$paymentTypeId = $request->getParam("paymentTypeId");
	$langId = $request->getParam("lang");
	$lastConcertId = $request->getParam("m_kontsert");

	$data = array();
	$filter = array();
	$data['ysessionId'] = $key;
	$filter['paymentTypeId'] = $paymentTypeId;
	$filter['lastConcertId'] = $lastConcertId;
	$filter['ip'] = $ip;
	if ($langId) {
		$data['langId'] = $langId;
	}
	$data['filter'] = $filter;
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->processPayment( $data );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		if ($reportResponse->data && $reportResponse->data->type=="redirect" && $reportResponse->data->url) {
			return $response->withRedirect($reportResponse->data->url);
		} else {
			return $this->view->render($response, 'payment.tpl', [
				'payment' => $reportResponse->data
			]);
		}
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
		return $dataHandler->response($response, $r);
	}
});

$app->put('/payment/check', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	
	$ip = $dataHandler->getUserIP();
	$parameters = $request->getParams();
    $piletileviApi = $this->piletileviApi;

    $reportResponse = $piletileviApi->checkPayment( $parameters, $ip );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		if ($reportResponse->data && $reportResponse->data->type=="redirect" && $reportResponse->data->url) {
			return $response->withRedirect($reportResponse->data->url);
		} else {
			return $this->view->render($response, 'payment.tpl', [
				'payment' => $reportResponse->data
			]);
		}
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
		return $dataHandler->response($response, $r);
	}
});

$app->post('/payment/check', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	
	$ip = $dataHandler->getUserIP();
	$parameters = $request->getParams();
    $piletileviApi = $this->piletileviApi;

    $reportResponse = $piletileviApi->checkPayment( $parameters, $ip );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		if ($reportResponse->data && $reportResponse->data->type=="redirect" && $reportResponse->data->url) {
			return $response->withRedirect($reportResponse->data->url);
		} else {
			return $this->view->render($response, 'payment.tpl', [
				'payment' => $reportResponse->data
			]);
		}
	} else {
	    $r["status"] = "error";
        if ($reportResponse) {
			$r["message"] = $dataHandler->getMessages($reportResponse->errors);
		}
		return $dataHandler->response($response, $r);
	}
});

$app->get('/payment/check', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;

    $ip = $dataHandler->getUserIP();
    $parameters = $request->getParams();
    $piletileviApi = $this->piletileviApi;

    $reportResponse = $piletileviApi->checkPayment( $parameters, $ip );

    if ($reportResponse && !property_exists($reportResponse, 'errors')) {
        if ($reportResponse->data && $reportResponse->data->type=="redirect" && $reportResponse->data->url) {
            return $response->withRedirect($reportResponse->data->url);
        } else {
            return $this->view->render($response, 'payment.tpl', [
                'payment' => $reportResponse->data
            ]);
        }
    } else {
        $r["status"] = "error";
        if ($reportResponse) {
            $r["message"] = $dataHandler->getMessages($reportResponse->errors);
        }
        return $dataHandler->response($response, $r);
    }
});

$app->get('/test', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;

	$filter = array();
	/*
	$filter['bookingId'] = 1178385;
	$filter['hash'] = "6c2e5668795cba3ad4541cecfa789a54849e7c5d0983b5073d971186dffd60b2";
	$filter['giftCode'] = "20203112852697";
	*/
	$filter['fnr'] = "63149690403821";
	$filter['hash'] = "d0429732f4427c842f143853c3c38806b54d58edc2642424fb61f2e2a1795b31";

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->downloadTicketData($filter);

	return $dataHandler->response($response, $reportResponse);
});

?>
