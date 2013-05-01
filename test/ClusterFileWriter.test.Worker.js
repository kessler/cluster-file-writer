var ClusterFileWriter = require('../lib/ClusterFileWriter');

process.on('uncaughtException', function(err) {
	console.error(err);
})

var worker = new ClusterFileWriter.Worker();

var batches =  parseInt(process.env.numberOfBatches);
var batchSize = parseInt(process.env.batchSize);

console.log(process.env.name, batches, batchSize);

var ref2 = setInterval(function() {
	//console.log(process.memoryUsage());

//	console.log('buffer:', worker._buffer.length)
}, 500)

var total = 0;
var ref = setInterval(function() {

	for (var i = 0; i < batchSize; i++) {
		total++;
		worker.write('--------------------------------------------------------------------------------:' + process.env.name + ':' + batches + ':' + i + '\n');
	}	

	if (--batches === 0) {
		clearInterval(ref);
		clearInterval(ref2);
		setTimeout(function () {
			console.log(total, 'messages');
			process.exit(0);
		}, 2000);
	}
}, 1000);



