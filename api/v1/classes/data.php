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
		
		if (is_array($request_params)) {
			$request_params = $this->convertToObject($request_params);
		}
		
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
	 * Verifying required token
	 */
	public function verifyToken($request) {
		$token = $request->getParam("token");

		if (!$token) {
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
	 * get user IP
	 */
	public function getUserIP() {
		$ip = $_SERVER['REMOTE_ADDR'];
		if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) { 
			$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
		}
		if ($ip) {
			$iplist = explode(",", $ip);
			$ip = $iplist[0];
		}
		return $ip;
	}
	
	public function convertToObject($array) {
        $object = new stdClass();
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $value = $this->convertToObject($value);
            }
            $object->$key = $value;
        }
        return $object;
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

	/**
	 * Checking source encoding and convert it to utf-8
	 */
	public function fixEncoding($data, $encoding) {
		if (isset($encoding) && strtolower($encoding) != "utf-8") {
			$toEncoding = "";
			if (strtolower($encoding) == "windows-1257") {
				$toEncoding = "ISO-8859-13";
			}
			if ($toEncoding != "") {
				if (is_array($data)) {
					foreach ($data as $key => $value) {
						$data[$key] = $this->fixEncoding($value, $encoding);
					}
				} elseif (is_string($data)) {
					return mb_convert_encoding($data, "UTF-8", $toEncoding);
				}
				return $data;				
			}
		}
		return $data;				
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
	 * Replacing whitespaces with _ and returns substring 12
	 */
	public function getShortName($name) {
		
		mb_internal_encoding("UTF-8");
		
		$replaceSymbols = array("'", "\"", "/", "\\");
		$name = str_replace($replaceSymbols, "", $name);
		
		$name = preg_replace('/(\s\s+|\t|\n)/', ' ', $name);
		if (mb_strlen($name) > 21) {
			$name = trim(mb_substr($name, 0, 21));
		}
		$name = preg_replace('/\s+/', '_', $name);

		return trim($name);
	}
	
	public function response($response, $data, $status=200) {
		return $response->withJson($data, $status);
	}

	public function responseAsText($response, $data) {
		return $response->withJson($data);
	}

	public function responseAsCsv($response, $data) {
		return $response->withHeader('Content-Type', 'text/csv; charset=UTF-8')
						->write($data);
	}

	public function responseAsXls($response, $data) {
		return $response->withHeader('Content-Type', 'application/vnd.ms-excel; charset=UTF-8')
						->write($data);
	}

	public function responseAsPdf($response, $data) {
		return $response->withHeader('Content-Type', 'application/pdf; charset=UTF-8')
						->write($data);
	}

	public function responseAsPdfAttachment($response, $filename, $data) {
		return $response->withHeader('Content-Type', 'application/pdf; charset=UTF-8')
					    ->withHeader('Content-Disposition', 'attachment;filename="'.$filename.'"; filename*=UTF-8\' \''.rawurlencode($filename))
						->write($data);
	}
}

?>
