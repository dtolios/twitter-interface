const express = require('express');
const app = express();

const Twit = require('twit');

const config = require('./config.js');

app.set('views', './templates');
app.set('view engine', 'pug');

app.use('/public', express.static('public'));


const requestTweets = function(req, res, next) {
	const T = new Twit(config);

	T.get('statuses/user_timeline', { screen_name: 'dtolios', count: 5 }, function(err, data) {
        req.requestTweets = data;
        next();
	});

};

const requestFriends = function(req, res, next) {
    const T = new Twit(config);

    T.get('friends/list', { screen_name: 'dtolios', count: 5 }, function(err, data) {
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

app.use(requestTweets);
app.use(requestFriends);
app.use(requestSentMessages);

app.get('/', function(req, res) {
	res.render('index', { tweets : req.requestTweets , friends : req.requestFriends , sentMessages : req.requestSentMessages });
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