#Lights

##Private notes

### Running with **forever**

	$ sudo forever -w start backup.js --database xxx

### Install with **forever-service**

	$ sudo forever-service install backup --script backup.js --scriptOptions " --schedule '15 23 * * *' --database xxx --password xxx" --start

### Controlling the service

	$ sudo service backup stop
	$ sudo service backup start

#### Backing some databases

	$ sudo forever-service delete backup-munch
	$ sudo forever-service install backup-munch --script backup.js  --scriptOptions " --schedule '00 22 * * *' --database munch --password potatismos" --start

	$ sudo forever-service delete backup-strecket
	$ sudo forever-service install backup-strecket --script backup.js --scriptOptions " --schedule '00 22 * * *' --database strecket --password potatismos" --start
