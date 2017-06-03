const express = require('express');
const app = express();

app.set('views', './templates');
app.set('view engine', 'pug');

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
	res.render('index', { title: 'Twitter Interface'});
});

app.listen(3000, () => {
	console.log('Example app listening on port 3000!')
});