<?php
use Httpful\Request;
use Firebase\JWT\JWT;
use Slim\Slim;
use \Slim\Logger\DateTimeFileWriter;

class PiletileviApi {
	
    private $app;
	private $cacheManager;
	private $settings;
	private $logger;

	public function __construct() {
		$this->app = Slim::getInstance();
		$this->cacheManager = $this->app->container->get("cacheManager");
		$this->settings = $this->app->config("settings");
		$this->logger = $this->app->container->get("logger");
   }

	public function login($username, $password, $remoteip) {

		$data = array("username" => $username,
			"password" => $password,
			"remoteip" => $remoteip );

		return $this->send( "/user/login", $data );
	}

	public function verifySessionKey($sessionkey) {

		$data= array ('sessionkey' => $sessionkey);

		return $this->send("/user/verifySessionKey",$data);
	}
	
	public function languages() {
		
		$cacheItem = $this->cacheManager->getItem("languages");
		$languages = $cacheItem->get();

		if(is_null($languages)) {
			$languages = $this->get( "/language/languages" );
			$cacheItem->set($languages);
			$this->cacheManager->save($cacheItem);
		}
		return $languages;
	}
	
	public function boUrl(){
		return $this->getBoUrl();
	}

	public function translations($languageId) {

		$cacheItem = $this->cacheManager->getItem("translations".$languageId);
		$translations = $cacheItem->get();

		if(is_null($translations)) {
			$data = array("languageId" => $languageId);
			$translations = $this->send( "/language/translations", $data );
			$cacheItem->set($translations);
			$this->cacheManager->save($cacheItem);
		}
		return $translations;
	}
	
	public function getSessionKey($username, $remoteip, $langid){
		$data['filter']= array ('username'=>$username,
			'remoteip' => $remoteip,
			'langId' => $langid);
		$data['userid']= $username;
		return $this->send("/session/getSessionKey",$data);
	}

	/**
	 * @param $url
	 * @param $data [] -query params
	 * @return mixed
	 */
	private function get($url, $data = array()){
		$papiConfig = $this->getPapiConfig();
		$envConfig = $this->getEnvConfig();
		$query ="?";
		$query .= http_build_query($data);
		$url .= $query;

		$uri = $this->getBasePath().$url;

		$response = \Httpful\Request::getQuick($uri);
		return  json_decode($response->__toString());
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

		//$this->logger->write( print_r($response->headers,true),"INFO");

		return json_decode($response->__toString());
	}

	private function getBasePath() {
		$papiConfig = $this->getPapiConfig();
		return $papiConfig["host"].$papiConfig["base"];
	}

	private function getBoUrl(){
		$papiConfig = $this->getPapiConfig();
		return $papiConfig["oldbourl"];
	}

	private function getPapiConfig() {
		return $this->settings["piletilevi"];
	}

	private function getEnvConfig() {
		return $this->settings["env"];
	}
}

?>
