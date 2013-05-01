var assert = require('assert');
var fs = require('fs');
var cluster = require('cluster');
var byline = require('byline');

var ClusterFileWriter = require('../lib/ClusterFileWriter');

try {
	fs.unlinkSync('test.log');
} catch (e) {

}

var writer = new ClusterFileWriter.Master('test.log');

cluster.setupMaster({
	exec : "ClusterFileWriter.test.Worker.js"              
});

var settings = { batchSize: 2000, numberOfBatches: 100, workers: 4 };

var expectedMessages = settings.workers * settings.batchSize * settings.numberOfBatches

var lastMW = 0;

var ref = setInterval(function() {
	if (lastMW > 0) {
		console.log('%s per second, total of %s out of %s', writer.messagesWritten - lastMW, writer.messagesWritten, expectedMessages);
	}
	
	lastMW = writer.messagesWritten;

	//console.log(writer.messagesWritten);

	if (writer.messagesWritten === expectedMessages) {
		clearInterval(ref);
		console.log('success! now testing the integrity of the data');

		setTimeout(testDataIntegrity, 2000);
	}
}, 1000);

for (var i = 0; i < settings.workers; i++) {
	settings.name = i;
	cluster.fork(settings);
}


function testDataIntegrity() {
	var dummyPart = '--------------------------------------------------------------------------------';

	var stream = byline(fs.createReadStream('test.log'));

	var data = {};

	for (var i = 0; i < settings.workers; i++) {
		data[i] = [];
		for (var nb = 0; nb < settings.numberOfBatches; nb++) {
			data[i].push([]);			
		}
	}

	var lines = 0;

	stream.on('data', function(line) {
		lines++
		var splitted = line.split(':');

		assert.strictEqual(4, splitted.length);
		assert.strictEqual(dummyPart, splitted[0]);

		data[splitted[1]][parseInt(splitted[2]) - 1].push(splitted[3]);
	});

	stream.on('end', function() {
		
		assert.strictEqual(expectedMessages, lines);
		
		for (var w = 0; w < settings.workers; w++) {
			for (var nb = 0; nb < settings.numberOfBatches; nb++) {
				var m = data[w][nb];

				assert.strictEqual(settings.batchSize, m.length);
			}
		}
		
		console.log('if there are not assert errors then data integrity was verified successfully');		
	});
}
