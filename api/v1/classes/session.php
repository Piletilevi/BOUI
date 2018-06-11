<?php

class PiletileviSessionHandler {

	private static $piletileviSession; 

	public static function getInstance($refresh = false) {
        
		if (is_null(self::$piletileviSession) || $refresh) {
			self::$piletileviSession = new self();
        
		} 

		return self::$piletileviSession; 	
	}

	public function setUser($user){
        $this->setSessionValue( 'user', $user );
	}
	
	public function setUserPointId($pointId){
        $this->checkSession();
        $_SESSION['user']->point = $pointId;
	}

	public function setCurrentLanguage($lang){
        $this->setSessionValue( 'lang', $lang );
	}

	public function setSessionId($sessionId){
        $this->setSessionValue( 'sessionId', $sessionId );
	}

	public function getSession(){
        $this->checkSession();
		$sess = array();
		if(isset($_SESSION['sessionId'])) {
			$sess["sessionId"] = $_SESSION['sessionId'];
		} else {
			$sess["sessionId"] = '';
		}
		if(isset($_SESSION['user'])) {
			$sess["user"] = $_SESSION['user'];
		} else {
			$sess["user"] = '';
		}
		if(isset($_SESSION['lang'])) {
			$sess["lang"] = $_SESSION['lang'];
		} else {
			$sess["lang"] = '';
		}
		return $sess;
	}

	public function destroySession(){
		if (!isset($_SESSION)) {
			@session_start();
		}

		if(isset($_SESSION['user'])) {
			unset($_SESSION['user']);
			$msg="Logged Out Successfully...";
		}
		else {
			$msg = "Not logged in...";
		}

		if(isset($_SESSION['sessionId'])) {
			unset($_SESSION['sessionId']);
		}
		
		return $msg;
	}
	
	public function isUserExist(){
		return isset($_SESSION['user']);
	}
	
	public function resetSession(){
		if (!isset($_SESSION)) {
			@session_start();
		}
		unset($_SESSION['user']);
		unset($_SESSION['sessionId']);
	}
	
	public function setSessionValue($key, $value){
        $this->checkSession();
        $_SESSION[$key] = $value;
	}
	
	private function checkSession() {
		if (!isset($_SESSION)) {
			@session_start();
		}
	}
}

?>
