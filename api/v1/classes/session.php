<?php

class PiletileviSessionHandler {

	private static $piletileviSession; 

	public static function getInstance($refresh = false) {
        
		if (is_null(self::$piletileviSession) || $refresh) {
			self::$piletileviSession = new self();
        
		} 

		return self::$piletileviSession; 	
	}

	public function getSession(){
		if (!isset($_SESSION)) {
			session_start();
		}
		$sess = array();
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
			session_start();
		}
		if(isset($_SESSION['user'])) {
			unset($_SESSION['user']);
			$msg="Logged Out Successfully...";
		}
		else {
			$msg = "Not logged in...";
		}
		return $msg;
	}
}

?>
