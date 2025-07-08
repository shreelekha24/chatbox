const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and rooms
const users = new Map();
const rooms = new Map();

// Enhanced user status tracking
const userStatuses = new Map(); // Track online/away/typing status

// Generate unique room ID
function generateRoomId() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Create a new room
function createRoom(roomId, creator) {
  const room = {
    id: roomId,
    creator: creator,
    users: new Map(),
    messages: [],
    messageReactions: new Map(), // Track message reactions
    userStatuses: new Map(), // Track user statuses in room
    createdAt: new Date()
  };
  rooms.set(roomId, room);
  return room;
}

// Update user status
function updateUserStatus(socket, status) {
  const userInfo = users.get(socket.id);
  if (userInfo) {
    const { username, roomId } = userInfo;
    const room = rooms.get(roomId);
    if (room) {
      room.userStatuses.set(socket.id, status);
      socket.to(roomId).emit('userStatusUpdate', {
        username: username,
        status: status,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining with room
  socket.on('join', (data) => {
    const { username, roomId } = data;
    
    // Join the socket to the room
    socket.join(roomId);
    
    // Get or create room
    let room = rooms.get(roomId);
    if (!room) {
      room = createRoom(roomId, username);
    }
    
    // Add user to room
    room.users.set(socket.id, username);
    room.userStatuses.set(socket.id, 'online');
    users.set(socket.id, { username, roomId });
    socket.username = username;
    socket.roomId = roomId;
    
    // Notify all users in the room about new user joining
    io.to(roomId).emit('userJoined', {
      username: username,
      message: `${username} joined the chat`,
      timestamp: new Date().toLocaleTimeString(),
      roomId: roomId
    });
    
    // Send current users list and their statuses to the new user
    const roomUsers = Array.from(room.users.entries()).map(([socketId, username]) => ({
      username: username,
      status: room.userStatuses.get(socketId) || 'online'
    }));
    socket.emit('usersList', roomUsers);
    
    // Send room info
    socket.emit('roomInfo', {
      roomId: roomId,
      creator: room.creator,
      userCount: room.users.size
    });
    
    // Send recent messages (last 50)
    const recentMessages = room.messages.slice(-50);
    socket.emit('messageHistory', recentMessages);
    
    console.log(`${username} joined room ${roomId}`);
  });

  // Handle chat messages
  socket.on('chatMessage', (data) => {
    const messageId = crypto.randomBytes(8).toString('hex');
    const messageData = {
      id: messageId,
      username: socket.username,
      message: data.message,
      timestamp: new Date().toLocaleTimeString(),
      type: 'message',
      reactions: {}
    };
    
    // Store message in room history
    const room = rooms.get(socket.roomId);
    if (room) {
      room.messages.push(messageData);
      room.messageReactions.set(messageId, {});
      // Keep only last 100 messages
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }
    }
    
    io.to(socket.roomId).emit('message', messageData);
    console.log(`${socket.username} in room ${socket.roomId}: ${data.message}`);
  });

  // Handle message reactions
  socket.on('messageReaction', (data) => {
    const { messageId, reaction } = data;
    const room = rooms.get(socket.roomId);
    
    if (room && room.messageReactions.has(messageId)) {
      const reactions = room.messageReactions.get(messageId);
      if (!reactions[socket.username]) {
        reactions[socket.username] = [];
      }
      
      // Toggle reaction
      const userReactions = reactions[socket.username];
      const index = userReactions.indexOf(reaction);
      if (index > -1) {
        userReactions.splice(index, 1);
      } else {
        userReactions.push(reaction);
      }
      
      // Remove user if no reactions
      if (userReactions.length === 0) {
        delete reactions[socket.username];
      }
      
      io.to(socket.roomId).emit('messageReactionUpdate', {
        messageId: messageId,
        reactions: reactions
      });
    }
  });

  // Handle typing indicator with enhanced support
  socket.on('typing', (isTyping) => {
    const room = rooms.get(socket.roomId);
    if (room) {
      if (isTyping) {
        room.userStatuses.set(socket.id, 'typing');
      } else {
        room.userStatuses.set(socket.id, 'online');
      }
      
      // Get all typing users
      const typingUsers = Array.from(room.userStatuses.entries())
        .filter(([socketId, status]) => status === 'typing' && socketId !== socket.id)
        .map(([socketId]) => room.users.get(socketId));
      
      socket.to(socket.roomId).emit('userTyping', {
        username: socket.username,
        isTyping: isTyping,
        typingUsers: typingUsers
      });
    }
  });

  // Handle read receipts
  socket.on('messageRead', (data) => {
    const { messageId } = data;
    socket.to(socket.roomId).emit('messageRead', {
      messageId: messageId,
      username: socket.username,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Handle user status updates
  socket.on('statusUpdate', (status) => {
    updateUserStatus(socket, status);
  });

  // Handle user away status (when tab becomes inactive)
  socket.on('userAway', () => {
    updateUserStatus(socket, 'away');
  });

  // Handle user back online
  socket.on('userBack', () => {
    updateUserStatus(socket, 'online');
  });

  // Call signaling events
  socket.on('call-offer', (data) => {
    const { roomId, type, caller } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      // Send call offer to all other users in the room
      socket.to(roomId).emit('call-offer', {
        type: type,
        caller: caller,
        roomId: roomId
      });
      console.log(`${caller} initiated ${type} call in room ${roomId}`);
    }
  });

  socket.on('call-accept', (data) => {
    const { roomId, caller, callee } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      // Send call accept to the caller
      socket.to(roomId).emit('call-accept', {
        roomId: roomId,
        caller: caller,
        callee: callee
      });
      console.log(`${callee} accepted call from ${caller} in room ${roomId}`);
    }
  });

  socket.on('call-reject', (data) => {
    const { roomId, caller } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      // Send call reject to the caller
      socket.to(roomId).emit('call-reject', {
        roomId: roomId,
        caller: caller,
        callee: socket.username
      });
      console.log(`Call rejected by ${socket.username} from ${caller} in room ${roomId}`);
    }
  });

  socket.on('call-end', (data) => {
    const { roomId, caller } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      // Send call end to all users in the room
      io.to(roomId).emit('call-end', {
        roomId: roomId,
        caller: caller
      });
      console.log(`${caller} ended call in room ${roomId}`);
    }
  });

  socket.on('ice-candidate', (data) => {
    const { roomId, candidate, target } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      // Send ICE candidate to the target peer
      socket.to(roomId).emit('ice-candidate', {
        roomId: roomId,
        candidate: candidate,
        target: target
      });
    }
  });

  socket.on('call-answer', (data) => {
    const { roomId, answer, target } = data;
    const room = rooms.get(roomId);
    
    if (room) {
      // Send call answer to the target peer
      socket.to(roomId).emit('call-answer', {
        roomId: roomId,
        answer: answer,
        target: target
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userInfo = users.get(socket.id);
    if (userInfo) {
      const { username, roomId } = userInfo;
      const room = rooms.get(roomId);
      
      if (room) {
        room.users.delete(socket.id);
        room.userStatuses.delete(socket.id);
        
        // If room is empty, delete it after 5 minutes
        if (room.users.size === 0) {
          setTimeout(() => {
            if (rooms.get(roomId) && rooms.get(roomId).users.size === 0) {
              rooms.delete(roomId);
              console.log(`Room ${roomId} deleted (empty)`);
            }
          }, 300000); // 5 minutes
        }
        
        io.to(roomId).emit('userLeft', {
          username: username,
          message: `${username} left the chat`,
          timestamp: new Date().toLocaleTimeString()
        });
        console.log(`${username} left room ${roomId}`);
      }
      
      users.delete(socket.id);
    }
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to create a new room
app.post('/api/rooms', (req, res) => {
  const roomId = generateRoomId();
  const creator = req.body.creator || 'Anonymous';
  createRoom(roomId, creator);
  res.json({ roomId, inviteUrl: `${req.protocol}://${req.get('host')}/room/${roomId}` });
});

// Route to get room info
app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (room) {
    res.json({
      roomId: room.id,
      creator: room.creator,
      userCount: room.users.size,
      createdAt: room.createdAt
    });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

// Route to join a specific room
app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/users', (req, res) => {
  res.json(Array.from(users.values()));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.29.91:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
}); 