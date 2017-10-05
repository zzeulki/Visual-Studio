//Voice Recorder JS file
//Comment : ZzeulKi

VoiceRecorder = function(socket)
{
	this.recording = false;
	this.recognizeStream = null;
	this.stream = undefined;
	this.recorder = undefined;
	this.buffer = [];
	this.callback = undefined;
	var obj;

	
	this.start = function(callback)
	{
		if(this.recording)
		{
			return this;
		}
		if(callback === undefined)
		{
			callback = function(data)
			{
				console.log(data);
			};
		}
		obj = this;
		navigator.getUserMedia({audio: true}, function(stream)
		{
			
			  
			obj.stream = stream;
			obj.recorder = new MediaRecorder(stream, {mimeType:'audio/webm'});
			obj.recorder.ondataavailable = function(e)
			{
				
				//버퍼에 넣지 않고 스트림으로 보내면 될 듯
				//여기 부분 스트림으로 보내는 방법으로 해보면 되지 않을까 하는 생각
				if(e.data.size > 0){
					//obj.buffer.push(e.data);
				}
			};
			obj.recorder.start();
			
//			while(obj.isRecording!=false){
//				socket.emit('record',"t");
//			}
			//console.log("liste")
			
			//finish condition
			obj.recorder.addEventListener('stop',function(){
				//socket.emit('record',obj.buffer);
//				var link=document.createElement('a');
//				//Blob가 raw data임으로 혹시 스트림으로 안되면 파일로 보내는 방법을 연구해볼 것
//                link.href=URL.createObjectURL(new Blob(obj.buffer));
//                link.download="test.wav";
//                link.click();
			});
			obj.isRecording = true;
			callback("OK");
		}, function(e)
		{
			callback("USER_DENIED");
		});

		
		return this;
	};


	this.clear = function()
	{
		this.buffer = [];
		return this;
	}

	this.stop = function()
	{
		obj = this;
		obj.recorder.stop();
		this.isRecording = false;
		this.buffer = [];
		this.stream.getTracks()[0].stop();
		this.recorder = undefined;
		
		return this;
	}
	
	
};

window.URL = (window.URL || window.webkitURL);
navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
