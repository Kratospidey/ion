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

// Function to create and append message element
function appendMessage({
	userId,
	message,
	username,
	timestamp,
	profilePicture,
}) {
	const div = document.createElement("div");
	div.classList.add("message");

	const profilePic = document.createElement("img");
	profilePic.src = profilePicture; // The URL of the user's profile picture
	profilePic.classList.add("profile-picture");

	const messageContent = document.createElement("div");
	messageContent.classList.add("message-content");

	const usernameSpan = document.createElement("span");
	usernameSpan.classList.add("username");
	usernameSpan.textContent = username;

	const timestampSpan = document.createElement("span");
	timestampSpan.classList.add("timestamp");
	const date = new Date(timestamp);
	timestampSpan.textContent = isNaN(date.getTime())
		? "Time not available"
		: date.toLocaleTimeString();

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
}

// Listen for chatMessage event from the server
socket.on("chatMessage", appendMessage);

// Send message to server
messageForm.addEventListener("submit", function (e) {
	e.preventDefault();
	if (!messageInput.value.trim()) return; // Prevent sending empty messages

	// Emit the message to the server
	socket.emit("sendMessage", { message: messageInput.value, roomId });
	messageInput.value = ""; // Clear the input field
});

// Fetch and display historical messages when the user enters a chat room
function fetchAndDisplayMessages(roomId) {
	fetch(`/messages/${roomId}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Failed to fetch messages");
			}
			return response.json();
		})
		.then((messages) => {
			// Ensure the messages are sorted by createdAt before displaying
			messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
			messages.forEach((message) => {
				// Adapt the message object structure to what appendMessage expects
				appendMessage({
					userId: message.senderId, // Or however you get the userId
					message: message.content,
					username: message.sender.username,
					timestamp: message.createdAt,
					profilePicture: message.sender.profilePicture,
				});
			});
		})
		.catch((error) => console.error("Failed to fetch messages:", error));
}

// Call this function when the user enters a chat room
fetchAndDisplayMessages(roomId);
