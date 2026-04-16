const { v4: uuidv4 } = require('uuid');

const waitingUsers = {
    A1: [], A2: [], B1: [], B2: [], C1: [], C2: [], Any: []
};

// Also keep track of socket ID to User mapping for cleanup
const socketToUser = new Map();

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('User connected to WebSockets:', socket.id);

        socket.on('join_queue', ({ cefrLevel, userId, userName }) => {
            const level = cefrLevel || 'Any';

            // Clean up any existing queue entries for this user
            Object.keys(waitingUsers).forEach(lvl => {
                waitingUsers[lvl] = waitingUsers[lvl].filter(u => u.userId !== userId);
            });

            const userEntry = { socket, userId, userName, level };
            waitingUsers[level].push(userEntry);
            socketToUser.set(socket.id, userEntry);

            console.log(`${userName} (${level}) joined the queue. Waiting in ${level}: ${waitingUsers[level].length}`);

            // Try to match
            if (waitingUsers[level].length >= 2) {
                const user1 = waitingUsers[level].shift();
                const user2 = waitingUsers[level].shift();

                const roomId = uuidv4();

                // Join the socket.io room
                user1.socket.join(roomId);
                user2.socket.join(roomId);

                // Notify both peers
                user1.socket.emit('room_matched', { roomId, partnerName: user2.userName, isInitiator: true });
                user2.socket.emit('room_matched', { roomId, partnerName: user1.userName, isInitiator: false });

                console.log(`Matched ${user1.userName} and ${user2.userName} in room ${roomId}`);
            }
        });

        socket.on('leave_queue', () => {
            const user = socketToUser.get(socket.id);
            if (user) {
                waitingUsers[user.level] = waitingUsers[user.level].filter(u => u.socket.id !== socket.id);
                console.log(`${user.userName} left the queue.`);
            }
        });

        // WebRTC Signaling Relay
        socket.on('webrtc_signal', ({ roomId, signalData }) => {
            // Relay signal to the OTHER person in the room
            socket.to(roomId).emit('webrtc_signal', { signalData });
        });

        socket.on('leave_room', ({ roomId }) => {
            socket.leave(roomId);
            const user = socketToUser.get(socket.id);
            socket.to(roomId).emit('partner_left', { partnerName: user ? user.userName : 'Partner' });
        });

        socket.on('disconnect', () => {
            const user = socketToUser.get(socket.id);
            if (user) {
                // Remove from queue
                waitingUsers[user.level] = waitingUsers[user.level].filter(u => u.socket.id !== socket.id);
                socketToUser.delete(socket.id);
            }
            console.log('User disconnected:', socket.id);
        });
    });
};
