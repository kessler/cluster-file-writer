var ClusterFileWriter = require('../lib/ClusterFileWriter');

var worker = new ClusterFileWriter.Worker();


for (var i = 0; i < 100000; i++)  {
	worker.write('moo00000000000000000000oooooooooooooooooooooooooooooo0000000000000000000000oooooooooooooooooooooooooooooooooooo0000000000000000000000000000ooooooooooooooooooooooooooooooooo');	
}

die();

function die() {
		
	setTimeout(function() {
		console.log('worker death!');
		process.exit(0);
	}, 4000);	
}
