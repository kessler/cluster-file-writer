Cluster file writer
===================

This writter attemps to manage two backpressures / bottlenecks in a master / worker scenario where many workers send data to the master to be written to a file.

The first bottleneck is on the file written by the master and it is handled by sending a pause / resume message back to the workers, mimicing a normal stream backpressure behavior.

Rhe second is backpressure from the underlying stream between each worker and master (Assuming the workers pump a lot of data to the master). Unfortunately there is no 'drain' event for communication channel used between the worker and the master (AFAIK it is not properly exposed), so this module tries its best to mimic it using timers.

###Install

```
npm install cluster-file-writer
```

###usage

in master
```
	var ClusterFileWriter = require('../lib/ClusterFileWriter');
	var master = new ClusterFileWriter.Master('test.log');

```

in worker

```
	var ClusterFileWriter = require('../lib/ClusterFileWriter');

	var worker = new ClusterFileWriter.Worker();

	worker.write('yey!');
```

Data integrity tests are included 

###TODO:
Worker death tests need to be perfected
File name change mid flight needs a test
Backpressure in scenario where master pumps a lot of data to workers 

