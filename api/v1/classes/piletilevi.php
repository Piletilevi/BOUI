<?php

use Httpful\Request;
use Firebase\JWT\JWT; 
use Slim\Slim; 

class PiletileviApi {
	
	public function login($username, $password, $remoteip) {

		$data = array("username" => $username,
	  		          "password" => $password,
			          "remoteip" => $remoteip ); 

		return $this->send( "/user/login", $data );
	}
	
	private function send($url, $data) {

		$papiConfig = $this->getPapiConfig();
		$envConfig = $this->getEnvConfig();

		$tokenId   = base64_encode(mcrypt_create_iv(32));
		$issuedAt  = time();
		$notBefore = $issuedAt + 10;     //Adding 10 seconds
		$expire    = $notBefore + 60;    // Adding 60 seconds
		$envName   = $envConfig["name"];  // Retrieve the env name from config file

		$uri = $this->getBasePath().$url;

		$payload = array(
			'iat'  => $issuedAt,         // Issued at: time when the token was generated
			'jti'  => $tokenId,          // Json Token Id: an unique identifier for the token
			'iss'  => $envName,          // Issuer
			'nbf'  => $notBefore,        // Not before
			'exp'  => $expire,           // Expire
			'data' => $data
		);

		$msg = JWT::encode( $payload, $papiConfig["jwtsecret"] ); 
		$response = \Httpful\Request::post($uri)->body($msg)->send();
		
		return json_decode($response->__toString());
	}
	
	private function getBasePath() {
		$papiConfig = $this->getPapiConfig();
		return $papiConfig["host"].$papiConfig["base"];
	}

	private function getPapiConfig() {
		$app = Slim::getInstance();
		$settings = $app->config("settings");
		return $settings["piletilevi"];
	}

	private function getEnvConfig() {
		$app = Slim::getInstance();
		$settings = $app->config("settings");
		return $settings["env"];
	}
}

?>
