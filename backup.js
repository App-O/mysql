#!/usr/bin/env node

var sprintf = require('yow').sprintf;
var mkpath = require('yow').mkpath;

var App = function() {

	function exec(cmd) {

		return new Promise(function(resolve, reject) {
			var cp = require('child_process');

			console.log('$', cmd);

			resolve();
			/*
			cp.exec(cmd, function(error, stdout, stderr) {

				if (stdout)
					console.log(stdout);

				if (stderr)
					console.error(stderr);

				if (!error)
					resolve();
				else
					reject(error);

			});*/

		});

	};

	function run() {

		var now = new Date();

		var datestamp = sprintf('%04d-%02d-%02d-%02d-%02d', now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
		var tmpPath = sprintf('%s/%s', __dirname, 'backups');
		var backupName = sprintf('mysql-backup-%s.sql.gz', datestamp);
		var backupFile = sprintf('%s/mysql-backup-%s.sql.gz', tmpPath, datestamp);
		var database = 'strecket';
		var bucket = 'gs://mysql.app-o.se/backups';

		mkpath(tmpPath);

		var commands = [];
		commands.push(sprintf('mysqldump --triggers --routines --quick --user root -ppotatismos %s > %s', database, backupFile));
		commands.push(sprintf('gsutil cp %s %s/%s', backupFile, bucket, backupName));
		commands.push(sprintf('rm %s', backupFile));

		var promise = Promise.resolve();

		commands.forEach(function(cmd) {
			promise = promise.then(function() {
				return exec(cmd);
			});
		});

		promise.then(function() {
			console.log('Finished.');
		})
		.catch(function(error) {
			console.log(error);

		});

	}
	run();

};

new App();
