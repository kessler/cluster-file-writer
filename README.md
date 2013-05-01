Cluster file writer
===================

This writter attemps to manage two backpressures in a master / worker scenario. The first is a backpressure on the file written by the master and the second is backpressure from 
the underlying stream between each worker and master. Unfortunately there is no 'drain' event for worker to master communication, so this module tries its best to mimic it using 
timers.

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
