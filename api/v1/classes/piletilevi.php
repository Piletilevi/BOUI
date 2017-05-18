<?php
use Httpful\Request;
use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;
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
		
		$this->dataHandler = $this->app->container->get("dataHandler");
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
	
	public function clearCache() {
		$this->cacheManager->clear();
	}

	public function getStats() {
		return $this->cacheManager->getStats();
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
		
		$filter['limit'] = 5;
		$data['filter']= $filter;

		$reportData = $this->send( "/event/myEvents", $data );
		
		return $reportData;
	}

	public function myEventsCount($filter) {
		
		$data['filter']= $filter;
		$reportData = $this->send( "/event/myEventsCount", $data );
		
		return $reportData;
	}
	
	public function relatedEvents($filter) {
		
		$filter['limit'] = 5;
		$data['filter']= $filter;

		$reportData = $this->send( "/event/relatedEvents", $data );
		
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

	public function ticketStatus($filter) {
		
		$data['filter']= $filter;

		$ticketStatusData = $this->send( "/venue/getTicketStatus", $data );
		
		return $ticketStatusData;
	}

	public function concertData($filter) {
		
		$data['filter']= $filter;

		$concertInfoData = $this->send( "/venue/getConcertData", $data );
		
		return $concertInfoData;
	}

	public function sectionInfo($filter) {
		
		$data['filter']= $filter;

		$sectionInfoData = $this->send( "/venue/getSectionInfo", $data );
		
		return $sectionInfoData;
	}
	
	public function sectionTickets($filter) {
		
		$data['filter']= $filter;

		$sectionTicketsData = $this->send( "/venue/getSectionTickets", $data );
		
		return $sectionTicketsData;
	}
	
	public function rejectTicket($filter) {
		
		$data['filter']= $filter;

		$rejectTicketData = $this->send( "/venue/rejectTicket", $data );
		
		return $rejectTicketData;
	}	

	public function showInfo($filter) {
		
		$cacheItem = $this->cacheManager->getItem("showInfo".$filter["id"]);
		$showInfo = $cacheItem->get();

		if(is_null($showInfo) || !is_object($showInfo)) {
			$data['filter'] = $filter;
			$showInfo = $this->send( "/event/showInfo", $data );
			$cacheItem->set($showInfo)->expiresAfter(600);
			$this->cacheManager->save($cacheItem);
		}
		
		return $showInfo;
	}

	public function concertSales($filter) {
		
		$data['filter'] = $filter;

		$reportData = $this->send( "/event/concertSales", $data );

		return $reportData;
	}

	public function showSales($filter) {
		
		$data['filter'] = $filter;

		$reportData = $this->send( "/event/showSales", $data );
		
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

	public function eventSalesReportByStatus($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByStatus", $data );
		
		return $reportData;
	}

	public function eventSalesReportByDate($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByDate", $data );
		
		return $reportData;
	}

	public function eventSalesReportByWeek($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByWeek", $data );
		
		return $reportData;
	}

	public function eventSalesReportByMonth($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByMonth", $data );
		
		return $reportData;
	}

	public function eventSalesReportByPriceType($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByPriceType", $data );
		
		return $reportData;
	}

	public function eventSalesReportByPriceTypeDate($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByPriceTypeDate", $data );
		
		return $reportData;
	}

	public function eventSalesReportByPriceTypeWeek($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByPriceTypeWeek", $data );
		
		return $reportData;
	}

	public function eventSalesReportByPriceTypeMonth($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByPriceTypeMonth", $data );
		
		return $reportData;
	}

	public function eventSalesReportByPriceClass($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByPriceClass", $data );
		
		return $reportData;
	}

	public function eventSalesReportByPriceClassDate($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByPriceClassDate", $data );
		
		return $reportData;
	}

	public function eventSalesReportByPriceClassWeek($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByPriceClassWeek", $data );
		
		return $reportData;
	}

	public function eventSalesReportByPriceClassMonth($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByPriceClassMonth", $data );
		
		return $reportData;
	}

	public function eventSalesReportBySectors($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportBySectors", $data );
		
		return $reportData;
	}

	public function eventSalesReportByLocation($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/report/eventSalesReportByLocation", $data );
		
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

		if (is_object($this->currentUser) && property_exists($this->currentUser, 'userId') && property_exists($this->currentUser, 'point')) {
			if (!isset($data['userid'])) {
				$data['userid']= $this->currentUser->userId;
			}
			if (!isset($data['salepointid'])) {
				$data['salepointid']= $this->currentUser->point;
			}
		}
		
		if (is_object($this->currentLang)) {
			if (!isset($data['langId'])) {
				$data['langId']= $this->currentLang->code;
			}
		}

		$tokenId   = base64_encode(mcrypt_create_iv(32));
		$issuedAt  = time();
		$notBefore = $issuedAt + 10;     //Adding 10 seconds
		$expire    = $notBefore + 60;    // Adding 60 seconds
		$envName   = $envConfig["name"];  // Retrieve the env name from config file

		$uri = $this->getBasePath().$url;
		
		$signer = new Sha256();
		
		$token = (new Builder())->setId($tokenId)
								->setIssuer($envName)
								->setIssuedAt($issuedAt)
								->setNotBefore($notBefore)
								->setExpiration($expire)
								->set('data', $data)
								->sign($signer, $papiConfig["jwtsecret"])
								->getToken();
		
		$request = \Httpful\Request::post($uri)->body($token)->timeout($papiConfig["timeout"]);

		if ($plain) {
			$request->withoutAutoParsing();
		}
		$response = $request->send();

		//$this->app->log->debug( print_r($response->headers,true) );
		//$this->app->log->debug( print_r($response->body) );
		
		if ($response->hasErrors()) {
			$this->app->halt($response->code);
		}
		
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
