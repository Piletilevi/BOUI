<?php

class DataHandler {

    private $app;
	private static $dataHandler; 
	private $settings;
    private $container;

	public function __construct() {
		global $app;
		
		$this->app = $app;
		$this->container = $app->getContainer();
		$this->settings = $this->container->get("settings");
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
			$r = array();
			$r["status"] = "error";
			$r["message"] = 'Required field(s) ' . substr($error_fields, 0, -2) . ' is missing or empty';
			return $r;
		}
		
		return null;
	}

	/**
	 * Clearing all null values from data array
	 */
	public function clearData($data) {
		$clearedData = array();
		foreach ($data as $key=>$value) {
			if (isset($value) || strlen(trim($value)) > 0) {
				$clearedData[$key] = $value;
			}
		}
		return $clearedData;
	}
	
	public function getMessages($errors) {
		if ($errors && is_array($errors)) {
			$messages = array();
			foreach($errors as $error) {
				$msg = $error->message;
				if (!$msg) {
					$msg = $error->code;
				} else {
					$msg .= " (".$error->code.")";
				}
				$messages[] = $msg;
			}
			return join(", ", $messages);
		}
		return "";
	}
	/**
	 * Verifying required token
	 */
	public function verifyToken($request) {
		$token = $request->getParam("token");

		if (!$this->isValidToken($token)) {
			// Required field(s) are missing or empty
			// echo error json and stop the app
			$r = array();
			$r["status"] = "error";
			$r["message"] = 'Invalid access token';
			
			return $r;
		}
		
		return null;
	}

	/**
	 * Getting user from token
	 */
	public function getUserFromToken($request) {
		$token = $request->getParam("token");
		
		$tokens = $this->getTokens();

		foreach($tokens as $t=>$u) {
			if ($token == $t) {
				return $u;
			}
		}
		
		return "";
	}

	public function response($response, $data, $status=200) {
		return $response->withJson($data, $status);
	}

	public function responseAsText($response, $data) {
		return $response->withJson($data);
	}

	public function responseAsCsv($response, $data) {
		return $response->withHeader('Content-Type', 'text/csv')
						->write($data);
	}

	public function responseAsXls($response, $data) {
		return $response->withHeader('Content-Type', 'application/vnd.ms-excel')
						->write($data);
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
