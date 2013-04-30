var assert = require('assert');
var fs = require('fs');
var cluster = require('cluster');

var ClusterFileWriter = require('../lib/ClusterFileWriter');

try {
	fs.unlinkSync('deathtest.log');
} catch (e) {

}

var writer = new ClusterFileWriter.Master('deathtest.log');

cluster.setupMaster({
	exec : "WorkerDeath.test.WorkerThatDies.js"              
});

var ref = setInterval(function() {
	console.log(writer.messagesWritten);
	// if (writer._pausedWorkers.length > 0)
	// 	console.log(writer._pausedWorkers);
}, 100);

for (var i = 0; i < 1; i++) {	
	cluster.fork();
}