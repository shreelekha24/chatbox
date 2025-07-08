# ChatBox - Real-time Chat Application

A modern, real-time chat application built with Node.js, Express, and Socket.IO. Features a beautiful, responsive UI with comprehensive real-time messaging capabilities, room-based chat with invite functionality, and advanced real-time features.

## 🚀 Real-time Features

### Core Real-time Functionality
- **Instant messaging** - Messages appear instantly across all connected users
- **Real-time user presence** - See who's online, away, or typing in real-time
- **Live typing indicators** - Shows when multiple users are typing simultaneously
- **Instant user join/leave notifications** - Get notified when users enter or leave the room
- **Real-time user list updates** - Live updates of who's in the room
- **Connection status monitoring** - Visual indicators for connection health

### Advanced Real-time Features
- **Message reactions** - React to messages with emojis (👍❤️😂😮😢)
- **Read receipts** - See when your messages are read by others
- **User status tracking** - Online, away, and typing status indicators
- **Message history** - Load recent messages when joining a room
- **Real-time notifications** - Toast notifications for important events
- **Enhanced typing indicators** - Shows multiple users typing with smart formatting
- **Connection monitoring** - Automatic reconnection and status updates
- **Away status detection** - Automatically marks users as away when tab is inactive

### Real-time Technical Features
- **Socket.IO events** - Comprehensive event handling for all real-time features
- **Room persistence** - Messages and reactions persist during the session
- **Automatic reconnection** - Seamless reconnection if connection is lost
- **Real-time error handling** - Immediate feedback for connection issues
- **Performance optimized** - Efficient message handling and user updates

## Features

- 🚀 **Real-time messaging** using Socket.IO with instant delivery
- 🏠 **Room-based chat** - Create or join specific chat rooms
- 👥 **User management** with real-time online user list and status
- 📤 **Invite system** - Share room links and invite others
- ⌨️ **Enhanced typing indicators** - Shows multiple users typing simultaneously
- 📱 **Responsive design** that works on desktop and mobile
- 🎨 **Modern UI** with gradient backgrounds and smooth animations
- 🔔 **Real-time notifications** for all user events and system messages
- ⚡ **Instant message delivery** with no page refresh needed
- 🔗 **Direct room links** - Share URLs to join specific rooms
- 📋 **Copy to clipboard** functionality for easy sharing
- 😊 **Message reactions** - React to messages with emojis
- ✅ **Read receipts** - See when messages are read
- 🔄 **Connection monitoring** - Real-time connection status
- 📊 **User status tracking** - Online, away, typing indicators
- 🎯 **Message history** - Load recent messages when joining
- 🎥 **Video calls** - HD video calling with camera switching
- 📞 **Voice calls** - Crystal clear voice communication
- 🎛️ **Call controls** - Toggle video/audio, switch cameras
- 📱 **Incoming call modal** - Beautiful call acceptance interface

## Real-time Event Flow

### Client to Server Events:
- `join` - User joins a room (with username and roomId)
- `chatMessage` - User sends a message
- `typing` - User typing indicator (with enhanced multi-user support)
- `messageReaction` - User reacts to a message
- `messageRead` - User marks message as read
- `statusUpdate` - User updates their status
- `userAway` - User tab becomes inactive
- `userBack` - User returns to active tab
- `call-offer` - User initiates a video/voice call
- `call-accept` - User accepts an incoming call
- `call-reject` - User rejects an incoming call
- `call-end` - User ends a call
- `ice-candidate` - WebRTC ICE candidate exchange
- `call-answer` - WebRTC offer/answer exchange

### Server to Client Events:
- `message` - New message received (with unique ID and reactions)
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `usersList` - Updated list of online users with statuses
- `userTyping` - Enhanced typing indicator with multiple users
- `roomInfo` - Room information (ID, creator, user count)
- `messageHistory` - Recent messages when joining room
- `messageReactionUpdate` - Updated reactions for a message
- `messageRead` - Read receipt notification
- `userStatusUpdate` - User status change notification
- `call-offer` - Incoming call notification
- `call-accept` - Call acceptance notification
- `call-reject` - Call rejection notification
- `call-end` - Call ending notification
- `ice-candidate` - WebRTC ICE candidate from peer
- `call-answer` - WebRTC offer/answer from peer

## Screenshots

The application features:
- A clean login screen with room creation/joining options
- A modern chat interface with message bubbles and reactions
- Real-time user list showing who's online with status indicators
- Enhanced typing indicators showing multiple users
- System messages for user events
- Invite modal with sharing options
- Connection status indicator in the header
- Real-time notifications for all events

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Clone or download** the project files to your local machine

2. **Navigate to the project directory**:
   ```bash
   cd chatbox-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## Usage

### Creating a New Room
1. **Open your browser** and navigate to `http://localhost:3000`
2. **Click "Create New Room"** (selected by default)
3. **Enter your username** and click "Create Room"
4. **Share the room** with others using the invite button

### Joining an Existing Room
1. **Click "Join Existing Room"** on the login screen
2. **Enter your username** and the **Room ID**
3. **Click "Join Room"** to enter the chat

### Real-time Features Usage
- **Message reactions**: Hover over any message and click reaction buttons
- **Read receipts**: Messages show when they're read by others
- **User status**: See who's online, away, or typing in the user list
- **Typing indicators**: See when multiple users are typing
- **Connection status**: Monitor your connection in the header
- **Real-time notifications**: Get instant feedback for all actions

### Inviting Others
1. **Click the "Invite" button** in the chat header
2. **Copy the Room ID** or **Invite Link**
3. **Share via** WhatsApp, Telegram, or Email
4. **Others can join** using the Room ID or direct link

### Direct Room Links
- Share links like: `http://localhost:3000/room/ABC123`
- Anyone with the link will automatically be taken to the join screen with the room ID pre-filled

## Project Structure

```
chatbox-app/
├── server.js              # Main server file with Socket.IO and real-time features
├── package.json           # Project dependencies and scripts
├── README.md             # This file
└── public/               # Frontend files
    ├── index.html        # Main HTML file with real-time UI
    ├── styles.css        # CSS styles with animations and real-time indicators
    └── script.js         # Client-side JavaScript with Socket.IO integration
```

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js (web framework)
  - Socket.IO (real-time communication)
  - CORS (Cross-Origin Resource Sharing)

- **Frontend**:
  - HTML5
  - CSS3 (with modern features like gradients, flexbox, and animations)
  - Vanilla JavaScript (ES6+)
  - Font Awesome (icons)
  - Socket.IO client (real-time communication)

## API Endpoints

- `GET /` - Serves the main chat application
- `GET /room/:roomId` - Serves the app with room ID in URL
- `POST /api/rooms` - Creates a new chat room
- `GET /api/rooms/:roomId` - Gets room information
- `GET /api/users` - Returns list of currently connected users

## Real-time Room Management

### Room Creation
- Each room gets a unique 8-character ID (e.g., `ABC12345`)
- Rooms are created automatically when the first user joins
- Room creator is tracked and displayed

### Room Lifecycle
- Rooms persist as long as users are connected
- Empty rooms are automatically deleted after 5 minutes
- Room history is maintained (last 100 messages with reactions)

### Room Security
- Room IDs are randomly generated and hard to guess
- No authentication required (simple username-based)
- Rooms are isolated - users only see messages from their room

## Real-time Invite Features

### Sharing Options
- **Room ID**: Simple 8-character code to share
- **Direct Link**: Full URL that pre-fills the room ID
- **Social Sharing**: WhatsApp, Telegram, Email integration
- **Copy to Clipboard**: One-click copying of room info

### Invite Workflow
1. User creates or joins a room
2. Clicks "Invite" button in chat header
3. Modal opens with room information and sharing options
4. User can copy room ID, link, or share via social platforms
5. Recipients can join using the shared information

## Real-time Performance Features

### Message Handling
- Messages are delivered instantly to all users in the room
- Message reactions update in real-time
- Read receipts are sent automatically
- Typing indicators show with smart debouncing

### User Management
- User status updates are broadcasted instantly
- Away status is detected automatically
- Connection status is monitored and displayed
- User list updates in real-time

### Connection Management
- Automatic reconnection on connection loss
- Connection status indicators
- Real-time error notifications
- Graceful handling of network issues

## Customization

You can easily customize the application by:

- **Changing colors**: Modify the CSS variables in `styles.css`
- **Adding features**: Extend the Socket.IO event handlers in `server.js`
- **Modifying UI**: Update the HTML structure in `index.html`
- **Adding persistence**: Integrate a database to store messages and rooms
- **Adding authentication**: Implement user accounts and room permissions
- **Custom reactions**: Add more emoji reactions in the message actions
- **Enhanced notifications**: Customize the notification system

## Troubleshooting

### Port already in use
If port 3000 is already in use, you can change it by:
1. Setting the `PORT` environment variable: `PORT=3001 npm start`
2. Or modifying the port in `server.js`

### Connection issues
- Make sure no firewall is blocking the connection
- Check that all dependencies are installed correctly
- Verify that the server is running without errors
- Check the connection status indicator in the header

### Room joining issues
- Ensure the room ID is correct (case-insensitive)
- Check that the room hasn't been deleted due to inactivity
- Verify the server is running and accessible
- Check for real-time connection status

### Real-time features not working
- Ensure Socket.IO is properly connected (check connection status)
- Verify that all event handlers are properly set up
- Check browser console for any JavaScript errors
- Ensure no network issues are blocking WebSocket connections

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## License

This project is open source and available under the MIT License. 