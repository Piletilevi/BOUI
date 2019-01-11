<?php

class FileLogger {

	/**
     * @var resource
     */
    protected $resource;
    /**
     * @var array
     */
    protected $settings;
    /**
     * Constructor
     *
     * Prepare this log writer. Available settings are:
     *
     * path:
     * (string) The relative or absolute filesystem path to a writable directory.
     *
     * name_format:
     * (string) The log file name format; parsed with `date()`.
     *
     * extension:
     * (string) The file extention to append to the filename`.     
     *
     * message_format:
     * (string) The log message format; available tokens are...
     *     %label%      Replaced with the log message level (e.g. FATAL, ERROR, WARN).
     *     %date%       Replaced with a ISO8601 date string for current timezone.
     *     %message%    Replaced with the log message, coerced to a string.
     *
     * @param   array $settings
     * @return  void
     */
    public function __construct($settings = array())
    {
        //Merge user settings
        $this->settings = array_merge(array(
            'path' => './logs',
            'name_prefix' => '',
            'name_format' => 'Y-m-d',
            'extension' => 'log',
            'message_format' => '%date% - %message%'
        ), $settings);
        //Remove trailing slash from log path
        $this->settings['path'] = rtrim($this->settings['path'], DIRECTORY_SEPARATOR);
    }
    /**
     * Write to log
     *
     * @param   mixed $object
     * @return  void
     */
    public function write($object)
    {
		$message = var_export($object, true);

        //Get formatted log message
        $message = str_replace(array(
            '%date%',
            '%message%'
        ), array(
            date('c'),
            $message
        ), $this->settings['message_format']);
        //Open resource handle to log file
        if (!$this->resource) {
            $filename = date($this->settings['name_format']);
            if (! empty($this->settings['name_prefix'])) {
                $filename = $this->settings['name_prefix'].$filename;
            }
            if (! empty($this->settings['extension'])) {
                $filename .= '.' . $this->settings['extension'];
            }
            $this->resource = fopen($this->settings['path'] . DIRECTORY_SEPARATOR . $filename, 'a');
        }
        //Output to resource
        fwrite($this->resource, $message . PHP_EOL);
    }
}

?>
