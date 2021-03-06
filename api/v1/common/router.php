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

$app->get('/apiUrl', function ($request, $response, $args) {
    $piletileviApi = $this->piletileviApi;
    $urlReq = $piletileviApi->apiUrl();
    if ($urlReq){
        $r['status'] = "success";
        $r['message'] = "API URL retrieved";
        $r['apiBaseUrl'] = $urlReq;
    } else {
        $r['status'] = "error";
        $r['message'] = "No API url defined";
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
        $r['message'] = $dataHandler->getMessages($userData->errors);
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

$app->get('/languages', function($response) use ($app) {
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
		if (!property_exists($languages, 'data')) {
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
                $piletileviApi->reloadApiTranslations();
            } else {
				$r['status'] = "info";
				$r['message'] = "Empty result";
			}
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
	
	if ($reportResponse && !(strpos($reportResponse, 'errors') !== 0)) {
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

    if ($reportResponse && !(strpos($reportResponse, 'errors') !== 0)) {
        return $dataHandler->responseAsText($response, $reportResponse);
    } else {
        $json = json_decode($reportResponse);
        return $dataHandler->response($response, $json);
    }
});

$app->get('/ticket/status', function ($request, $response, $args) use ($app) {
    $dataHandler = $this->dataHandler;
    $validationError = $dataHandler->verifyToken($request);
    if ($validationError != null) {
        return $dataHandler->response($response, $validationError, 401);
    }

    $filter = array();
    $filter['barcode'] = $request->getParam("barcode");

    $token = $request->getParam("token");
    $ip = $dataHandler->getUserIP();

    //$logger = $app->getContainer()->get("logger");
    //$logger->write("ticket/status caller ip: ".$ip);

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->ticketPurchaseStatus( $filter, $token, $ip );

    if ($reportResponse && !(strpos($reportResponse, 'errors') !== 0)) {
        return $dataHandler->responseAsText($response, $reportResponse);
    } else {
        $json = json_decode($reportResponse);
        return $dataHandler->response($response, $json);
    }
});

$app->get('/report/purchaseHistory', function ($request, $response, $args) use ($app) {
    $dataHandler = $this->dataHandler;
    $validationError = $dataHandler->verifyToken($request);
    if ($validationError != null) {
        return $dataHandler->response($response, $validationError, 401);
    }

    $filter = array();
    $filter['userCode'] = $request->getParam("userCode");
    $langId = $request->getParam("lang");

    $token = $request->getParam("token");
    $ip = $dataHandler->getUserIP();

   // $logger = $app->getContainer()->get("logger");
   // $logger->write("report/purchaseHistory caller ip: ".$ip);

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->clientPurchaseHistory( $filter, $token, $ip, $langId );

	return $dataHandler->response($response, $reportResponse);
});

$app->post('/invoiceEvents', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

    $filter = array();
    if (property_exists($json->filter, 'name')) {
        $filter['name'] = $json->filter->name;
    }
    if (property_exists($json->filter, 'promoter')) {
        $filter['promoter'] = $json->filter->promoter;
    }
    if (property_exists($json->filter, 'start')) {
        $filter['start'] = $json->filter->start;
    }
    if (property_exists($json->filter, 'limit')) {
        $filter['limit'] = $json->filter->limit;
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
    $dataResponse = $piletileviApi->invoiceAction("/event/invoiceEvents", $filter);

    $r = array();
    if ($dataResponse && !property_exists($dataResponse, 'errors')) {
        if ($dataResponse && property_exists($dataResponse, 'events' ) && property_exists($dataResponse, 'promoters')) {
            $r['status'] = "success";
            $r['events'] = $dataResponse->events;
            $r['promoters'] = $dataResponse->promoters;
        } else {
            $r['status'] = "info";
            $r['message'] = "Empty result";
        }
    } else if ($dataResponse && property_exists($dataResponse, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($dataResponse->errors);
    }
    return $dataHandler->response($response, $r);
});


$app->post('/addPromoterInvoiceRequest', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

    $filter = array();
    if (property_exists($json->filter, 'promoter')) {
        $filter['promoter'] = $json->filter->promoter;
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
    $dataResponse = $piletileviApi->invoiceAction("/invoice/addPromoterInvoiceRequest", $filter);
    $this->logger->write($dataResponse);
    $this->logger->write("test");
    $r = array();
    if ($dataResponse && !property_exists($dataResponse, 'errors')) {
        if ($dataResponse && property_exists($dataResponse, 'status' )) {
            $r['status'] = $dataResponse->status;
            $r['message'] = $dataResponse->message;
        }
        else{
            $r['status'] = 'error';
            $r['message'] = 'Invalid response';
        }
    } else if ($dataResponse && property_exists($dataResponse, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($dataResponse->errors);
    }
    return $dataHandler->response($response, $r);
});


$app->post('/invoiceTransactions', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

    $filter = array();
    $filter['concertId'] = $json->filter->concertId;
    if (property_exists($json->filter, 'start')) {
        $filter['start'] = $json->filter->start;
    }
    if (property_exists($json->filter, 'limit')) {
        $filter['limit'] = $json->filter->limit;
    }
    if (property_exists($json->filter, 'period')) {
        if (property_exists($json->filter->period, 'startDate')) {
            $filter['startDate'] = $json->filter->period->startDate;
        }
        if (property_exists($json->filter->period, 'endDate')) {
            $filter['endDate'] = $json->filter->period->endDate;
        }
    }
    if (property_exists($json->filter, 'orderNumber')) {
        $filter['orderNumber'] = $json->filter->orderNumber;
    }
    if (property_exists($json->filter, 'customerName')) {
        $filter['customerName'] = $json->filter->customerName;
    }
    if (property_exists($json->filter, 'bookingNumber')) {
        $filter['bookingNumber'] = $json->filter->bookingNumber;
    }
    if (property_exists($json->filter, 'ticketId')) {
        $filter['ticketId'] = $json->filter->ticketId;
    }
    $piletileviApi = $this->piletileviApi;
    $dataResponse = $piletileviApi->invoiceAction("/event/transactions", $filter);

    $r = array();
    if ($dataResponse && !property_exists($dataResponse, 'errors')) {
        if ($dataResponse && property_exists($dataResponse, 'transactions')) {
            $r['status'] = "success";
            $r['data'] = $dataResponse->transactions;
        } else {
            $r['status'] = "info";
            $r['message'] = "Empty result";
        }
    } else if ($dataResponse && property_exists($dataResponse, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($dataResponse->errors);
    }
    return $dataHandler->response($response, $r);
});

$app->post('/invoiceInfo', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

    $filter = array();
    $filter['concertId'] = $json->filter->concertId;
    $filter['transactionId'] = $json->filter->transactionId;
    $piletileviApi = $this->piletileviApi;
    $dataResponse = $piletileviApi->invoiceAction("/invoice/info", $filter);

    $r = array();
    if ($dataResponse && !property_exists($dataResponse, 'errors')) {
        if ($dataResponse && property_exists($dataResponse, 'transaction')) {
            $r['status'] = "success";
            $r['data'] = $dataResponse->transaction;
        } else {
            $r['status'] = "info";
            $r['message'] = "Empty result";
        }
    } else if ($dataResponse && property_exists($dataResponse, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($dataResponse->errors);
    }
    return $dataHandler->response($response, $r);
});

$app->post('/invoiceSave', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

    $filter = array();
    $filter['concertId'] = $json->filter->concertId;
    $filter['transactionId'] = $json->filter->transactionId;
    if (property_exists($json->filter->info, 'buyerName')) {
        $filter['buyerName'] = $json->filter->info->buyerName;
    }
    if (property_exists($json->filter->info, 'email')) {
        $filter['email'] = $json->filter->info->email;
    }
    if (property_exists($json->filter->info, 'address')) {
        $filter['address'] = $json->filter->info->address;
    }
    if (property_exists($json->filter->info, 'vatCode')) {
        $filter['vatCode'] = $json->filter->info->vatCode;
    }
    if (property_exists($json->filter->info, 'companyCode')) {
        $filter['companyCode'] = $json->filter->info->companyCode;
    }
    if (property_exists($json->filter->info, 'additionalInfo')) {
        $filter['additionalInfo'] = $json->filter->info->additionalInfo;
    }
    if (property_exists($json->filter->info, 'invoiceDate')) {
        $filter['invoiceDate'] = $json->filter->info->invoiceDate;
    }

    $piletileviApi = $this->piletileviApi;
    $dataResponse = $piletileviApi->invoiceAction("/invoice/save", $filter);
    $r = array();
    if ($dataResponse && !property_exists($dataResponse, 'errors')) {
        if ($dataResponse && property_exists($dataResponse, 'status')) {
            $r['status'] = $dataResponse->status;
            if ( property_exists($dataResponse, 'invoiceInfoId')){
                $r['invoiceInfoId'] = $dataResponse->invoiceInfoId;
                $r['invoiceStatus'] = $dataResponse->invoiceStatus;
                $r['statusLabel'] = $dataResponse->statusLabel;
                $r['buyerName'] = $dataResponse->buyerName;
            }
        }
    } else if ($dataResponse && property_exists($dataResponse, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($dataResponse->errors);
    }
    return $dataHandler->response($response, $r);
});

$app->post('/invoiceDelete', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

    $filter = array();
    $filter['invoiceInfoId'] = $json->filter->invoiceInfoId;


    $piletileviApi = $this->piletileviApi;
    $dataResponse = $piletileviApi->invoiceAction("/invoice/delete", $filter);
    $r = array();
    if ($dataResponse && !property_exists($dataResponse, 'errors')) {
        if ($dataResponse && property_exists($dataResponse, 'status')) {
            $r['status'] = $dataResponse->status;
            if ( property_exists($dataResponse, 'invoiceInfoId')){
                $r['invoiceInfoId'] = $dataResponse->invoiceInfoId;
                $r['invoiceStatus'] = $dataResponse->invoiceStatus;
                $r['statusLabel'] = $dataResponse->statusLabel;
                $r['buyerName'] = $dataResponse->buyerName;
            }
        }
    } else if ($dataResponse && property_exists($dataResponse, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($dataResponse->errors);
    }
    return $dataHandler->response($response, $r);
});

$app->post('/invoiceSend', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

    $filter = array();
    $filter['invoiceInfoIds'] = $json->filter;

    $piletileviApi = $this->piletileviApi;
    $dataResponse = $piletileviApi->invoiceAction("/invoice/send", $filter);
    $r = array();
    if ($dataResponse && !property_exists($dataResponse, 'errors')) {
        if ($dataResponse && property_exists($dataResponse, 'status')) {
            $r['status'] = $dataResponse->status;

        }
    } else if ($dataResponse && property_exists($dataResponse, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($dataResponse->errors);
    }
    return $dataHandler->response($response, $r);
});

$app->post('/invoiceDownload', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

    $filter = array();
    $filter['invoiceInfoId'] = $json->filter;

    $piletileviApi = $this->piletileviApi;
    $dataResponse = $piletileviApi->invoiceAction("/invoice/download", $filter);
    $r = array();
    if ($dataResponse && !property_exists($dataResponse, 'errors')) {
        if ($dataResponse && property_exists($dataResponse, 'status')) {
            $r['status'] = $dataResponse->status;
        }
    } else if ($dataResponse && property_exists($dataResponse, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($dataResponse->errors);
    }
    return $dataHandler->response($response, $r);
});

$app->get('/invoiceDownload', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;

    $filter = array();
    $filter['invoiceInfoId'] = $request->getParam("invoiceInfoId");

    $filename = "invoice-";
    $filename .= $filter['invoiceInfoId'];
    $filename .= ".pdf";

    $piletileviApi = $this->piletileviApi;
    $dataResponse = $piletileviApi->downloadInvoice( $filter );
    return $dataHandler->responseAsPdfAttachment($response, $filename, $dataResponse);
});

$app->get('/invoiceOpen', function ($request, $response, $args)  {
    $dataHandler = $this->dataHandler;

    $filter = array();
    $filter['invoiceInfoId'] = $request->getParam("invoiceInfoId");

    $piletileviApi = $this->piletileviApi;
    $dataResponse = $piletileviApi->downloadInvoice( $filter );
    return $dataHandler->responseAsPdf($response, $dataResponse);
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

$app->post('/refundValidate', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	$logger = $this->logger;
    $json = json_decode($request->getBody());

	$filter = array();
	$filter['rows'] = $json->filter;
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->refundValidate( $filter );
	
	$logger->write($reportResponse);
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["errors"] = $dataHandler->getMessages($reportResponse->errors);
	}

	return $dataHandler->response($response, $r);
});

$app->post('/refundProcess', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$filter = array();
	$filter['rows'] = $json->filter;
	
    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->refundProcess( $filter );
	
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
			$template = 'payment.tpl';
			if ($reportResponse->data->template) {
				$template = $reportResponse->data->template;
			}
			return $this->view->render($response, $template, [
				'payment' => $reportResponse->data
			]);
		}
	} else if( $reportResponse && property_exists($reportResponse, 'errors')) {
        $error = new stdClass();
        $error->message = $reportResponse->errors[0]-> message;

        foreach($reportResponse->errors as $e) {
            if ("payment.errorRedirectUrl" == $e->code) {
                $error->errorRedirectUrl = $e->message;
                break;
            }
        }
        return $this->view->render($response, 'errorRedirect.tpl', [
            'error' => $error
        ]);

	} else {
        return $this->view->render($response, 'errorRedirect.tpl', [
            'error' => []
        ]);

    }

});

$app->put('/payment/check', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	$logger = $this->paymentLogger;
	
	$ip = $dataHandler->getUserIP();
	$parameters = $request->getParams();
	$parameters['requestMethod'] = "PUT";
    $piletileviApi = $this->piletileviApi;

    $contentCharset = getCharset($request, $dataHandler);

    $logger->write(" ---------START PUT--------");
	$logger->write("IP: ".$ip);
	$logger->write("Content-Encoding: ".$request->getContentCharset());
	$logger->write("Request headers:");
	$logger->write($request->getHeaders());
	$logger->write("Parameters:");
	$logger->write($parameters);
	$logger->write(" ---------END PUT----------");
	
	$parameters = $dataHandler->fixEncoding($parameters, $contentCharset);
	
    $reportResponse = $piletileviApi->checkPayment( $parameters, $ip );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		if ($reportResponse->data && $reportResponse->data->type=="redirect" && $reportResponse->data->url) {
			return $response->withRedirect($reportResponse->data->url);
		} else if ($reportResponse->data && $reportResponse->data->type=="json" && $reportResponse->data->response) {
			return $dataHandler->response($response, $reportResponse->data->response);
		} else {
			$template = 'payment.tpl';
			if ($reportResponse->data->template) {
				$template = $reportResponse->data->template;
			}
			return $this->view->render($response, $template, [
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
	$logger = $this->paymentLogger;
	
	$ip = $dataHandler->getUserIP();
	$parameters = $request->getParams();
	$parameters['requestMethod'] = "POST";
    $piletileviApi = $this->piletileviApi;

    $contentCharset = getCharset($request, $dataHandler);

	$logger->write(" ---------START POST--------");
	$logger->write("IP: ".$ip);
	$logger->write("Content-Encoding: ".$request->getContentCharset());
	$logger->write("Request headers:");
	$logger->write($request->getHeaders());
	$logger->write("Parameters:");
	$logger->write($parameters);
	$logger->write(" ---------END POST----------");

	$parameters = $dataHandler->fixEncoding($parameters, $contentCharset);
	
	$reportResponse = $piletileviApi->checkPayment( $parameters, $ip );
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		if ($reportResponse->data && $reportResponse->data->type=="redirect" && $reportResponse->data->url) {
			return $response->withRedirect($reportResponse->data->url);
		} else if ($reportResponse->data && $reportResponse->data->type=="json" && $reportResponse->data->response) {
			return $dataHandler->response($response, $reportResponse->data->response);
		} else {
			$template = 'payment.tpl';
			if ($reportResponse->data->template) {
				$template = $reportResponse->data->template;
			}
			return $this->view->render($response, $template, [
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
	$logger = $this->paymentLogger;

    $ip = $dataHandler->getUserIP();
    $parameters = $request->getParams();
	$parameters['requestMethod'] = "GET";
    $piletileviApi = $this->piletileviApi;

    $contentCharset = getCharset($request, $dataHandler);

	$logger->write(" ---------START GET--------");
	$logger->write("IP: ".$ip);
	$logger->write("Content-Encoding: ".$request->getContentCharset());
	$logger->write("Request headers:");
	$logger->write($request->getHeaders());
	$logger->write("Parameters:");
	$logger->write($parameters);
	$logger->write(" ---------END GET----------");
	
	$parameters = $dataHandler->fixEncoding($parameters, $contentCharset);

    $reportResponse = $piletileviApi->checkPayment( $parameters, $ip );

    if ($reportResponse && !property_exists($reportResponse, 'errors')) {
        if ($reportResponse->data && $reportResponse->data->type=="redirect" && $reportResponse->data->url) {
            return $response->withRedirect($reportResponse->data->url);
		} else if ($reportResponse->data && $reportResponse->data->type=="json" && $reportResponse->data->response) {
			return $dataHandler->response($response, $reportResponse->data->response);
        } else {
			$template = 'payment.tpl';
			if ($reportResponse->data->template) {
				$template = $reportResponse->data->template;
			}
			return $this->view->render($response, $template, [
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

$app->post('/getJobPriorities', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->getJobPriorities();
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/getJobFrequencies', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->getJobFrequencies();
	
	if ($reportResponse && !property_exists($reportResponse, 'errors')) {
		$r["status"] = "success";
		$r["data"] = $reportResponse->data;
	} else {
	    $r["status"] = "error";
        $r["message"] = $dataHandler->getMessages($reportResponse->errors);
	}
	return $dataHandler->response($response, $r);
});

$app->post('/getJobs', function ($request, $response, $args) {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$filter = array();
	if (property_exists($json->filter, 'name')) {
		$filter['name'] = $json->filter->name;
	}
	if (property_exists($json->filter, 'status')) {
		$filter['status'] = $json->filter->status;
	}
	if (property_exists($json->filter, 'priorityId')) {
		$filter['priority'] = $json->filter->priorityId;
	}
	if (property_exists($json->filter, 'frequencyId')) {
		$filter['frequency'] = $json->filter->frequencyId;
	}
	if (property_exists($json->filter, 'start')) {
		$filter['start'] = $json->filter->start;
	}

    $piletileviApi = $this->piletileviApi;
    $jobs = $piletileviApi->getJobs($filter);

	$r = array();
	if ($jobs && !property_exists($jobs, 'errors')) {
		if ($jobs && property_exists($jobs, 'data')) {
	        $r['status'] = "success";
	        $r['data'] = $jobs->data;
		} else {
	        $r['status'] = "info";
	        $r['message'] = "Empty result";
		}
    } else if ($jobs && property_exists($jobs, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($jobs->errors);
    }

	return $dataHandler->response($response, $r);
});

$app->post('/getJobsCount', function ($request, $response, $args) {
    $dataHandler = $this->dataHandler;
    $json = json_decode($request->getBody());

	$filter = array();
    $piletileviApi = $this->piletileviApi;
    $jobs = $piletileviApi->getJobsCount($filter);

	$r = array();
	if ($jobs && !property_exists($jobs, 'errors')) {
		if ($jobs && property_exists($jobs, 'data')) {
	        $r['status'] = "success";
	        $r['data'] = $jobs->data;
		} else {
	        $r['status'] = "info";
	        $r['message'] = "Empty result";
		}
    } else if ($jobs && property_exists($jobs, 'errors')){
        $r['status'] = "error";
        $r['message'] = $dataHandler->getMessages($jobs->errors);
    }

	return $dataHandler->response($response, $r);
});


$app->get('/test', function ($request, $response, $args)  {
	$dataHandler = $this->dataHandler;
	$logger = $this->logger;		
	
	$logger->write("aaaaaaa");
	
	$filter = array();
	/*
	$filter['bookingId'] = 1178385;
	$filter['hash'] = "6c2e5668795cba3ad4541cecfa789a54849e7c5d0983b5073d971186dffd60b2";
	$filter['giftCode'] = "20203112852697";
	*/
	$filter['fnr'] = "171853185";
	$filter['hash'] = "10db62e25b9e062d4d042d9bb002287bc1a16e7fee37783402a1376023f2d963";

    $piletileviApi = $this->piletileviApi;
    $reportResponse = $piletileviApi->downloadTicketData($filter);

	return $dataHandler->response($response, $reportResponse);
});

function getCharset($request, $dataHandler)
{
    $contentCharset = $request->getContentCharset();
    /*
    $headers = $request->getHeaders();
    $sebContentCharset = applySEBCharset($headers, $dataHandler);
    if ($sebContentCharset != "")  $contentCharset = $sebContentCharset;
    */
    return $contentCharset;
}
function applySEBCharset($headers, $dataHandler)
{
    if ($headers && is_array($headers) &&
        (
            (isset($headers['HTTP_ORIGIN'])
                && is_array($headers['HTTP_ORIGIN'])
                && $headers['HTTP_ORIGIN'][0] == "https://e.seb.lt")
            || (isset($headers['HTTP_X_FORWARDED_FOR'])
                && is_array($headers['HTTP_X_FORWARDED_FOR'])
                && ($headers['HTTP_X_FORWARDED_FOR'][0] == "194.176.58.47"
                    || $headers['HTTP_X_FORWARDED_FOR'][0] == "78.24.199.174"))
            || (isset($headers['HTTP_REFERER'])
                && is_array($headers['HTTP_REFERER'])
                && $dataHandler->beginsWith($headers['HTTP_REFERER'][0], "https://e.seb.lt")))) {
        $contentCharset = "windows-1257";
    }
    return $contentCharset;
}
?>
