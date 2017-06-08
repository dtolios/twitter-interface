const socket = io.connect('http://localhost');
socket.on('tweet', function(data) {
    socket.emit('myother event')
})