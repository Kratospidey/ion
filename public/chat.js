// Establish a connection
const socket = io();
let currentUserId;

const messageContainer = document.getElementById("messageContainer");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

// Extract the server ID from the URL
const urlPath = window.location.pathname.split("/"); // This will give you ['', 'server', '1']
const roomId = urlPath[urlPath.length - 1]; // This gets the last element, which should be your server ID

// Join the chat room
socket.emit("joinRoom", roomId);

socket.on("userId", (data) => {
    currentUserId = data.userId; // Store the current user's ID in the global variable
    console.log("Current User ID:", currentUserId);
});

socket.on("chatMessage", function (data) {
	const { userId, message } = data; // Extract userId and message from received data
	const div = document.createElement("div");
	div.textContent = message;

	if (userId === currentUserId) {
		div.classList.add("sentMessage");
	} else {
		div.classList.add("receivedMessage");
	}

	messageContainer.appendChild(div);
	// Ensure the chat window scrolls to the latest message
	messageContainer.scrollTop = messageContainer.scrollHeight;
});

// Send message to server
messageForm.addEventListener("submit", function (e) {
	e.preventDefault();
	const message = messageInput.value;
	socket.emit("sendMessage", { message, roomId });
	messageInput.value = "";
});
