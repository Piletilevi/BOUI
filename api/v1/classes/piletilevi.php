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

		$data['filter']= array ('oldPassword' => $oldPassword,
								'newPassword' => $newPassword);

		return $this->send("/user/changePassword",$data);

	}

	public function login($username, $password, $remoteip) {

  		$data = array("username" => $username,
					  "password" => $password,
					  "remoteip" => $remoteip);
		
		return $this->send( "/authentication/login", $data );
	}

	public function verifySessionKey($sessionkey) {

		$data= array ('sessionkey' => $sessionkey);

		return $this->send("/authentication/verifySessionKey", $data);
	}
	
	public function languages() {
		
		$cacheItem = $this->cacheManager->getItem("languages");
		$languages = $cacheItem->get();

		if(is_null($languages) || !is_object($languages)) {
			$data = array();
			$languages = $this->send( "/language/languages", $data );
			$cacheItem->set($languages)->expiresAfter(3600);
			$this->cacheManager->save($cacheItem);
		}

		return $languages;
	}

	public function powerbiReport($filter) {
		
		$data['filter']= $filter;
		$data['userid']= $this->getUserFromRequestToken();

		$reportData = $this->send( "/report/powerbiReport", $data, true );

		return $reportData;
	}
	
	public function cardsReport($filter) {
		
		$data['filter']= $filter;
		$data['userid']= $this->getUserFromRequestToken();

		$reportData = $this->send( "/report/cards", $data, true );

		return $reportData;
	}

	public function myEvents($filter) {
		
		$filter['limit'] = 10;
		$data['filter']= $filter;

		$reportData = $this->send( "/event/myEvents", $data );
		
		return $reportData;
	}

	public function concertInfo($filter) {
		
		$cacheItem = $this->cacheManager->getItem("concertInfo".$filter["id"]);
		$concertInfo = $cacheItem->get();

		if(is_null($concertInfo) || !is_object($concertInfo)) {
			$data['filter'] = $filter;
			$concertInfo = $this->send( "/event/concertInfo", $data );
			$cacheItem->set($concertInfo)->expiresAfter(600);
			$this->cacheManager->save($cacheItem);
		}

		return $concertInfo;
	}

	public function showInfo($filter) {
		
		$cacheItem = $this->cacheManager->getItem("showInfo".$filter["id"]);
		$showInfo = $cacheItem->get();

		if(is_null($concertInfo) || !is_object($showInfo)) {
			$data['filter'] = $filter;
			$showInfo = $this->send( "/event/showInfo", $data );
			$cacheItem->set($showInfo)->expiresAfter(600);
			$this->cacheManager->save($cacheItem);
		}
		
		return $reportData;
	}

	public function concertSales($filter) {
		
		$cacheItem = $this->cacheManager->getItem("concertSales".$filter["id"]);
		$reportData = $cacheItem->get();

		if(is_null($reportData) || !is_object($reportData)) {
			$data['filter'] = $filter;
			$reportData = $this->send( "/event/concertSales", $data );
			$cacheItem->set($reportData)->expiresAfter(600);
			$this->cacheManager->save($cacheItem);
		}

		return $reportData;
	}

	public function showSales($filter) {
		
		$cacheItem = $this->cacheManager->getItem("showSales".$filter["id"]);
		$reportData = $cacheItem->get();

		if(is_null($reportData) || !is_object($reportData)) {
			$data['filter'] = $filter;
			$reportData = $this->send( "/event/showSales", $data );
			$cacheItem->set($reportData)->expiresAfter(600);
			$this->cacheManager->save($cacheItem);
		}
		
		return $reportData;
	}

	public function concertOpSales($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/event/concertOpSales", $data );

		return $reportData;
	}

	public function showOpSales($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/event/showOpSales", $data );
		
		return $reportData;
	}

	public function eventSalesReport($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReport", $data );
		
		return $reportData;
	}


	public function boUrl(){
		return $this->getBoUrl();
	}

	public function translations($languageId) {

		$cacheItem = $this->cacheManager->getItem("translations".$languageId);
		$translations = $cacheItem->get();

		if(is_null($translations) || !is_object($translations)) {
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
	private function get($url, $data = array(), $plain = false){
		$papiConfig = $this->getPapiConfig();
		$envConfig = $this->getEnvConfig();
		$query ="?";
		$query .= http_build_query($data);
		$url .= $query;

		$uri = $this->getBasePath().$url;
		
		$request = \Httpful\Request::get($uri)->timeout($papiConfig["timeout"]);
		if ($plain) {
			$request->withoutAutoParsing();
		}
		$response = $request->send();
		
		return $response->body;
	}
	
	private function send($url, $data, $plain = false) {
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
		$request = \Httpful\Request::post($uri)->body($msg)->timeout($papiConfig["timeout"]);

		if ($plain) {
			$request->withoutAutoParsing();
		}
		$response = $request->send();

		$this->app->log->debug( print_r($response->headers,true) );
		
		return $response->body;
	}

	private function getBasePath() {
		$papiConfig = $this->getPapiConfig();
		return $papiConfig["host"].$papiConfig["base"];
	}

	private function getBoUrl(){
		$papiConfig = $this->getPapiConfig();
		return $papiConfig["oldbourl"];
	}

	private function getUserFromRequestToken(){
		$dataHandler = $this->app->container->get("dataHandler");
		
		return $dataHandler->getUserFromToken();
	}

	private function getPapiConfig() {
		return $this->settings["piletilevi"];
	}

	private function getEnvConfig() {
		return $this->settings["env"];
	}
}

?>
