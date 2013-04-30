Cluster file writer
===================

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
