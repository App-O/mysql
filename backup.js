#!/usr/bin/env node

var sprintf    = require('yow').sprintf;
var isString   = require('yow').isString;
var mkpath     = require('yow').mkpath;
var prefixLogs = require('yow').prefixLogs;

var App = function(argv) {

	var argv = parseArgs();

	function parseArgs() {

		var args = require('yargs');

		args.usage('Usage: $0 [options]');
		args.option('h', {alias:'help', describe:'Displays this information'});
		args.option('d', {alias:'database', describe:'Specifies mysql database', required:true});
		args.option('b', {alias:'bucket', describe:'Upload backup to Google bucket', default:'gs://mysql.app-o.se/backups'});
		args.option('s', {alias:'schedule', describe:'Schedule backup, crontab syntax'});
		args.option('p', {alias:'password', describe:'Password for mysql', required:true});
		args.option('V', {alias:'verbose', describe:'Display commands executed', default:true});
		args.option('u', {alias:'user', describe:'mysql user name', default:'root'});
		args.option('n', {alias:'dry-run', describe:'Don\'t actually run any commands', default:false});

		args.wrap(null);

		args.check(function(argv) {

			return true;
		});

		return args.argv;
	}

	function exec(cmd) {

		return new Promise(function(resolve, reject) {
			var cp = require('child_process');

			if (argv.verbose)
				console.log('$', cmd);

			if (argv.dryRun) {
				resolve();
			}
			else {
				cp.exec(cmd, function(error, stdout, stderr) {

					if (stdout)
						console.log(stdout);

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


		var database   = argv.database;
		var password   = argv.password;
		var bucket     = argv.bucket;
		var user       = argv.user;


		var datestamp  = sprintf('%04d-%02d-%02d-%02d-%02d', now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

		var tmpPath    = sprintf('%s/%s', __dirname, 'backups');
		var backupName = sprintf('%s-%s.sql.gz', database, datestamp);
		var backupFile = sprintf('%s/%s', tmpPath, backupName);

		mkpath(tmpPath);

		var commands = [];
		commands.push(sprintf('rm -f %s/*.gz', tmpPath));
		commands.push(sprintf('mysqldump --triggers --routines --quick --user %s -p%s %s | gzip > %s', user, password, database, backupFile));
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

		var Schedule = require('node-schedule');
		var running = false;

		console.log(sprintf('Scheduling backup to run at "%s"...', argv.schedule));

		Schedule.scheduleJob(argv.schedule, function() {

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
			prefixLogs();

			if (argv.schedule)
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
