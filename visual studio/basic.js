//const hostname = '127.0.0.1';
const port = 3306;


var express = require('express');
var path = require('path');
var util = require('util');
var events = require('events')
//var index = require('./content');
var router = express.Router();
var dateFormat = require('dateformat');
var app = express();
var element = require('element');
var fs = require('fs');
var id=null;

app.use(express.static(path.join(__dirname, "public")));


/*mysql 연동 */
var mysql = require('mysql');

var connection = mysql.createConnection({
    host:'155.230.105.112',
     user:'root',
     password:'rainbucket',
     database:'rainbucket',
});

var DBconnect = function(){
	events.EventEmitter.call(this);
}

connection.connect();

util.inherits(DBconnect,events.EventEmitter);

var initialNeederDB = function(){
	
		console.log("id : "+id);
		var mysql = "select * from needer where ID='"+id+"'";
		   
		connection.query(mysql, function(err, rows, fields){
		    if(err){
		    	console.log(err);
		    } else {
		        console.log(rows);
		         
		        socket.emit('initial02', rows);
		        
		   }
		});
		   
		var mysql = "select sum(Amount) from provideinfo where NeederID='"+id+"'";
		   
		connection.query(mysql, function(err, rows, fields){
			if(err){
	          console.log(err);
	        } else {
	        	
	        	//console.log(rows);
		      //console.log(rows[0]['sum(Amount)']);
		         
	        	socket.emit('initial01', rows[0]['sum(Amount)']);
		    }
		});
		   
	
	
	   var mysql = 'select * from '+'request'+" where "+"Needer"+"='"+id+"';";
	   
	   connection.query(mysql, function(err, rows, fields){
	        if(err)
	        {
	              console.log(err);
	        } 
	        else 
	        {
	           //console.log(rows);
	           //console.log(rows[0]['Needer']);
	        	socket.emit('initial4',rows);
	        }
	   });
	      
	   var mysql ="select Name from provider where serialNumber in (select Provider from request where Needer='"+id+"')";
	   
	   connection.query(mysql, function(err, rows, fields){
	        if(err)
	        {
	              console.log(err);
	        } 
	        else 
	        {

	           //console.log(rows[0]['Name']);
	           
	        	socket.emit('initial5',rows);
	        }
	   });
}

var initialProvideDB = function(){
	
	console.log("----"+id);
	//쿼리문 
	var mysql = "select * from Provider where SerialNumber='"+id+"'";

	//이 부분에서 rows로 파싱 한 번 해봐바
	connection.query(mysql, function(err, rows, fields){
	     if(err){
	           console.log(err);
	     } else {
	      //console.log(rows);
	      
	    	 socket.emit('initial', rows);
	     
	     }
	});
	
	var mysql = "select sum(Amount) from provideinfo where SerialNumber='"+id+"'";
	
	console.log("----"+mysql);
	
	connection.query(mysql, function(err, rows, fields){
	     if(err){
	           console.log(err);
	     } else {
	     console.log(rows[0]['sum(Amount)']);
	      
	     socket.emit('initial2', rows[0]['sum(Amount)']);
	     }
	});
	
	
	var mysql = "select * from request where provider='"+id+"'";
	connection.query(mysql, function(err, rows, fields){
		     if(err){
		           console.log(err);
		     } else {
		     // console.log(rows);
		      
		    	 socket.emit('initial3', rows);
		     
		     }
		});

	util.debug("DB select");
}
var DBinsert = function(channel){
	util.debug("DB insert");
}
var DBdelete = function(){
	util.debug("DB delete");
}
var DBupdate = function(){
	util.debug("DB update");
}

var dbManage = new DBconnect();

dbManage.on('initialProvideDB',initialProvideDB);
dbManage.on('initialNeederDB',initialNeederDB);
dbManage.on('DBdelete',DBdelete);
dbManage.on('DBupdate',DBupdate);

/*추가코드 */
var server = require('http').createServer(app);

var io = require('socket.io')(server);

server.listen(port,function(){
	   console.log("DB connect!");
})

function DBupdate(table,updatefieldname,updatevalue,searchfieldname,searchvalue)
{
   var mysql = "update "+table+" set "+updatefieldname+"="+updatevalue+" where "+searchfieldname+"='"+searchvalue+"';";
   connection.query(mysql, function(err, rows, fields){
        if(err){
              console.log(err);
        } else {
        }
   });
   
}

//바뀐부분 있는지 확인해볼 것 
var socket = io.on('connection', function(socket) {

     // 접속한 클라이언트의 정보가 수신되면
     socket.on('login', function(data) {
    	 
    	 //dbManage.emit('initialProvideDB');
    	 dbManage.emit('initialNeederDB');
       
    	 console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

       // socket에 클라이언트 정보를 저장한다
       socket.name = data.name;
       socket.userid = data.userid;

       // 접속된 모든 클라이언트에게 메시지를 전송한다
       io.emit('login', data.name );
     });

     
     socket.on('NtoP',function(data){
    	 console.log("click");
    	 //dbManage.emit('initialProvideDB');
     });
     
     socket.on('PtoN',function(data){
    	 dbManage.emit('initialNeederDB');
     })
     
     socket.on('updateDB',function(data){
       console.log("update");
       console.log(data.serial);
       
       //var mysql;
       for(var i=1;i<=2;i++){
          var mysql;
          var userid;
          var serialnumber;
          var availability;
          var amount = data.amount1+data.amount2;
          var avail;
          if(i==1)
            { 
            mysql = "update request set State=1 where Needer='"+data.id1+"'";
             userid = data.id1;
             
            }
          else
          {
             mysql = "update request set State=1 where Needer='"+data.id2+"'";
            userid = data.id2;
          }
         
          connection.query(mysql, function(err, rows, fields)
                {
              if(err)
              {
                    console.log(err);
              } else {
                console.log(rows);
              }
                    
              });
       }
          
          var mysql="select * from provider where SerialNumber='"+data.serial+"'";
          connection.query(mysql, function(err, rows, fields){
             console.log(mysql);
              if(err)
              {
                    console.log(err);
              } else {
                console.log(rows[0]);
                
                var a = rows[0]['Availability'];
                console.log(a);
                console.log(amount);
                availability = a-amount;
                
                console.log(availability);
                
                mysql = "update provider set Availability='"+availability+"' where SerialNumber='"+data.serial+"'";
                connection.query(mysql, function(err, rows, fields)
                      {
                    if(err)
                    {
                          console.log(err);
                    } else {
                      console.log(rows);
                    }
                          
                    });
                
                
              }
                    
              });
  
       
    });
     
     //바뀐부분 
     socket.on('updateDB2',function(data){
         var serial;
         var realsaving;
         mysql = "update request set State=2 where Needer='"+data.id+"'";
         connection.query(mysql, function(err, rows, fields)
           {
                if(err)
                {
                      console.log(err);
                } else {
                  console.log(rows);
                }
                      
           });
         
         mysql = "select * from provider where Name='"+data.name+"'";
         connection.query(mysql, function(err, rows, fields)
           {
                if(err)
                {
                      console.log(err);
                } else {
                      serial = rows[0]['SerialNumber'];
                      var mysql="select * from provider where SerialNumber='"+serial+"'";
                        connection.query(mysql, function(err, rows, fields){
                        console.log(mysql);
                         if(err)
                         {
                               console.log(err);
                         } else {
                           console.log(rows[0]);
                           
                           var a = rows[0]['RealSaving'];
                           realsaving = a - data.amount;
                           
                           console.log(realsaving);
                           
                           mysql = "update provider set RealSaving='"+realsaving+"' where SerialNumber='"+serial+"'";
                           connection.query(mysql, function(err, rows, fields)
                                 {
                               if(err)
                               {
                                     console.log(err);
                               } else {
                                 console.log(rows);
                               }
                                     
                               });
                           
                           var date = new Date();
                           var year = date.getYear()+1900;
                           var month = date.getMonth()+1;
                           var dateString="";
                           dateString = year+"-"+month+"-"+date.getDate();
                           
                           mysql = "insert into provideinfo values('"+serial+"', '"+dateFormat(date,"yyyy-mm-dd")+"', "+data.amount+", '"+data.id+"', '"+data.address+"')";
                           connection.query(mysql, function(err, rows, fields)
                               {
                             if(err)
                             {
                                   console.log(err);
                             } else {
                               console.log(rows);
                             }
                                   
                             });
                           
                         }
                               
                         });
                }
                      
           });
         var mysql = "select * from needer where ID='"+data.id+"'";
           console.log(mysql);
           connection.query(mysql, function(err, rows, fields){
                 if(err)
                 {
                       console.log(err);
                 } else {
                    var need = rows[0]['NeedWater']-data.amount;
                    var mysql = "update needer set NeedWater ="+need+" where ID ='"+data.id+"'";
                     console.log(mysql);
                     connection.query(mysql, function(err, rows, fields){
                           if(err)
                           {
                                 console.log(err);
                           } else {
                             console.log(rows,fields);
                             //   console.log(rows[0]['NeedWater']);   
                           }
                                 
                           });  
                 }
                       
                 });  


      });//바뀐부분 
     
     
     // 클라이언트로부터의 메시지가 수신되면
     socket.on('chat', function(data) {
       console.log('Message from %s: %s', socket.name, data.msg);

       var msg = {
         from: {
           name: socket.name,
           userid: socket.userid
         },
         msg: data.msg
       };
       

       // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
       //socket.broadcast.emit('chat', msg);

       // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
       // socket.emit('s2c chat', msg);

       // 접속된 모든 클라이언트에게 메시지를 전송한다
       io.emit('chat', msg);

       // 특정 클라이언트에게만 메시지를 전송한다
       // io.to(id).emit('s2c chat', data);
     });

     // force client disconnect from server
     
     socket.on('forceDisconnect', function() {
       socket.disconnect();
     })

     socket.on('disconnect', function() {
       console.log('user disconnected: ' + socket.name);
     });
   });



app.get('/',function(req,res){
	
	//dbManage.emit('initialProvideDB');
	console.log("alsdkfjlads");
	
	//res.sendFile(__dirname+'/public/MAIN.html');
})

app.get('/provider/id?',function(req,res){
	console.log(req.url);
	
	var temp = req.url.split('/provider/id?=');
	console.log(temp[1]);
	
	id = temp[1];
	//id = 27123;
	
	dbManage.emit('initialProvideDB');
	console.log("provider"+id);
	io.emit('login',id);
	res.sendFile(__dirname+'/public/MAIN.html');
})

app.get('/needer/id?',function(req,res){
	console.log(req.url);
	
	
	
	var temp = req.url.split('/needer/id?=');
	console.log(temp[1]);
	
	id = temp[1];
	//id='dydqls';
	
	dbManage.emit('initialNeederDB');
	
	io.emit('login',id);
	res.sendFile(__dirname+'/public/MAIN2.html');
})

app.get('/button?',function(req,res){
	console.log('button click');
	
	console.log(req.url[8]);
	
	if(req.url[8]==1){
		console.log("string");
	}
	if(req.url[8]==2 ){
		console.log("int");
	}
	
})




/**
 * 
 */

/*hosting 
const http = require('http');

const hostname = '127.0.0.1';
const port = 3306;

const server = http.createServer(function (req,res){
	res.statusCode = 200;
	res.setHeader('Content-Type','text/plain');
	res.end('DB connect~\n');
	
});
server.listen(port,hostname,function(){
	console.log("start!");
})


*/


function getRainVal(){
//기상청 데이터 가져오기 
var request = require('request');
var cheerio = require('cheerio');

var url = "http://www.kma.go.kr/weather/climate/past_cal.jsp?stn=143&yy=2017&mm=9";

request(url, function(error, response, body){
	if (error) throw error;
	
	var $ = cheerio.load(body,{decodeEntities:false});
	var rainVal = -1;
	var postElements = $("table.table_develop");
	postElements.each(function(){
		//수정해야하는 부분
		
		//var table = $(this).find("tbody").find('tr').eq(9).find('td').eq(4).html();
		var table = null;
		var date = new Date();
		console.log(date.getMonth()+1);
		console.log(date.getDate());
		console.log(date.getDay());
		var col = date.getDay();
		var row = -1;
		
		for(var i=0;i<=10;i++){
			
			if(i%2==0){
				console.log(i);
				table = $(this).find("tbody").find('tr').eq(i).find('td').eq(col).html();
				console.log(table);
				if(table.search(date.getDate())>-1){
					console.log("ttt");
					row = i;
					break;
				}
			}
		}
		
		
		table = $(this).find("tbody").find('tr').eq(row+1).find('td').eq(col).html();
		
		var temp = table.split('<br>');
		console.log(temp);
		var rainAmount = temp[4].split(': ');
		
		console.log(rainAmount[1]);
		
		console.log(row+"   "+col);
		
		if(rainAmount[1]=="- "){
			rainVal = 0;
		}else{
			rainVal = rainAmount[1];
		}
	
	})
	console.log(rainVal);
	return rainVal;
});
}
getRainVal();




//connection.end();

//button control
app.get('/button?',function(req,res){
	console.log('button click');
	
	console.log(req.url[8]);
	
	if(req.url[8]==1){
		console.log("string");
	}
	if(req.url[8]==2 ){
		console.log("int");
	}
	
})

app.get('/DBconnect',function(req,res){
	console.log('hello world');
	
	//쿼리문 
	var mysql = 'select * from provider'

	//이 부분에서 rows로 파싱 한 번 해봐바
	connection.query(mysql, function(err, rows, fields){
	     if(err){
	           console.log(err);
	     } else {
	      console.log(rows, fields);
	      console.log(rows[0]['ID']);
	      //웹 페이지에 출력 
	      res.send(rows);
	     }
	});
	
})
//app.get('/DBconnect2',function(req,res){
//	console.log('hello world');
//	
//	//쿼리문 
//	var mysql = 'select * from needer';
//
//	//이 부분에서 rows로 파싱 한 번 해봐바
//	connection.query(mysql, function(err, rows, fields){
//	     if(err){
//	           console.log(err);
//	     } else {
//	      console.log(rows, fields);
//	      console.log(rows[0]['ID']);
//	      //웹 페이지에 출력 
//	      res.send(rows);
//	     }
//	});
//	
//})


// /test입력받았을 때,test로 응답해준다.
app.get('/test', function(req,res){
	
	res.send("test");
})

app.listen(4000,function(){
	console.log("start");
})