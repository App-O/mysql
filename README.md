#Lights

## Running with **forever**

	$ sudo forever -w start backup.js

## Install with **forever-service**

	$ sudo forever-service install back --script backup.js

## Controlling the service

	$ sudo service backup stop
	$ sudo service backup start
