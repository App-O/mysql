#!/usr/bin/env node

var sprintf = require('yow').sprintf;



var App = function() {

	function exec(cmd) {

		return new Promise(function(resolve, reject) {
			var cp = require('child_process');

			console.log('$', cmd);

			cp.exec(cmd, function(error, stdout, stderr) {

				if (stdout)
					console.log(stdout);

				if (stderr)
					console.error(stderr);

				if (!error)
					resolve();
				else
					reject(error);

			});

		});

	};

	function run() {
		var now = new Date();
		var datestamp = sprintf('%04d-%02d-%02d-%02d-%02d', now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
		var backupFile = sprintf('mysql-backup-%s.sql.gz', datestamp);
		console.log(backupFile);

		//var backupCommand = sprintf('mysqldump --triggers --routines --quick --user root -ppotatismos strecked | gzip > %s', backupFile);
		var backupCommand = sprintf('mysqldump --triggers --routines --quick --user root -ppotatismos strecket > %s', backupFile);

		exec(backupCommand).then(function() {
			
		})
		.catch(function(error) {

		});

	}
	run();
	//mysqldump --triggers --routines --quick --user root -ppotatismos munch | gzip > ${SRC}


//	mysqldump --triggers --routines --quick --user root -ppotatismos munch | gzip > ${SRC}

};

new App();
