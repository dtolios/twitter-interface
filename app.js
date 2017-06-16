const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const Twit = require('twit');
// const io = require('socket.io')(app);

const config = require('./config.js');

app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');

const requestUserInfo = function(req, res, next) {
	const T = new Twit(config);

	T.get('account/verify_credentials', { skip_status : true }, function(err, data) {
		if(err) console.error(err);
		req.twitterUserData = data;
		next();
	});
};

const requestBannerImage = function(req, res, next) {
	const T = new Twit(config);

    T.get('users/profile_banner', {screen_name: req.twitterUserData.screen_name}, function(err, data){
    	if(err) console.error(err);
    	req.profileBannerURL = data.sizes.web_retina.url;
    	next();
	});
};

const requestTweets = function(req, res, next) {
	const T = new Twit(config);
	// const stream = T.stream('statuses/fjlter', {track : `@${req.twitterUserData.screen_name}`});

    // stream.on('tweet', function() {
    //     T.get('statuses/user_timeline', { screen_name: req.twitterUserData.screen_name, count: 5 }, function(err, data) {
    //         req.requestTweets = data;
    //         next();
    //     });
    // });

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

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(__dirname + '/public'));
app.use(requestUserInfo);
app.use(requestBannerImage);

app.get('/', requestTweets, requestFriends, requestSentMessages, function(req, res) {
	res.render('index', {
		userData         : req.twitterUserData,
		profileBannerURL : req.profileBannerURL,
		tweets           : req.requestTweets,
		friends          : req.requestFriends,
		sentMessages     : req.requestSentMessages
	});
});

app.post('/tweet', urlencodedParser, function(req, res) {
    if(!req.body || req.body.tweet === '') {
    	return res.sendStatus(400);
    }
    const T = new Twit(config);
    T.post('statuses/update', { status: req.body.tweet }, function(err, data, response){
        if(err) {
        	console.error(err);
        	return res.sendStatus(400);
		}
		res.sendStatus(200);
        res.end();
    });
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
	console.log('App listening on port 3000!')
});

// io.on('connection', function(socket) {
// 	socket.emit('tweet stream', )
// });