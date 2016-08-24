<?php

use Slim\Slim; 

class DataHandler {

	/**
	 * Verifying required params posted or not
	 */
	public static function verifyParams($required_fields,$request_params) {
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
			$app = Slim::getInstance();
			$response["status"] = "error";
			$response["message"] = 'Required field(s) ' . substr($error_fields, 0, -2) . ' is missing or empty';
			self::response(200, $response);

			$app->stop();
		}
	}


	public static function response($status_code, $response) {
		$app = Slim::getInstance();
		// Http response code
		$app->status($status_code);

		// setting response content type to json
		$app->contentType('application/json');
		error_log(json_encode($response));
		echo json_encode($response);
	}

}

?>
