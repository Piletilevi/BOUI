<?php

use Slim\Slim; 

class Database {

    private $conn;

    function __construct() {        
        $this->connect();
    }

    /**
     * Establishing database connection
     * @return database connection handler
     */
    function connect() {
		$app = Slim::getInstance();
		$dbSettings = $this->getDbConfig();

        // Connecting to mysql database
        $this->conn = new mysqli($dbSettings["host"], 
								 $dbSettings["user"], 
								 $dbSettings["pass"], 
								 $dbSettings["dbname"]);

        // Check for database connection error
        if (mysqli_connect_errno()) {
            echo "Failed to connect to MySQL: " . mysqli_connect_error();
        }
    }

	private function getDbConfig() {
		$app = Slim::getInstance();
		$settings = $app->config("settings");
		return $settings["db"];
	}

    /**
     * Fetching single record
     */
    public function getOneRow($query) {
        $r = $this->conn->query($query.' LIMIT 1') or die($this->conn->error.__LINE__);
        return $result = $r->fetch_assoc();    
    }

    /**
     * Creating new record
     */
    public function insert($obj, $column_names, $table_name) {
        
        $c = (array) $obj;
        $keys = array_keys($c);
        $columns = '';
        $values = '';
        foreach($column_names as $desired_key){ // Check the obj received. If blank insert blank into the array.
           if(!in_array($desired_key, $keys)) {
                $$desired_key = '';
            }else{
                $$desired_key = $c[$desired_key];
            }
            $columns = $columns.$desired_key.',';
            $values = $values."'".$$desired_key."',";
        }
        $query = "INSERT INTO ".$table_name."(".trim($columns,',').") VALUES(".trim($values,',').")";
        $r = $this->conn->query($query) or die($this->conn->error.__LINE__);

        if ($r) {
            $new_row_id = $this->conn->insert_id;
            return $new_row_id;
            } else {
            return NULL;
        }
    }
}

?>
