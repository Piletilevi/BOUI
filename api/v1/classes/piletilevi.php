<?php
use Httpful\Request;
use Firebase\JWT\JWT;
use Slim\Slim;

class PiletileviApi {
	
    private $app;
	private $cacheManager;
	private $currentUser;
	private $currentLang;
	private $settings;
	
	private static $piletileviApi; 

	public function __construct() {
		$this->app = Slim::getInstance();
		$this->cacheManager = $this->app->container->get("cacheManager");

		$sessionHandler = $this->app->container->get("piletileviSessionHandler");
		$session = $sessionHandler->getSession();

		$this->currentUser = $session['user'];
		$this->currentLang = $session['lang'];

		$this->settings = $this->app->config("settings");
	}

	public static function getInstance($refresh = false) {
        
		if (is_null(self::$piletileviApi) || $refresh) {
			self::$piletileviApi = new self();
		} 

		return self::$piletileviApi; 	
	}

	public function getSessionKey($username, $remoteip){
		$data['filter']= array ('username'=>$username,
			'remoteip' => $remoteip,
			'langId' => $this->currentLang->code);
		$data['userid']= $username;
		return $this->send("/user/getSessionKey",$data);
	}

	public function changePassword($oldPassword, $newPassword) {

		$data['filter']= array ('oldPassword'=>$oldPassword,
			'newPassword' => $newPassword);
		return $this->send("/user/changePassword",$data);

	}

	public function login($username, $password, $remoteip) {

		$data = array("username" => $username,
			"password" => $password,
			"remoteip" => $remoteip );
		
		return $this->send( "/authentication/login", $data );
	}

	public function verifySessionKey($sessionkey) {

		$data= array ('sessionkey' => $sessionkey);

		return $this->send("/authentication/verifySessionKey", $data);
	}
	
	public function languages() {
		
		$cacheItem = $this->cacheManager->getItem("languages");
		$languages = $cacheItem->get();

		if(is_null($languages)) {
			$languages = $this->get( "/language/languages" );
			$cacheItem->set($languages)->expiresAfter(3600);
			$this->cacheManager->save($cacheItem);
		}
		return $languages;
	}

	public function powerbiReport($filter) {
		
		$data['filter']= $filter;
		$data['userid']= $this->getPowerBiUser();

		$reportData = $this->send( "/report/powerbiReport", $data );

		return $reportData;
	}
	
	public function cardsReport($filter) {
		
		$data['filter']= $filter;
		$data['userid']= $this->getPowerBiUser();

		$reportData = $this->send( "/report/cards", $data );

		return $reportData;
	}

	public function myEvents($filter) {
		
		$filter['limit'] = 10;
		$data['filter']= $filter;

		$reportData = $this->send( "/report/myEvents", $data );
		
		return $reportData;
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
			$cacheItem->set($translations)->expiresAfter(3600);
			$this->cacheManager->save($cacheItem);
		}
		return $translations;
	}
	
	private function isValidUser() {
		if (is_object($this->currentUser)) {
			return $this->currentUser->userId > 0;
		}
		return false;
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

		$response = \Httpful\Request::get($uri)->timeout($papiConfig["timeout"])->send();
		return  json_decode($response->__toString());
	}
	
	private function send($url, $data) {
		$papiConfig = $this->getPapiConfig();
		$envConfig = $this->getEnvConfig();
		
		if (is_object($this->currentUser)) {
			if (!isset($data['userid'])) {
				$data['userid']= $this->currentUser->userId;
			}
			if (!isset($data['salepointid'])) {
				$data['salepointid']= $this->currentUser->point;
			}
		}

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
		$response = \Httpful\Request::post($uri)->body($msg)->timeout($papiConfig["timeout"])->send();

		//$this->app->log->debug( print_r($response->headers,true) );
		
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

	private function getPowerBiUser(){
		$papiConfig = $this->getPapiConfig();
		return $papiConfig["powerbiuser"];
	}

	private function getPapiConfig() {
		return $this->settings["piletilevi"];
	}

	private function getEnvConfig() {
		return $this->settings["env"];
	}
}

?>
