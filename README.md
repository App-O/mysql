#Lights

## Running with **forever**

	$ sudo forever -w start backup.js

## Install with **forever-service**

	$ sudo forever-service install backup --script backup.js --scriptOptions " --schedule '15 23 * * *' --database xxx --password xxx"


## Controlling the service

	$ sudo service backup stop
	$ sudo service backup start
