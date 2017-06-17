// const socket = io.connect('http://localhost');
// socket.on('tweet', function(data) {
//     socket.emit('myother event')
// });
'use strict';
$('button').on('click', function () {
    $.ajax({
        type: 'POST',
        url: '/tweet',
        data: {tweet: $('#tweet-textarea').val()},
        dataType: 'text'
    }).done(function () {
        alert('Tweet sent!');
    }).fail(function () {
        alert('Tweet failed. Please check your input and try again!');
    });
});