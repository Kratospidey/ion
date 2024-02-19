// Establish a connection
const socket = io();

const messageContainer = document.getElementById("messageContainer");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

// Extract the server ID from the URL
const urlPath = window.location.pathname.split("/");
const roomId = urlPath[urlPath.length - 1];

// Join the chat room
socket.emit("joinRoom", roomId);

socket.on("chatMessage", function (data) {
	const { userId, message, username, timestamp } = data; // Assume these are provided by the server
	const div = document.createElement("div");
	div.classList.add("message");

	const profilePic = document.createElement("img");
	profilePic.src = data.profilePicture; // The URL of the user's profile picture
	profilePic.classList.add("profile-picture");

	const messageContent = document.createElement("div");
	messageContent.classList.add("message-content");

	const usernameSpan = document.createElement("span");
	usernameSpan.classList.add("username");
	usernameSpan.textContent = username;

	const timestampSpan = document.createElement("span");
	timestampSpan.classList.add("timestamp");
	timestampSpan.textContent = new Date(timestamp).toLocaleTimeString(); // Convert timestamp to readable time

	const textDiv = document.createElement("div");
	textDiv.classList.add("text");
	textDiv.textContent = message;

	messageContent.appendChild(usernameSpan);
	messageContent.appendChild(timestampSpan);
	messageContent.appendChild(textDiv);
	div.appendChild(profilePic);
	div.appendChild(messageContent);
	messageContainer.appendChild(div);

	messageContainer.scrollTop = messageContainer.scrollHeight;
});

// Send message to server
messageForm.addEventListener("submit", function (e) {
	e.preventDefault();
	const message = messageInput.value;
	// No need to include userId as it's not important for rendering anymore
	socket.emit("sendMessage", { message, roomId });
	messageInput.value = "";
});

// No need to fetch currentUserId anymore, so we don't call initializeChat
