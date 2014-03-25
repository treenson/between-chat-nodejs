var io = require('socket.io').listen(8080);
var log = [];

var log4js = require('log4js');
log4js.clearAppenders()
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('chat-content.log'), 'chat');
var logger = log4js.getLogger('chat');
logger.setLevel('info');

var pattern = new RegExp("(?:chat - )([^]*$)");
var fs = require('fs'), filename="chat-content.log";
fs.readFile(filename, 'utf8', function(err, data) {
	if(err) throw err;
	var logfile = data.split('\n');
	logfile.forEach(function(msg){
		var msg_matched = msg.match(pattern);
		if(msg_matched != null){
			log.push(msg_matched[1]);
			if(log.length > 500)
				log.shift();
		}
	});
});

io.sockets.on('connection',function(socket) {
	socket.emit('news', {old: log});
	socket.emit('users', {wangue: false, jungmin: false});
	socket.on('imhere', function(data){
		if(data['userid']==54)
		{
			socket.set('userid',1);
		}
		else if(data['userid']==71)
		{
			socket.set('userid',2);
		}
		else if(data['userid']==0)
		{
			socket.set('userid',0);
		}
		else
		{
			socket.set('userid',-1);
		}
	});
	socket.on('ping', function(data){
		var user='';
		if(data['userid']==54)
		{
			user='<span style="color:#6495ed;">완규: </span>';
		}
		else if(data['userid']==71)
		{
			user='<span style="color: #da70d6;">정민: </span>';
		}
		else if(data['userid']==0)
		{
			user='guest: ';
		}
		if(user!='')
		{
			var send_str=user+data['content'];
			io.sockets.emit('pong', {content: send_str});

			logger.info(send_str);

			log.push(send_str);
			if(log.length > 500)
				log.shift();
		}
	});
	socket.on('disconnect',function(data) {
		io.sockets.emit('pong', {content: "user disconnected"});
		console.log("data : "+ data);
		clearInterval(vola);
	});
	
	var vola = setInterval(function () {
		var wangue = false;
		var jungmin = false;
		for (var socketId in io.sockets.sockets) {
			io.sockets.sockets[socketId].get('userid', function(err, userid) {
				if(userid == 1) wangue=true;
				else if(userid==2) jungmin = true;
			});
		}
		io.sockets.emit('users', {wangue: wangue, jungmin: jungmin});
	}, 2000);

});
