const express = require('express');
const app = express();

const config = require('./config.js');

app.set('views', './templates');
app.set('view engine', 'pug');

app.use('/public', express.static('public'));

app.get('/', function(req, res) {
	res.render('index', { title: 'Twitter Interface'});
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
});