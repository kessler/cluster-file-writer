var fs = require('fs');
var cluster = require('cluster');

function Master(path) {
	var self = this;
	this._log = fs.createWriteStream(path);	
	this._pausedWorkers = [];

	this._log.on('drain', function () {
		while(self._pausedWorkers.length > 0) {
			var worker = self._pausedWorkers.pop();
			worker.send('cluster-file-writer-resume');
		}
	});

	this.messagesWritten = 0;
	this.workersCount = 0;

	cluster.on('online', function(worker) {
		self.workersCount++;
		self._handleIncomingMessages(worker);
		worker.send('cluster-file-writer-resume')
	});		
}

Master.prototype._handleIncomingMessages = function (worker) {
	var self = this;

	worker.on('message', function(message) {
		self.messagesWritten++;
		var resume = self._log.write(message);

		if (!resume) {
			worker.send('cluster-file-writer-pause');			
			self._pausedWorkers.push(worker);
		}
	});
};

function Worker() {
	this.buffer = [];
	var self = this;
	this._paused = true;
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
	if (this._paused) {
		this._schedule(message);
	} else {
		this.messageCount++;
		process.send(message);
	}
};

Worker.prototype._schedule = function(message) {
	var self = this;
	setImmediate(function() {
		if (self._paused)
			self._schedule(message)
		else
			self.write(message);
	});
};

Worker.prototype._resume = function () {
	this._paused = false;
	//console.log('resuming', this.messageCount);
};

Worker.prototype._pause = function () {
	this._paused = true;
	//console.log('pausing', this.messageCount);
};


module.exports.Master = Master;
module.exports.Worker = Worker;