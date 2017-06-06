const Twit = require('twit');

const config = require('./config.js');

const T = new Twit(config);

T.get('statuses/user_timeline', { screen_name: 'dtolios', count: 5 }, function(err, data, response) {
    const tweets = data;
    for(let i = 0; i < tweets.length; i++) {
        console.log(tweets[i].text);
    }
});

T.get('friends/list', { screen_name: 'dtolios', count: 5 }, function(err, data, response) {
    const friends = data.users;
    for(let i = 0; i < friends.length; i++) {
        console.log(friends[i].screen_name);
    }
});

T.get('direct_messages', { count: 5 }, function(err,data,response) {
   const messages = data;
   for(let i = 0; i < messages.length; i++) {
       console.log(messages[i].text);
   }
});