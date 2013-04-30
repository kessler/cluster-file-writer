var ClusterFileWriter = require('../lib/ClusterFileWriter');

var worker = new ClusterFileWriter.Worker();

var batches =  parseInt(process.env.numberOfBatches);
var batchSize = parseInt(process.env.batchSize);

console.log(process.env.name, batches, batchSize);

var total = 0;
var ref = setInterval(function() {

	for (var i = 0; i < batchSize; i++) {
		total++;
		worker.write('--------------------------------------------------------------------------------:' + process.env.name + ':' + batches + ':' + i + '\n');
	}	

	if (--batches === 0) {
		clearInterval(ref);
		setTimeout(function () {
			console.log(total, 'messages');
			process.exit(0);
		}, 2000);
	}
}, 97);
