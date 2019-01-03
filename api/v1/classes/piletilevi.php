<?php

use Httpful\Request;
use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Hmac\Sha256;

class PiletileviApi {
	
    private $app;
    private $container;
	private $cacheManager;
	private $currentUser;
	private $currentLang;
	private $settings;
    private $logger;
	
	private static $piletileviApi; 

	public function __construct() {
		global $app;

		$this->app = $app;
		$this->container = $app->getContainer();
		
		$this->cacheManager = $this->container->get("cacheManager");
		$this->logger = $this->container->get("logger");

		$sessionHandler = $this->container->get("piletileviSessionHandler");
		$session = $sessionHandler->getSession();

		$this->currentUser = $session['user'];
		$this->currentLang = $session['lang'];
		$this->sessionId = $session['sessionId'];

		$this->settings = $this->container->get("settings");
		
		$this->dataHandler = $this->container->get("dataHandler");
	}

	public static function getInstance($refresh = false) {
        
		if (is_null(self::$piletileviApi) || $refresh) {
			self::$piletileviApi = new self();
		} 

		return self::$piletileviApi; 	
	}

	public function getYellowSessionKey($remoteip){
		$data['filter']= array ( 'remoteip' => $remoteip);
		return $this->send("/user/getYellowSessionKey", $data);
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

	public function setCurrentLanguage($currentLanguage) {

		$data['filter']= array ('currentLanguage' => $currentLanguage);

		return $this->send("/user/setCurrentLanguage",$data);

	}
	
	public function setCurrentPoint($currentPointId) {

		$data['filter']= array ('salePointId' => $currentPointId);

		return $this->send("/user/setCurrentPoint",$data);

	}

	public function login($username, $password, $remoteip) {

  		$data = array("username" => $username,
					  "password" => $password,
					  "remoteip" => $remoteip);
		
		return $this->send( "/authentication/login", $data );
	}

	public function logout() {

  		$data = array();
		
		return $this->send( "/authentication/logout", $data );
	}

	public function verifySessionKey() {

		$data= array ();

		return $this->send("/authentication/verifySessionKey", $data );
	}
	
	public function sessionDataKey() {

		$data= array ();

		return $this->send("/authentication/sessionData", $data);
	}

	public function languages() {
		
		$cacheItem = $this->cacheManager->getItem("languages");
		$languages = $cacheItem->get();

		if(is_null($languages) || !is_object($languages)) {
			$data = array();
			$languages = $this->send( "/language/languages", $data );
			$cacheItem->set($languages)->expiresAfter(3600 * 24);
			$this->cacheManager->save($cacheItem);
		}

		return $languages;
	}

	public function powerbiReport($filter, $token, $ip) {
		
		$data['filter']= $filter;
		$data['token']= $token;
		$data['ip']= $ip;

		$reportData = $this->send( "/report/powerbiReport", $data, true );

		return $reportData;
	}
	
	public function cardsReport($filter, $token, $ip) {
		
		$data['filter']= $filter;
		$data['token']= $token;
		$data['ip']= $ip;

		$reportData = $this->send( "/report/cards", $data, true );

		return $reportData;
	}
    public function ticketPurchaseStatus($filter, $token, $ip) {

        $data['filter']= $filter;
        $data['token']= $token;
        $data['ip']= $ip;

        $reportData = $this->send( "/ticket/status", $data, true );

        return $reportData;
    }

    public function clientPurchaseHistory($filter, $token, $ip, $langId) {

        $data['filter']= $filter;
        $data['token']= $token;
        $data['ip']= $ip;
        $data['langId']= $langId;

        $reportData = $this->send( "/report/purchaseHistory", $data );

        return $reportData;
    }

    public function centreEvents($filter) {
        $data['filter'] = $filter;
        $reportData = $this->send( "/info/centreEvents", $data );
        return $reportData;
    }

    public function invoiceAction($action, $filter) {
        $data['filter']= $filter;
        $reportData = $this->send( $action, $data );
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
	
	public function eventSalesCsvReportByOverview($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/csvReport/overview", $data, true );
		
		return $reportData;
	}

	public function eventSalesCsvReportByPriceType($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/csvReport/priceType", $data, true );
		
		return $reportData;
	}

	public function eventSalesCsvReportByPriceClass($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/csvReport/priceClass", $data, true );
		
		return $reportData;
	}
	
	public function eventSalesCsvReportBySectors($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/csvReport/sectors", $data, true );
		
		return $reportData;
	}

	public function eventSalesCsvReportByLocation($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/csvReport/location", $data, true );
		
		return $reportData;
	}

	public function eventSalesXlsReportByOverview($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/xlsReport/overview", $data, true );
		
		return $reportData;
	}

	public function eventSalesXlsReportByPriceType($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/xlsReport/priceType", $data, true );
		
		return $reportData;
	}

	public function eventSalesXlsReportByPriceClass($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/xlsReport/priceClass", $data, true );
		
		return $reportData;
	}
	
	public function eventSalesXlsReportBySectors($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/xlsReport/sectors", $data, true );
		
		return $reportData;
	}

	public function eventSalesXlsReportByLocation($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->send( "/xlsReport/location", $data, true );
		
		return $reportData;
	}

	public function downloadTicket($filter) {
		
		$data['filter']= $filter;

		$reportData = $this->sendOnce( "/ticket/download", $data, true );
		
		return $reportData;
	}

	public function downloadTicketData($filter) {
		
		$data['filter']= $filter;

		$ticketData = $this->sendOnce( "/ticket/downloadData", $data );
		
		return $ticketData;
	}

	public function getSectorInfo($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/event/getSectorInfo", $data );
		
		return $response;
	}
	
	public function addToBasket($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/basket/addToBasket", $data );
		
		return $response;
	}

	public function removeFromBasket($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/basket/removeFromBasket", $data );
		
		return $response;
	}
	
	public function removeFromBooking($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/booking/removeFromBooking", $data );
		
		return $response;
	}

	public function changeBasketTicketType($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/basket/changeBasketTicketType", $data );
		
		return $response;
	}

	public function changeBookingTicketType($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/booking/changeBookingTicketType", $data );
		
		return $response;
	}

	public function myBasket($filter) {

		$data['filter']= $filter;
		
		$response = $this->send( "/basket/myBasket", $data );
		
		return $response;
	}

	public function confirmBasket($filter) {

		$data['filter']= $filter;
		
		$response = $this->send( "/basket/confirmBasket", $data );
		
		return $response;
	}

	public function confirmBooking($filter) {

		$data['filter']= $filter;
		
		$response = $this->send( "/booking/confirmBooking", $data );
		
		return $response;
	}

	public function bookingList($filter) {

		$filter['limit'] = 10;
		$data['filter']= $filter;
		
		$response = $this->send( "/booking/bookingList", $data );
		
		return $response;
	}

	public function reloadConcert($filter) {

		$data['filter']= $filter;
		
		$response = $this->send( "/event/reloadConcert", $data );
		
		return $response;
	}

	public function reloadShow($filter) {

		$data['filter']= $filter;
		
		$response = $this->send( "/event/reloadShow", $data );
		
		return $response;
	}
	
	public function getCountries() {
		
		$languageCode = "";
		
		if ($this->currentLang) {
			$languageCode = $this->currentLang->code; 
		}
		
		$cacheItem = $this->cacheManager->getItem("countries".$languageCode);
		$countries = $cacheItem->get();

		if(is_null($countries) || !is_object($countries)) {
			$data = array();
			$countries = $this->send( "/country/list", $data );
			$cacheItem->set($countries)->expiresAfter(3600);
			$this->cacheManager->save($cacheItem);
		}

		return $countries;
	}

	public function getBookingTypes() {
		
		$languageCode = "";
		
		if ($this->currentLang) {
			$languageCode = $this->currentLang->code; 
		}
		
		$cacheItem = $this->cacheManager->getItem("bookingTypes".$languageCode);
		$bookingTypes = $cacheItem->get();

		if(is_null($bookingTypes) || !is_object($bookingTypes)) {
			$data = array();
			$bookingTypes = $this->send( "/booking/getBookingTypes", $data );
			$cacheItem->set($bookingTypes)->expiresAfter(3600);
			$this->cacheManager->save($cacheItem);
		}

		return $bookingTypes;
	}

	public function getBookingStatuses() {
		
		$languageCode = "";
		
		if ($this->currentLang) {
			$languageCode = $this->currentLang->code; 
		}
		
		$cacheItem = $this->cacheManager->getItem("bookingStatuses".$languageCode);
		$bookingStatuses = $cacheItem->get();

		if(is_null($bookingStatuses) || !is_object($bookingStatuses)) {
			$data = array();
			$bookingStatuses = $this->send( "/booking/getBookingStatuses", $data );
			$cacheItem->set($bookingStatuses)->expiresAfter(3600);
			$this->cacheManager->save($cacheItem);
		}

		return $bookingStatuses;
	}

	public function cancelBooking($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/booking/cancelBooking", $data );
		
		return $response;
	}

	public function myBooking($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/booking/myBooking", $data );
		
		return $response;
	}
	
	public function bookingPayment($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/payment/getBooking", $data );
		
		return $response;
	}

	public function paymentByBookingId($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/payment/paymentByBookingId", $data );
		
		return $response;
	}
	
	public function checkPayment($parameters, $ip) {
		
		$parameters['ip'] = $ip;
		$data['filter']= $parameters;

		$response = $this->sendOnce( "/payment/checkPayment", $data );
		
		return $response;
	}

	public function processPayment($data) {
		
		$response = $this->sendOnce( "/payment/processPayment", $data );
		
		return $response;
	}

	public function addGIftCardToBooking($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/payment/addGIftCardToBooking", $data );
		
		return $response;
	}

	public function removeGiftCardFromBooking($filter) {
		
		$data['filter']= $filter;

		$response = $this->send( "/payment/removeGiftCardFromBooking", $data );
		
		return $response;
	}
	
	public function boUrl(){
		return $this->getBoUrl();
	}

	public function translations($languageId) {
		$cacheItem = $this->cacheManager->getItem("translations".$languageId);
		$translations = $cacheItem->get();
		
		if(is_null($translations) || !is_object($translations) || empty($translations->data)) {
			$translations = $this->reloadCacheTranslations($languageId);
		}
		return $translations;
	}
	
	public function reloadCacheTranslations($languageId) {
		$cacheItem = $this->cacheManager->getItem("translations".$languageId);

		$data = array("languageId" => $languageId);
		$translations = $this->send( "/language/translations", $data );
		$cacheItem->set($translations);
		$this->cacheManager->save($cacheItem);

		return $translations;
	}

	public function reloadApiTranslations() {
        $data = array();
		$response = $this->send( "/language/reload", $data );
		return $response;
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
	
	private function sendOnce($url, $data) {
		return $this->send( $url, $data, false, false );
	}

	private function send($url, $data, $plain = false, $withSessionId = true) {
		$papiConfig = $this->getPapiConfig();
		$envConfig = $this->getEnvConfig();

		if ($withSessionId && !isset($data['sessionId']) && $this->sessionId) {
			$data['sessionId']= $this->sessionId;
		}
		if (!isset($data['langId']) && is_object($this->currentLang)) {
			$data['langId']= $this->currentLang->code;
		}

		$generator = new RandomStringGenerator;
		
        $tokenId   = base64_encode($generator->generate(32));
        $issuedAt  = time();
		$notBefore = $issuedAt - 1;        // Removing 1 sec
		$expire    = $notBefore + 60;      // Adding 60 seconds
		$issuer    = $envConfig["issuer"];  // Retrieve the env name from config file

		$uri = $this->getBasePath().$url;
		
		
		$signer = new Sha256();
		
		$token = (new Builder())->setId($tokenId)
								->setIssuer($issuer)
								//->setIssuedAt($issuedAt)
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
		
		if ($response->hasErrors() || $response->code == 401) {
            //$this->logger->write( "Error causing body:" );
            //$this->logger->write( $response->body );
			$this->app->halt($response->code);
		}
		if ($plain) { 
			return $response->raw_body;
		} else {
			return $response->body;
		}
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
