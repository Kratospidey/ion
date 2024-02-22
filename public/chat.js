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
	// console.log(`appendMessage called with message: ${message}`);
	const div = document.createElement("div");
	div.classList.add("message");
	div.classList.add("message-enter-active");

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
	timestampSpan.textContent = isNaN(new Date(timestamp).getTime())
		? "Time not available"
		: formatTimestamp(timestamp);

	// Append username and timestamp
	messageContent.appendChild(usernameSpan);
	messageContent.appendChild(timestampSpan);

	// Check if message is an image URL
	if (isImageUrl(message)) {
		const image = document.createElement("img");
		image.src = message;
		image.classList.add("chat-image");
		messageContent.appendChild(image);
	} else {
		const textDiv = document.createElement("div");
		textDiv.classList.add("text");
		textDiv.textContent = message;
		messageContent.appendChild(textDiv);
	}

	div.appendChild(profilePic);
	div.appendChild(messageContent);
	messageContainer.appendChild(div);
	messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Listen for chatMessage event from the server
socket.on("chatMessage", appendMessage);

// Listen for 'sendImage' event from the server
socket.on("sendImage", function (data) {
	// Data contains { userId, imageUrl, username, timestamp, profilePicture }
	// console.log(`sendImage event received with data: `, data);
	appendMessage({
		userId: data.userId,
		message: data.message, // URL of the uploaded image
		username: data.username,
		timestamp: data.timestamp,
		profilePicture: data.profilePicture,
	});

	// Optionally, you might want to scroll to the latest message
	messageContainer.scrollTop = messageContainer.scrollHeight;
});

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

let typingTimeout;
const TYPING_TIMER_LENGTH = 2000; // Set the typing timeout to 2 seconds

// Listen for 'input' event on message input
messageInput.addEventListener("input", () => {
	// Clear the previous timeout
	clearTimeout(typingTimeout);

	// Emit the 'typing' event to the server
	socket.emit("typing", { roomId, typing: true });

	// Set a timeout to emit 'stop typing' event
	typingTimeout = setTimeout(() => {
		socket.emit("typing", { roomId, typing: false });
	}, TYPING_TIMER_LENGTH);
});

// Listen for 'typing' event from the server
socket.on("typing", (data) => {
	const typingIndicator = document.getElementById("typingIndicator");
	if (data.typing) {
		typingIndicator.textContent = `${data.username} is typing...`;
		typingIndicator.style.display = "block";
		typingIndicator.style.color = "white";
		typingIndicator.style.marginLeft = "10px";
	} else {
		typingIndicator.style.display = "none";
	}
});

// Function to format timestamp into "DD/MM/YYYY HH:mm" format
function formatTimestamp(timestamp) {
	const date = new Date(timestamp);
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
	const year = date.getFullYear();
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function uploadImage(file) {
	// console.log("ran upload image");
	const formData = new FormData();
	formData.append("image", file);
	fetch("/upload-image", {
		method: "POST",
		body: formData,
	})
		.then((response) => response.json())
		.then((data) => {
			// console.log(data);
			if (data.imageUrl) {
				// Send the image URL to the chat
				// console.log("ran this code");
				// console.log(`filepath: ${data.imageUrl}`);
				socket.emit("sendImage", { imageUrl: data.imageUrl, roomId });
			}
		})
		.catch((error) => {
			console.error("Error uploading image:", error);
		});
}

function isImageUrl(url) {
	return /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(url);
}

function fetchUserDetails(userId) {
	fetch(`/user/${userId}`)
		.then((response) => response.json())
		.then((data) => {
			// Now you have user details, you can use them in your application
			// console.log("User details:", data);
			// For example, set the profile picture in the chat
			document.getElementById("userProfilePic").src = data.profilePicture;
		})
		.catch((error) => console.error("Error fetching user details:", error));
}
