var fs = require('fs');
var cluster = require('cluster');

function Master(path) {
	var self = this;
	this._pausedWorkers = [];

	if (path)
		this.setupFile(path);

	this.messagesWritten = 0;
	this.workersCount = 0;

	cluster.on('online', function(worker) {
		self.workersCount++;
		self._handleIncomingMessages(worker);
		worker.send('cluster-file-writer-resume')
	});

	cluster.on('disconnect', function(worker) {
		removeFromPausedWorkers(worker);
	});

	cluster.on('exit', function(worker, code, signal) {
		removeFromPausedWorkers(worker);
	});

	function removeFromPausedWorkers(worker) {
		for (var i = 0; i < self._pausedWorkers.length; i++) {
			var pausedWorker = self._pausedWorkers[i];

			if (pausedWorker.id === worker.id) {
				self._pausedWorkers = self._pausedWorkers.splice(1, 1);
				console.log('worker found and removed from paused');
				break;
			}
		}
	}
}

Master.prototype.setupFile = function(path) {
	var self = this;

	if (this._log) {
		this._log.end();
	}

	this.currentPath = path;
	this._log = fs.createWriteStream(path);
	this._log.on('drain', function () {

			try {
				while(self._pausedWorkers.length > 0) {
					var worker = self._pausedWorkers.pop();
					worker.send('cluster-file-writer-resume');
				}
			} catch (e) {
			 	console.log(e);
			}
	});
}

Master.prototype._handleIncomingMessages = function (worker) {
	var self = this;

	worker.on('message', function(message) {
		self.messagesWritten++;
		var resume = self._log.write(message);

		if (!resume) {
			try {
				worker.send('cluster-file-writer-pause');
			} catch (e) {
				console.log(e);
			}
			self._pausedWorkers.push(worker);
		}
	});
};

function Worker() {
	var self = this;

	this._buffer = [];
	this._masterPaused = true;
	this._socketPaused = false;
	this.messageCount = 0;

	process.on('message', function(msg) {
		if (msg === 'cluster-file-writer-resume') {
			self._resume();
		} else if (msg === 'cluster-file-writer-pause') {
			self._pause();
		}
	});
};

Worker.prototype.write = function(message) {
	if (this._socketPaused || this._masterPaused) {
		this._schedule(message);
	} else {
		this._writeImpl(message);
	}
};

Worker.prototype._writeImpl = function(message) {
	this.messageCount++;
	var socketResume = process.send(message);

	if (!socketResume) {
		this._socketPaused = true;

		var self = this;
		setTimeout(function () {
			self._socketPaused = false;
			self._flushBuffer();
		}, 100);
	}
};

Worker.prototype._schedule = function(message) {
	var self = this;
	this._buffer.push(message);
};

Worker.prototype._flushBuffer = function() {

	var self = this;

	if (this._buffer.length === 0) return;

	if (this._masterPaused || this._socketPaused) return;

	while (this._buffer.length > 0) {
		this._writeImpl(this._buffer.pop());
		if (this._masterPaused || this._socketPaused)
			break;
	}
};

Worker.prototype._resume = function () {
	this._masterPaused = false;
	this._flushBuffer();
};

Worker.prototype._pause = function () {
	this._masterPaused = true;
};


module.exports.Master = Master;
module.exports.Worker = Worker;