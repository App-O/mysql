#!/usr/bin/env node

var Schedule = require('node-schedule');
var sprintf  = require('yow').sprintf;
var mkpath   = require('yow').mkpath;

var App = function() {

	function parseArgs() {
		var args = require('commander');

		args.version('1.0.0');
		args.option('-d --database [database]', 'specifies database database');
		args.option('-s --schedule', 'schedule backup', false);
		args.option('-q --quiet', 'do not display commands executed', false);
		args.option('-y --dry', 'dry run', false);

		args.parse(process.argv);

		if (!_args.database)
			throw new Error('Must specify a database.');


		return args;

	}

	function exec(cmd) {

		return new Promise(function(resolve, reject) {
			var cp = require('child_process');

			if (!_args.quiet)
				console.log('$', cmd);

			if (_args.dry) {
				resolve();
			}
			else {
				cp.exec(cmd, function(error, stdout, stderr) {

					if (stdout)
						console.log(stdout);

					//if (stderr)
					//	console.error(stderr);

					if (!error)
						resolve();
					else
						reject(error);

				});

			}

		});

	};

	function runOnce() {

		var now = new Date();

		var database   = _args.database;
		var bucket     = 'gs://mysql.app-o.se/backups';
		var datestamp  = sprintf('%04d-%02d-%02d-%02d-%02d', now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

		var tmpPath    = sprintf('%s/%s', __dirname, 'backups');
		var backupName = sprintf('backup-%s-%s.sql.gz', _args.database, datestamp);
		var backupFile = sprintf('%s/%s', tmpPath, backupName);

		mkpath(tmpPath);

		var commands = [];
		commands.push(sprintf('rm %s/*.gz', tmpPath));
		commands.push(sprintf('mysqldump --triggers --routines --quick --user root -ppotatismos %s | gzip > %s', database, backupFile));
		commands.push(sprintf('gsutil cp %s %s/%s', backupFile, bucket, backupName));

		var promise = Promise.resolve();

		console.log('Running backup...');

		commands.forEach(function(cmd) {
			promise = promise.then(function() {
				return exec(cmd);
			});
		});

		promise.then(function() {
			console.log('Finished.');
		})
		.catch(function(error) {
			console.error(error.message);

		});

	}

	function schedule() {
		var running = false;

		Schedule.scheduleJob('15 23 * * *', function() {

			if (running) {
				console.log('Upps! Running already!!');
			}
			else {
				running = true;
				runOnce();
				running = false;
			}
		});

	}

	function run() {


		try {
			_args = parseArgs();

			if (_args.schedule)
				schedule();
			else
				runOnce();

		}
		catch (error) {
			console.error(error.message);
		}

	}


	run();

};

new App();
