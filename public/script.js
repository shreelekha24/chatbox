// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const createRoomForm = document.getElementById('createRoomForm');
const joinRoomForm = document.getElementById('joinRoomForm');
const createUsernameInput = document.getElementById('createUsername');
const joinUsernameInput = document.getElementById('joinUsername');
const roomIdInput = document.getElementById('roomId');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
const usersList = document.getElementById('usersList');
const userCountText = document.getElementById('userCountText');
const leaveBtn = document.getElementById('leaveBtn');
const inviteBtn = document.getElementById('inviteBtn');
const typingIndicator = document.getElementById('typingIndicator');
const typingText = document.getElementById('typingText');
const roomIdDisplay = document.getElementById('roomIdDisplay');

// Room option buttons
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');

// Modal elements
const inviteModal = document.getElementById('inviteModal');
const closeModal = document.getElementById('closeModal');
const modalRoomId = document.getElementById('modalRoomId');
const inviteLink = document.getElementById('inviteLink');
const copyRoomId = document.getElementById('copyRoomId');
const copyLink = document.getElementById('copyLink');
const shareWhatsApp = document.getElementById('shareWhatsApp');
const shareTelegram = document.getElementById('shareTelegram');
const shareEmail = document.getElementById('shareEmail');

// Socket.IO connection
// CHANGE THIS URL to your public backend URL (ngrok, Railway, Render, etc.)
// Example: const socket = io('https://your-backend-url.com');
const socket = io(window.location.origin);

// App state
let currentUser = '';
let currentRoomId = '';
let typingTimeout = null;
let users = [];

// Initialize the app
function init() {
    setupEventListeners();
    checkForRoomInURL();
    showLoginScreen();
}

// Check if there's a room ID in the URL
function checkForRoomInURL() {
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments.length > 2 && pathSegments[1] === 'room') {
        const roomId = pathSegments[2];
        roomIdInput.value = roomId;
        // Switch to join room mode
        switchToJoinRoom();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Room option buttons
    createRoomBtn.addEventListener('click', switchToCreateRoom);
    joinRoomBtn.addEventListener('click', switchToJoinRoom);
    
    // Form submissions
    createRoomForm.addEventListener('submit', handleCreateRoom);
    joinRoomForm.addEventListener('submit', handleJoinRoom);
    
    // Message form submission
    messageForm.addEventListener('submit', handleMessageSubmit);
    
    // Message input typing events
    messageInput.addEventListener('input', handleTyping);
    messageInput.addEventListener('keydown', handleKeyDown);
    
    // Leave and invite buttons
    leaveBtn.addEventListener('click', handleLeave);
    inviteBtn.addEventListener('click', showInviteModal);
    
    // Modal events
    closeModal.addEventListener('click', hideInviteModal);
    copyRoomId.addEventListener('click', () => copyToClipboard(currentRoomId));
    copyLink.addEventListener('click', () => copyToClipboard(inviteLink.value));
    
    // Share buttons
    shareWhatsApp.addEventListener('click', () => shareViaWhatsApp());
    shareTelegram.addEventListener('click', () => shareViaTelegram());
    shareEmail.addEventListener('click', () => shareViaEmail());
    
    // Close modal when clicking outside
    inviteModal.addEventListener('click', (e) => {
        if (e.target === inviteModal) {
            hideInviteModal();
        }
    });
    
    // Socket.IO events
    socket.on('connect', handleSocketConnect);
    socket.on('message', handleNewMessage);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('usersList', handleUsersList);
    socket.on('userTyping', handleUserTyping);
    socket.on('roomInfo', handleRoomInfo);
}

// Switch between create and join room modes
function switchToCreateRoom() {
    createRoomBtn.classList.add('active');
    joinRoomBtn.classList.remove('active');
    createRoomForm.classList.remove('hidden');
    joinRoomForm.classList.add('hidden');
    createUsernameInput.focus();
}

function switchToJoinRoom() {
    joinRoomBtn.classList.add('active');
    createRoomBtn.classList.remove('active');
    joinRoomForm.classList.remove('hidden');
    createRoomForm.classList.add('hidden');
    joinUsernameInput.focus();
}

// Handle create room
async function handleCreateRoom(e) {
    e.preventDefault();
    const username = createUsernameInput.value.trim();
    
    if (username) {
        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ creator: username })
            });
            
            const data = await response.json();
            currentUser = username;
            currentRoomId = data.roomId;
            
            socket.emit('join', { username, roomId: currentRoomId });
            showChatScreen();
            addSystemMessage(`Welcome to ChatBox! You created room ${currentRoomId}`);
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        }
    }
}

// Handle join room
function handleJoinRoom(e) {
    e.preventDefault();
    const username = joinUsernameInput.value.trim();
    const roomId = roomIdInput.value.trim().toUpperCase();
    
    if (username && roomId) {
        currentUser = username;
        currentRoomId = roomId;
        
        socket.emit('join', { username, roomId });
        showChatScreen();
        addSystemMessage(`Welcome to ChatBox! You joined room ${roomId}`);
    }
}

// Handle message submission
function handleMessageSubmit(e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('chatMessage', { message });
        messageInput.value = '';
        socket.emit('typing', false);
    }
}

// Handle typing
function handleTyping() {
    socket.emit('typing', true);
    
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    typingTimeout = setTimeout(() => {
        socket.emit('typing', false);
    }, 1000);
}

// Handle key down events
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleMessageSubmit(e);
    }
}

// Handle leave
function handleLeave() {
    socket.disconnect();
    showLoginScreen();
    currentUser = '';
    currentRoomId = '';
    clearMessages();
    clearUsers();
    // Clear URL
    window.history.pushState({}, '', '/');
}

// Show invite modal
function showInviteModal() {
    modalRoomId.textContent = currentRoomId;
    inviteLink.value = `${window.location.origin}/room/${currentRoomId}`;
    inviteModal.classList.remove('hidden');
}

// Hide invite modal
function hideInviteModal() {
    inviteModal.classList.add('hidden');
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showCopySuccess();
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopySuccess();
    }
}

// Show copy success message
function showCopySuccess() {
    const originalText = copyRoomId.innerHTML;
    copyRoomId.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        copyRoomId.innerHTML = originalText;
    }, 1000);
}

// Share functions
function shareViaWhatsApp() {
    const text = `Join my chat room on ChatBox!\nRoom ID: ${currentRoomId}\nLink: ${inviteLink.value}`;
    const url = `Using GitHub Web Interface (Drag & Drop)https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareViaTelegram() {
    const text = `Join my chat room on ChatBox!\nRoom ID: ${currentRoomId}\nLink: ${inviteLink.value}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink.value)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareViaEmail() {
    const subject = 'Join my ChatBox room!';
    const body = `Hi!\n\nI'd like to invite you to join my chat room on ChatBox.\n\nRoom ID: ${currentRoomId}\nLink: ${inviteLink.value}\n\nSee you there!`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
}

// Socket.IO event handlers
function handleSocketConnect() {
    console.log('Connected to server');
}

function handleNewMessage(data) {
    const isOwnMessage = data.username === currentUser;
    addMessage(data, isOwnMessage ? 'sent' : 'received');
}

function handleUserJoined(data) {
    addSystemMessage(data.message);
    updateUserCount();
}

function handleUserLeft(data) {
    addSystemMessage(data.message);
    updateUserCount();
}

function handleUsersList(usersList) {
    users = usersList;
    updateUsersList();
    updateUserCount();
}

function handleUserTyping(data) {
    if (data.username !== currentUser) {
        if (data.isTyping) {
            typingText.textContent = `${data.username} is typing...`;
            typingIndicator.style.display = 'block';
        } else {
            typingIndicator.style.display = 'none';
        }
    }
}

function handleRoomInfo(data) {
    roomIdDisplay.textContent = data.roomId;
    updateUserCount();
}

// UI functions
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
    createUsernameInput.focus();
}

function showChatScreen() {
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    messageInput.focus();
}

function addMessage(data, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-header">
                <span class="message-username">${data.username}</span>
                <span class="message-time">${data.timestamp}</span>
            </div>
            <div class="message-text">${escapeHtml(data.message)}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = message;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function updateUsersList() {
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>${escapeHtml(user)}</span>
        `;
        usersList.appendChild(userDiv);
    });
}

function updateUserCount() {
    userCountText.textContent = users.length;
}

function clearMessages() {
    messagesContainer.innerHTML = '';
}

function clearUsers() {
    usersList.innerHTML = '';
    users = [];
    updateUserCount();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 