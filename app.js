
const express = require('express');
const app = express();

const Twit = require('twit');
const io = require('socket.io')(app);

const config = require('./config.js');

app.set('views', './templates');
app.set('view engine', 'pug');

app.use('/public', express.static('public'));

const requestUserInfo = function(req, res, next) {
	const T = new Twit(config);

	T.get('account/verify_credentials', { skip_status : true }, function(err, data) {
		req.twitterUserData = data;
		next();
	});

};

const requestTweets = function(req, res, next) {
	const T = new Twit(config);
	const stream = T.stream('statuses/fjlter', {track : `@${req.twitterUserData.screen_name}`});

	stream.on('tweet', function() {
        T.get('statuses/user_timeline', { screen_name: req.twitterUserData.screen_name, count: 5 }, function(err, data) {
            req.requestTweets = data;
            next();
        });
    });

	T.get('statuses/user_timeline', { screen_name: req.twitterUserData.screen_name, count: 5 }, function(err, data) {
        req.requestTweets = data;
        next();
	});

};

const requestFriends = function(req, res, next) {
    const T = new Twit(config);

    T.get('friends/list', { screen_name: req.twitterUserData.screen_name, count: 5 }, function(err, data) {
        req.requestFriends = data.users;
        next();
    });

};

const requestSentMessages = function(req, res, next) {
	const T = new Twit(config);

	T.get('direct_messages/sent', { count : 5 }, function(err, data) {
		req.requestSentMessages = data;
		next();
	})
};

app.use(requestUserInfo);
app.use(requestTweets);
app.use(requestFriends);
app.use(requestSentMessages);

app.get('/', function(req, res) {
	res.render('index', { userData : req.twitterUserData , tweets : req.requestTweets , friends : req.requestFriends , sentMessages : req.requestSentMessages });
});

app.use(function(req, res, next) {
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
});

io.on('connection', function(socket) {
	socket.emit('tweet stream', )
});