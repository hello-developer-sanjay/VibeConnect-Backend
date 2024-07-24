const socketio = require('socket.io');
const fs = require('fs');
const userCallStatus = {};
const messages = {}; 

const socketServer = (server) => {
    const io = socketio(server, {
        cors: {
            origin: '*',
        },
    });

    io.on('connection', (socket) => {
        console.log('New connection:', socket.id);

        socket.on('joinRoom', ({ room, userId }) => {
            socket.join(room);
            userCallStatus[userId] = 'available'; // Set user status to available
            if (!messages[room]) {
                messages[room] = [];
            }
            socket.emit('chatHistory', messages[room]); // Send chat history to the user
            console.log('User joined room:', room);
        });

        socket.on('videoOffer', (data) => {
            const { room, offer, caller, userId } = data;
            console.log('Received video offer from:', caller, 'in room:', room);

            if (userCallStatus[userId] === 'busy') {
                socket.emit('userBusy', { userId });
            } else {
                userCallStatus[caller] = 'busy'; // Set caller status to busy
                socket.to(room).emit('videoOffer', { offer, caller });
            }
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
            const { room, userId } = data;
            console.log('Call rejected in room:', room);
            userCallStatus[userId] = 'available'; // Set user status to available
            socket.to(room).emit('callRejected');
        });

        socket.on('callDisconnected', (data) => {
            const { room, userId } = data;
            console.log('Call disconnected in room:', room);
            userCallStatus[userId] = 'available'; // Set user status to available
            socket.to(room).emit('callDisconnected');
        });

        socket.on('sendMessage', (data) => {
            const { room, message, sender } = data;
            const newMessage = { text: message, sender, time: new Date() };
            messages[room].push(newMessage);
            io.to(room).emit('receiveMessage', newMessage);
        });

        socket.on('shareScreen', (data) => {
            const { room, screenStream } = data;
            socket.to(room).emit('shareScreen', screenStream);
        });

        socket.on('startRecording', (data) => {
            const { room } = data;
            // Implement recording logic here
            console.log('Recording started for room:', room);
        });

        socket.on('stopRecording', (data) => {
            const { room } = data;
            // Implement stop recording logic here
            console.log('Recording stopped for room:', room);
        });

        socket.on('shareFile', (data) => {
            const { room, file, sender } = data;
            io.to(room).emit('receiveFile', { file, sender });
        });

        socket.on('disconnect', () => {
            Object.keys(userCallStatus).forEach((userId) => {
                if (userCallStatus[userId] === 'busy') {
                    userCallStatus[userId] = 'available'; // Reset user status on disconnect
                }
            });
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = socketServer;
