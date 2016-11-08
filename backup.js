#!/usr/bin/env node

var Schedule  = require('node-schedule');
var sprintf   = require('yow').sprintf;
var isString  = require('yow').isString;
var mkpath    = require('yow').mkpath;

var App = function() {

	var _args = {};

	function parseArgs() {
		var args = require('commander');

		args.version('1.0.0');
		args.option('-d --database <name>', 'specifies database database');
		args.option('-s --schedule <format>', 'schedule backup (crontab syntax)');
		args.option('-q --quiet', 'do not display commands executed', false);
		args.option('-p --password <password>', 'password for mysql');
		args.option('-u --user <name>', 'MySQL user name (root)', 'root');
		args.option('-b --bucket <name>', 'upload to Google bucket (mysql.app-o.se/backups)', 'mysql.app-o.se/backups');

		args.option('-y --dry', 'dry run', false);

		args.parse(process.argv);

		if (!isString(args.database))
			throw new Error('Must specify a database.');

		if (!isString(args.password))
			throw new Error('Must specify a password.');

		if (!isString(args.bucket))
			throw new Error('Bucket not specified');

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
		var password   = _args.password;
		var bucket     = _args.bucket;
		var user       = _args.user;


		var datestamp  = sprintf('%04d-%02d-%02d-%02d-%02d', now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

		var tmpPath    = sprintf('%s/%s', __dirname, 'backups');
		var backupName = sprintf('%s-%s.sql.gz', database, datestamp);
		var backupFile = sprintf('%s/%s', tmpPath, backupName);

		mkpath(tmpPath);

		var commands = [];
		commands.push(sprintf('rm %s/*.gz', tmpPath));
		commands.push(sprintf('mysqldump --triggers --routines --quick --user %s -p%s %s | gzip > %s', user, password, database, backupFile));
		commands.push(sprintf('gsutil cp %s gs://%s/%s', backupFile, bucket, backupName));

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

		if (!isString(_args.schedule))
			throw new Error('Must specify scheduling.');

		console.log(sprintf('Scheduling backup to run at "%s"...', _args.schedule));

		Schedule.scheduleJob(_args.schedule, function() {

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
