'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const Twit = require('twit');
// const config = require('./config.js'); Use this method if not deploying with Heroku
const config = {
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_TOKEN,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
    timeout_ms:           process.env.TIMEOUT_MS
};

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug');
app.set('views', __dirname + '/templates');

const requestUserInfo = function (req, res, next) {
    const T = new Twit(config);

    T.get('account/verify_credentials', {skip_status: true}, function (err, data) {
        req.twitterUserData = data;
        next();
    });
};

const requestBannerImage = function (req, res, next) {
    const T = new Twit(config);

    T.get('users/profile_banner', {screen_name: req.twitterUserData.screen_name}, function (err, data) {
        req.profileBannerURL = data.sizes.web_retina.url;
        next();
    });
};

const requestTweets = function (req, res, next) {
    const T = new Twit(config);

    T.get('statuses/user_timeline', {screen_name: req.twitterUserData.screen_name, count: 5}, function (err, data) {
        for(let i = 0; i < data.length; i += 1) {
            data[i].created_at = parseTwitterDate(data[i].created_at);
        }
        req.requestTweets = data;
        next();
    });
};

const requestFriends = function (req, res, next) {
    const T = new Twit(config);

    T.get('friends/list', {screen_name: req.twitterUserData.screen_name, count: 5}, function (err, data) {
        req.requestFriends = data.users;
        next();
    });
};

const requestSentMessages = function (req, res, next) {
    const T = new Twit(config);

    T.get('direct_messages/sent', {count: 5}, function (err, data) {
        req.requestSentMessages = data;
        next();
    });
};

const renderIndex = function (req, res) {
    io.on('connection', function (socket) {
        const T = new Twit(config);
        const stream = T.stream('statuses/filter', {follow: `${req.twitterUserData.id}`});
        stream.on('tweet', function(tweet) {
            tweet.created_at = parseTwitterDate(tweet.created_at);
            socket.emit('tweet', tweet);
        });
    });

    res.render('index', {
        userData: req.twitterUserData,
        profileBannerURL: req.profileBannerURL,
        tweets: req.requestTweets,
        friends: req.requestFriends,
        sentMessages: req.requestSentMessages
    });
};

const postTweet = function (req, res) {
    if (!req.body || req.body.tweet === '') {
        return res.sendStatus(400);
    }
    const T = new Twit(config);
    T.post('statuses/update', {status: req.body.tweet}, function (err) {
        if (err) {
            console.error(err);
            return res.sendStatus(400);
        }
        res.sendStatus(200);
        res.end();
    });
};

const handle404 = function (req, res) {
    res.status(400);
    res.render('error', {title: '404: File Not Found'});
};

const handle500 = function (err, req, res) {
    res.status(500);
    res.render('error', {title: '500: Internal Server Error', error: err});
};

const urlencodedParser = bodyParser.urlencoded({extended: false});

app.use(express.static(__dirname + '/public'));
app.use(requestUserInfo);
app.use(requestBannerImage);
app.get('/', requestTweets, requestFriends, requestSentMessages, renderIndex);
app.post('/tweet', urlencodedParser, postTweet);

app.use(handle404);
app.use(handle500);

server.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

function parseTwitterDate(aDate) {
    const date = new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));
    return date.toDateString();
}