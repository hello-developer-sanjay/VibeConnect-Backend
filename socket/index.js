const socketio = require('socket.io');

const socketServer = (server) => {
    const io = socketio(server, {
        cors: {
            origin: '*',
        },
    });

    io.on('connection', (socket) => {
        console.log('New connection:', socket.id);

        socket.on('joinRoom', ({ room }) => {
            socket.join(room);
            console.log('User joined room:', room);
        });

        socket.on('videoOffer', (data) => {
            const { room, offer, caller } = data;
            console.log('Received video offer from:', caller, 'in room:', room);
            socket.to(room).emit('videoOffer', { offer, caller });
        });

        socket.on('videoAnswer', (data) => {
            const { room, answer } = data;
            console.log('Received video answer in room:', room);
            socket.to(room).emit('videoAnswer', { answer });
        });

        socket.on('iceCandidate', (data) => {
            const { room, candidate } = data;
            console.log('Received ICE candidate in room:', room);
            socket.to(room).emit('iceCandidate', { candidate });
        });

        socket.on('callRejected', (data) => {
            const { room } = data;
            console.log('Call rejected in room:', room);
            socket.to(room).emit('callRejected');
        });

        socket.on('callDisconnected', (data) => {
            const { room } = data;
            console.log('Call disconnected in room:', room);
            socket.to(room).emit('callDisconnected');
        });
    });
};

module.exports = socketServer;
