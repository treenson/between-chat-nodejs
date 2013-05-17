var io = require('socket.io').listen(8080);
var log = [];

var log4js = require('log4js');
log4js.clearAppenders()
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('chat-content.log'), 'chat');
var logger = log4js.getLogger('chat');
logger.setLevel('info');

io.sockets.on('connection',function(socket) {
	socket.emit('news', {old: log});
	socket.on('ping', function(data){
		var user='';
		if(data['userid']==54)
			user='<span style="color:#6495ed;">완규: </span>';
		else if(data['userid']==71)
			user='<span style="color: #da70d6;">정민: </span>';
		else if(data['userid']==0)
			user='guest: ';
		if(user!='')
		{
			var send_str=user+data['content'];
			io.sockets.emit('pong', {content: send_str});

			logger.info(send_str);

			log.push(send_str);
			if(log.length > 100)
				log.shift();
		}
	});
});
