<?php

class PiletilevSessionHandler {

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
