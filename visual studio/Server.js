var express = require('express');
var path = require('path');
var util = require( "util" );
var app = express();
//var http = require('http').Server(app);
app.use(express.static(path.join(__dirname, "public")));

//Lecturer Voice recognize part 
var binaryServer = require('binaryjs').BinaryServer;
var wav = require('wav');
var server = binaryServer({port:3306});

//Text transmit to Studnet Client
var writeServer = require('http').createServer(app);
var writeSocket = require('socket.io')(writeServer);

writeServer.listen(3305,function(){
	   console.log("Student Socket created");
})

writeSocket.on('connection',function(client){
	console.log('login student');
});


function streamingRecognize (filename) {
	  // [START speech_streaming_recognize]
	  const fs = require('fs');

	  // Imports the Google Cloud client library
	  const Speech = require('@google-cloud/speech');

	  // Instantiates a client
	  const speech = Speech();

	  // The path to the local file on which to perform speech recognition, e.g. /path/to/audio.raw
	  // const filename = '/path/to/audio.raw';

	  // The encoding of the audio file, e.g. 'LINEAR16'
	  // const encoding = 'LINEAR16';

	  // The sample rate of the audio file in hertz, e.g. 16000
	  // const sampleRateHertz = 16000;

	  // The BCP-47 language code to use, e.g. 'en-US'
	  // const languageCode = 'en-US';

	  const request = {
	    config: {
	    	enableWordTimeOffsets:true,
	      encoding: 'LINEAR16',
	      sampleRateHertz: 44100,
	      languageCode: 'ko-KR'
	    },
	    interimResults: false // If you want interim results, set this to true
	  };

	  // Stream the audio to the Google Cloud Speech API
	  const recognizeStream = speech.streamingRecognize(request)
	    .on('error', console.error)
	    .on('data', (data) => {
	    	//studentClient.emit('check',data.results[0].alternatives[0].transcript);
//	    	console.log(data);
	      console.log(
	          `Transcription: ${data.results[0].alternatives[0].transcript}`);
	      writeSocket.emit('receive message',data.results[0].alternatives[0].transcript);
	      
	      //word time
	    	/*data.results[0].alternatives[0].words.forEach((wordInfo) => {
	            // NOTE: If you have a time offset exceeding 2^32 seconds, use the
	            // wordInfo.{x}Time.seconds.high to calculate seconds.
	            const startSecs = `${wordInfo.startTime.seconds}` + `.` +
	                (wordInfo.startTime.nanos / 100000000);
	            const endSecs = `${wordInfo.endTime.seconds}` + `.` +
	                (wordInfo.endTime.nanos / 100000000);
	            console.log(`Word: ${wordInfo.word}`);
	            console.log(`\t ${startSecs} secs - ${endSecs} secs`);
	          });*/
	
	    });
	 
	  fs.createReadStream(filename).pipe(recognizeStream);
}


server.on('connection',function(client){
	console.log("Lecturer Socket created");
	
	var buffer=[];
	var index=1;
	var fileWriter;
		
	client.on('stream', function(stream, meta) {
		
		//스트림으로 바로 넘기는 부분 
		 const fs = require('fs');

		  // Imports the Google Cloud client library
		  const Speech = require('@google-cloud/speech');

		  // Instantiates a client
		  const speech = Speech();

		  // The path to the local file on which to perform speech recognition, e.g. /path/to/audio.raw
		  // const filename = '/path/to/audio.raw';

		  // The encoding of the audio file, e.g. 'LINEAR16'
		  // const encoding = 'LINEAR16';

		  // The sample rate of the audio file in hertz, e.g. 16000
		  // const sampleRateHertz = 16000;

		  // The BCP-47 language code to use, e.g. 'en-US'
		  // const languageCode = 'en-US';

		  const request = {
		    config: {
		      encoding: 'LINEAR16',
		      sampleRateHertz: 44100,
		      languageCode: 'ko-KR'
		    },
		    interimResults: false // If you want interim results, set this to true
		  };

		  // Stream the audio to the Google Cloud Speech API
		  const recognizeStream = speech.streamingRecognize(request)
		    .on('error', console.error)
		    .on('data', (data) => {
		    	console.log(data);
		      console.log(
		          `Transcription: ${data.results[0].alternatives[0].transcript}`);
		      writeSocket.emit('receive message',data.results[0].alternatives[0].transcript);
		    });

		stream.pipe(recognizeStream);
		
		stream.on('data', function(data){
			
		//파일 부분
		/*buffer.push(data);
		console.log(buffer.length);
				
			if(buffer.length==50){
					
				//console.log("length");
				var temp = buffer;
				buffer = [];
					
				//파일 생성 
				fileWriter = new wav.FileWriter('demo'+index+'.wav', {
					channels: 1,
					sampleRate: 44100,
					bitDepth: 16
				});
				
					//버퍼 길이 l,lens
				var l = temp.length;
				var len = temp.length;
					//버퍼 0부터 분해해서 파일에 쓰
				while(l){
					fileWriter.write(temp[len-(l--)]);
				}
					
				//다 쓰면 파일 쓰기 종료 
				fileWriter.end();
				streamingRecognize('demo'+index+'.wav');
				index++;
			
				if(index==20){
					index=1;
				}
			}*/
		});
	
	});
	client.on('close', function() {
		if (fileWriter != null) {
			fileWriter.end();
	
		}
	});
});


app.get('/',function(req,res){
	
	//console.log(req);
	res.sendFile(__dirname+'/FirstPage.html');
})

//for student page
app.post('/student',function(req,res){
	
	console.log("Student client start to record");
	
	
	res.sendFile(__dirname+'/StudentPage.html');
})


//for lecturer page 
app.post('/professor',function(req,res){
	
	console.log("Lecturer client start to record");
	
	res.sendFile(__dirname+'/ProfessorPage.html');
})


app.listen(4000,function(){
	console.log("Server start");
})