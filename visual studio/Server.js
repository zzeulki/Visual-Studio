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

function streamingMicRecognize(){  

	  // Imports the Google Cloud client library
	  const Speech = require('@google-cloud/speech');

	  // Instantiates a client
	  const speech = Speech();

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

	  // Create a recognize stream
	  const recognizeStream = speech.streamingRecognize(request)
	    .on('error', console.error)
	    .on('data', (data) =>{
	    	console.log(data);
		      console.log(
		          `Transcription: ${data.results[0].alternatives[0].transcript}`);
		      writeSocket.emit('receive message',data.results[0].alternatives[0].transcript);
	    });

	  //console.log("1");
	 
	  return recognizeStream;
}

server.on('connection',function(client){
	console.log("Lecturer Socket created");
	
	var time;
	client.on('stream', function(stream, meta) {

		var streamTest = streamingMicRecognize();
		stream.pipe(streamTest);
		

//			 console.log("123");
			time = setInterval(function(){
		 
			 
			streamTest.destroy();
			 
			streamTest = streamingMicRecognize();
			stream.pipe(streamTest);
			 
			 
			console.log("tttt");
			 //stream.pipe(streamingMicRecognize());
			 
			 //streamingMicRecognize(stream);
		},1000*50);

		  
		 
	});
	client.on('close', function() {
		console.log("ss");
		clearInterval(time);
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