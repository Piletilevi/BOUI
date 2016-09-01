<?php

use Slim\Slim; 

class DataHandler {

    private $app;
	private static $dataHandler; 

	public function __construct() {
		$this->app = Slim::getInstance();
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


	public function response($status_code, $response) {
		// Http response code
		$this->app->status($status_code);

		// setting response content type to json
		$this->app->contentType('application/json');
		echo json_encode($response);
	}

}

?>
