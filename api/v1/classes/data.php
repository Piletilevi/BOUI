<?php

use Slim\Slim; 

class DataHandler {

    private $app;
	private static $dataHandler; 
	private $settings;

	public function __construct() {
		$this->app = Slim::getInstance();
		$this->settings = $this->app->config("settings");
	}

	public static function getInstance($refresh = false) {
        
		if (is_null(self::$dataHandler) || $refresh) {
			self::$dataHandler = new self();
        
		} 

		return self::$dataHandler; 	
	}

	/**
	 * Verifying required params posted or not
	 */
	public function verifyParams($required_fields, $request_params) {
		$error = false;
		$error_fields = "";
		foreach ($required_fields as $field) {
			if (!isset($request_params->$field) || strlen(trim($request_params->$field)) <= 0) {
				$error = true;
				$error_fields .= $field . ', ';
			}
		}

		if ($error) {
			// Required field(s) are missing or empty
			// echo error json and stop the app
			$response = array();
			$response["status"] = "error";
			$response["message"] = 'Required field(s) ' . substr($error_fields, 0, -2) . ' is missing or empty';
			$this->response(200, $response);

			$this->app->stop();
		}
	}
	
	public function getMessages($errors) {
		if ($errors && is_array($errors)) {
			$messages = array();
			foreach($errors as $error) {
				$messages[] = $error->message;
			}

			return join(", ", $messages);
		}
		return "";
	}
	/**
	 * Verifying required token
	 */
	public function verifyToken() {
		$token = $this->app->request->params("token");

		if (!$this->isValidToken($token)) {
			// Required field(s) are missing or empty
			// echo error json and stop the app
			$response = array();
			$response["status"] = "error";
			$response["message"] = 'Invalid access token';
			$this->response(401, $response);

			$this->app->stop();
		}
	}

	/**
	 * Getting user from token
	 */
	public function getUserFromToken() {
		$token = $this->app->request->params("token");
		
		$tokens = $this->getTokens();

		foreach($tokens as $t=>$u) {
			if ($token == $t) {
				return $u;
			}
		}
		
		return "";
	}

	public function response($status_code, $response) {
		// Http response code
		$this->app->status($status_code);

		// setting response content type to json
		$this->app->contentType('application/json');
		echo json_encode($response);
	}

	public function responseAsText($status_code, $response) {
		// Http response code
		$this->app->status($status_code);

		// setting response content type to json
		$this->app->contentType('application/json');
		echo $response;
	}

	public function responseAsCsv($status_code, $response) {
		// Http response code
		$this->app->status($status_code);

		// setting response content type to json
		$this->app->contentType('text/csv');
		echo $response;
	}
	
	private function getTokens() {
		return $this->settings["tokens"];
	}

	private function isValidToken($token) {
		
		$tokens = $this->getTokens();

		foreach($tokens as $t=>$u) {
			if ($token == $t) {
				return true;
			}
		}
		
		return false;
	}
}

?>
