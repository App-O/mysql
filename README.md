#Lights

##Private notes

### Running with **forever**

	$ sudo forever -w start backup.js --database xxx

### Install with **forever-service**

	$ sudo forever-service install backup --script backup.js --scriptOptions " --schedule '15 23 * * *' --database xxx --password xxx" --start

### Controlling the service

	$ sudo service backup stop
	$ sudo service backup start

	$ sudo forever-service delete backup-munch
	$ sudo forever-service install backup-munch --script backup.js  --scriptOptions " --schedule '45 20 * * *' --database munch --password potatismos"

	$ forever-service install backup-strecket  --script backup.js --scriptOptions " --schedule '25 21 * * *' --database strecket --password potatismos" --start
