// Establish a connection
const socket = io();

const messageContainer = document.getElementById("messageContainer");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

// Extract the server ID from the URL
// Extract the pathname from the current URL in the address bar
const path = window.location.pathname;

// Define a regex pattern to match '/server/' followed by one or more digits
const roomIDPattern = /^\/server\/(\d+)$/;

// Use the match method to test if the path matches the regex pattern
const match = path.match(roomIDPattern);

let roomId;

if (match) {
	// If the pattern matches, 'match[1]' will contain the room ID
	roomId = match[1];
	// Emit the joinRoom event for this room ID
	socket.emit("joinRoom", roomId);
}

let isEmojiSelectionMode = false; // Step 1: Introduce the flag

function scrollToBottom() {
	setTimeout(() => {
		messageContainer.scrollTop = messageContainer.scrollHeight;
	}, 3000); // Adjust the delay as needed
}

socket.on("chatMessage", function (data) {
	appendMessage({
		userId: data.userId,
		message: data.message,
		username: data.username,
		timestamp: data.timestamp,
		profilePicture: data.profilePicture,
	});

	messageContainer.scrollTop = messageContainer.scrollHeight;
});

/**
 * Appends a new message to the chat window. This function dynamically creates HTML elements
 * to display the message content, sender's username, profile picture, and timestamp. It supports
 * rendering text messages, image URLs, and applying rich text formatting based on markdown-like
 * syntax. The function also ensures the chat window scrolls to the latest message.
 *
 * @function appendMessage
 * @param {Object} messageData - The message details to be displayed.
 * @param {string} messageData.userId - The unique ID of the user who sent the message.
 * @param {string} messageData.message - The message content, which can be plain text or an image URL.
 * @param {string} messageData.username - The username of the sender.
 * @param {string} messageData.timestamp - The timestamp of when the message was sent.
 * @param {string} messageData.profilePicture - The URL to the sender's profile picture.
 * @sideEffects - Modifies the DOM to include the new message and scrolls the message container.
 */
function appendMessage({
	userId,
	message,
	username,
	timestamp,
	profilePicture,
}) {
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

		// Use the renderFormattedMessage function to apply rich text formatting
		let formattedMessage = renderFormattedMessage(message);
		formattedMessage = formattedMessage.replace(/\n/g, "<br>"); // Convert newlines to <br> tags

		// Sanitize the HTML to prevent XSS attacks before setting innerHTML
		textDiv.innerHTML = sanitizeHTML(linkify(formattedMessage));
		messageContent.appendChild(textDiv);
	}

	div.appendChild(profilePic);
	div.appendChild(messageContent);
	messageContainer.appendChild(div);
	scrollToBottom();
}

document.addEventListener("click", function (e) {
	if (e.target.classList.contains("spoiler")) {
		e.target.classList.toggle("revealed");
	}
});

/**
 * Transforms a message string containing markdown-like syntax into HTML-formatted text. This function supports
 * various text formatting options including bold, italic, underline, strikethrough, spoilers, and blockquotes.
 * It enables users to format their chat messages in a more expressive and visually engaging way, improving
 * the overall chat experience.
 *
 * The function uses regular expressions to identify specific patterns in the input message and replaces them
 * with the corresponding HTML tags. This approach allows for dynamic message formatting based on user input.
 *
 * @function renderFormattedMessage
 * @param {string} message - The input message string potentially containing markdown-like syntax.
 * @returns {string} The HTML-formatted message with the appropriate text styles applied.
 *
 * @example
 * // Using renderFormattedMessage to format a message
 * const formattedMessage = renderFormattedMessage("**Hello, World!**");
 * // Returns: '<strong>Hello, World!</strong>'
 *
 */
function renderFormattedMessage(message) {
	let formattedMessage = message
		// Bold and Italic
		.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
		// Bold
		.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
		// Italic
		.replace(/\*(.*?)\*/g, "<em>$1</em>")
		// Underline
		.replace(/__(.*?)__/g, "<u>$1</u>")
		// Strikethrough
		.replace(/~~(.*?)~~/g, "<del>$1</del>")
		// Spoiler
		.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>')
		// Blockquotes - only replace '>' at the start of a line
		.replace(/^>\s?(.*)/gm, "<blockquote class='blockquote'>$1</blockquote>");

	return formattedMessage;
}

/**
 * Sanitizes a given HTML string to prevent Cross-Site Scripting (XSS) attacks. This function is
 * essential for ensuring that user-generated content does not compromise the security of the application.
 *
 * @function sanitizeHTML
 * @param {string} html - The HTML string to be sanitized.
 * @returns {string} The sanitized HTML string, safe for insertion into the DOM.
 */
function sanitizeHTML(html) {
	return DOMPurify.sanitize(html);
}

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

messageInput.addEventListener("keydown", function (e) {
	if (e.key === "Enter" && !e.shiftKey && !isEmojiSelectionMode) {
		e.preventDefault(); // Prevent form submission or newline insertion
		if (this.value.trim() !== "") {
			socket.emit("sendMessage", { message: this.value, roomId });
			this.value = ""; // Clear the input field
		}
	} else if (e.key === "Enter" && e.shiftKey) {
		// Allow the default behavior which is to insert a new line
		// No need to explicitly handle this case unless you want to add custom logic here
	}
});

document.getElementById("messageForm").addEventListener("submit", function (e) {
	e.preventDefault(); // Prevent the default form submission behavior

	var messageInput = document.getElementById("messageInput");

	if (messageInput.value.trim() !== "") {
		// Assuming 'socket' is already defined and connected
		socket.emit("sendMessage", { message: messageInput.value, roomId });
		messageInput.value = ""; // Clear the textarea after sending the message
	}
});

/**
 * Fetches historical messages for a given chat room from the server and displays them in the chat window.
 * This function makes an HTTP GET request to retrieve messages and then iterates over the response
 * to render each message. It ensures messages are displayed in chronological order and the chat window
 * scrolls to show the most recent messages.
 *
 * @async
 * @function fetchAndDisplayMessages
 * @param {string} roomId - The unique ID of the chat room for which messages are being fetched.
 * @returns {Promise<void>} A promise that resolves when all messages have been fetched and displayed.
 * @throws {Error} Throws an error if the fetch request fails or if messages cannot be rendered properly.
 * @sideEffects - Makes an HTTP request to the server, modifies the DOM to display messages, and scrolls the message container.
 */
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
				// Check if the sender object exists
				if (message.sender) {
					// Adapt the message object structure to what appendMessage expects
					appendMessage({
						userId: message.senderId, // Or however you get the userId
						message: message.content,
						username: message.sender.username,
						timestamp: message.createdAt,
						profilePicture: message.sender.profilePicture,
					});
				} else {
					// Handle messages without a sender
					appendMessage({
						userId: message.senderId, // Or a placeholder value
						message: message.content,
						username: "Deleted Account", // Placeholder username
						timestamp: message.createdAt,
						profilePicture: "/img/useravatar.png", // Placeholder or default profile picture
					});
				}
			});
			scrollToBottom(); // Scroll to the bottom after rendering messages
		})
		.catch((error) => console.error("Failed to fetch messages:", error));
}

// Call this function when the user enters a chat room
if (match) {
	fetchAndDisplayMessages(roomId);
}

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

const currentlyTyping = new Set();

socket.on("typing", (data) => {
	const typingIndicator = document.getElementById("typingIndicator");
	const { username, typing } = data;

	if (typing) {
		currentlyTyping.add(username);
	} else {
		currentlyTyping.delete(username);
	}

	if (currentlyTyping.size > 0) {
		typingIndicator.textContent =
			Array.from(currentlyTyping).join(", ") +
			(currentlyTyping.size === 1 ? " is" : " are") +
			" typing...";
		typingIndicator.style.display = "block";
		typingIndicator.style.color = "white";
		typingIndicator.style.marginLeft = "10px";
		scrollToBottomOfChat();
	} else {
		typingIndicator.style.display = "none";
	}
});

/**
 * Formats a UNIX timestamp into a human-readable date and time string. This function improves the readability
 * of timestamps in the chat interface by converting them into a more familiar format.
 *
 * @function formatTimestamp
 * @param {number|string} timestamp - The UNIX timestamp to be formatted.
 * @returns {string} The formatted date and time string.
 */
function formatTimestamp(timestamp) {
	const date = new Date(timestamp);
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
	const year = date.getFullYear();
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

messageInput.addEventListener("paste", (event) => {
	const items = (event.clipboardData || window.clipboardData).items;
	for (let index in items) {
		const item = items[index];
		if (item.kind === "file") {
			const blob = item.getAsFile();
			if (blob) {
				uploadImage(blob); // Reuse your existing uploadImage function
			}
		}
	}
});

function uploadImage(file) {
	// Get the upload icon element
	const uploadIcon = document.querySelector(
		'label[for="imageUpload"] .fa-upload'
	);

	// Change the icon to a spinner
	if (uploadIcon) {
		uploadIcon.classList.remove("fa-upload");
		uploadIcon.classList.add("fa-spinner", "fa-spin");
	}

	const formData = new FormData();
	formData.append("image", file);

	fetch("/upload-image", {
		method: "POST",
		body: formData,
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.imageUrl) {
				socket.emit("sendImage", { imageUrl: data.imageUrl, roomId });
			}
		})
		.catch((error) => {
			console.error("Error uploading image:", error);
		})
		.finally(() => {
			// Revert the icon back to upload
			if (uploadIcon) {
				uploadIcon.classList.remove("fa-spinner", "fa-spin");
				uploadIcon.classList.add("fa-upload");
			}
		});
}

/**
 * Checks if a given URL points to an image by matching it against known image file extensions.
 * This function is useful for determining how to render messages that contain URLs.
 *
 * @function isImageUrl
 * @param {string} url - The URL to be tested.
 * @returns {boolean} True if the URL ends with an image file extension, false otherwise.
 */
function isImageUrl(url) {
	// Check if the URL has recognizable image file extensions before any query parameters
	const withoutQuery = url.split("?")[0];
	return /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(withoutQuery);
}

/**
 * Fetches user details from the server using the user's unique ID. This function sends a GET request
 * to a predefined endpoint and updates the user's profile picture in the chat interface upon success.
 * It handles both successful and error responses.
 *
 * @async
 * @function fetchUserDetails
 * @param {string} userId - The unique identifier of the user whose details are being fetched.
 * @sideEffects - Makes an HTTP request to the server, and may modify the DOM by setting a user's profile picture.
 * @throws {Error} Throws an error if the request fails or if the response data is not as expected.
 */
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

/**
 * Converts plaintext URLs in a given text into clickable HTML anchor tags. This function enhances
 * the chat experience by allowing users to easily navigate to links shared within messages.
 * It also differentiates between image URLs and other URLs to avoid modifying image links.
 *
 * @function linkify
 * @param {string} text - The text content that may contain plaintext URLs.
 * @returns {string} The modified text with URLs replaced by HTML anchor tags.
 */
function linkify(text) {
	const urlRegex =
		/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
	const imageExtensions = /\.(jpeg|jpg|gif|png|svg)$/i;

	return text.replace(urlRegex, function (url) {
		// Check if the URL is an image link
		if (imageExtensions.test(url)) {
			// If it's an image link, return the URL without modification
			return url;
		} else {
			// If it's not an image link, convert it to a clickable link with styling
			return (
				'<a href="' +
				url +
				'" target="_blank" class="linkified">' +
				url +
				"</a>"
			);
		}
	});
}

messageForm.addEventListener("submit", function (e) {
	e.preventDefault(); // Prevent the default form submission which reloads the page

	// Check if there's text in the message input field
	if (messageInput.value.trim() !== "") {
		// Emit the message to the server using the existing socket connection
		socket.emit("sendMessage", { message: messageInput.value, roomId });

		// Clear the message input field after sending
		messageInput.value = "";
	}

	// Optionally, you can also call scrollToBottom() here to ensure the view scrolls to the latest message
	scrollToBottom();
});

document.addEventListener("DOMContentLoaded", function () {
	const messageContainer = document.getElementById("messageContainer");

	messageContainer.addEventListener("click", function (e) {
		if (
			e.target.tagName === "IMG" &&
			e.target.classList.contains("chat-image")
		) {
			// Create overlay div if it doesn't exist
			let overlay = document.getElementById("imageOverlay");
			if (!overlay) {
				overlay = document.createElement("div");
				overlay.id = "imageOverlay";
				overlay.className = "overlay";
				document.body.appendChild(overlay);

				// When the overlay is clicked, hide it
				overlay.addEventListener("click", function () {
					overlay.style.display = "none";
				});
			}

			// Set the clicked image as the source for the enlarged image
			overlay.innerHTML = `<img src="${e.target.src}" class="enlarged-image">`;
			overlay.style.display = "flex"; // Display the overlay
		}
	});
});

/**
 * Scrolls the chat window to the bottom. This function is called after new messages are added to the chat
 * to ensure that the latest messages are visible to the user.
 *
 * @function scrollToBottomOfChat
 * @sideEffects - Modifies the scrollTop property of the chat container, causing the view to scroll.
 */
function scrollToBottomOfChat() {
	var chatDiv = document.getElementById("chat"); // Replace "chat" with the actual ID of your chat div
	chatDiv.scrollTop = chatDiv.scrollHeight;
}

messageInput.addEventListener("keydown", function (e) {
	if (e.ctrlKey && e.shiftKey && e.key === "Q") {
		applyMarkdownSyntax("**");
		e.preventDefault();
	} else if (e.ctrlKey && e.shiftKey && e.key === "W") {
		applyMarkdownSyntax("*");
		e.preventDefault();
	}

	// Underline with Ctrl + Shift + U
	else if (e.ctrlKey && e.key === "U") {
		applyMarkdownSyntax("__");
		e.preventDefault();
	}

	// Strikethrough with Ctrl + Shift + S
	else if (e.ctrlKey && e.shiftKey && e.key === "S") {
		applyMarkdownSyntax("~~");
		e.preventDefault();
	}

	// Spoiler with Ctrl + Shift + P
	else if (e.ctrlKey && e.shiftKey && e.key === "P") {
		applyMarkdownSyntax("||");
		e.preventDefault();
	} else if (e.ctrlKey && e.shiftKey && e.key === "M") {
		applyMarkdownSyntax("> ");
		e.preventDefault();
	} else if (e.ctrlKey && e.shiftKey && e.key === "B") {
		applyMarkdownSyntax("***");
		e.preventDefault(); // Prevent default action
	}
});

/**
 * Applies markdown-like syntax to the selected text within the message input field. This function
 * enhances the user experience by allowing for quick formatting of messages using keyboard shortcuts.
 *
 * @function applyMarkdownSyntax
 * @param {string} syntax - The markdown-like syntax to be applied (e.g., "**" for bold).
 * @sideEffects - Modifies the value of the message input field and adjusts the cursor position.
 */
function applyMarkdownSyntax(syntax) {
	const { value, selectionStart, selectionEnd } = messageInput;
	let selectedText = value.substring(selectionStart, selectionEnd);
	const beforeText = value.substring(0, selectionStart);
	const afterText = value.substring(selectionEnd);

	// Special handling for blockquotes
	if (syntax === "> ") {
		// Apply blockquote syntax line by line within the selected text
		const lines = selectedText.split("\n");
		const isBlockquote = lines.every((line) => line.startsWith("> "));
		if (!isBlockquote) {
			selectedText = lines
				.map((line) => (line.startsWith("> ") ? line : "> " + line))
				.join("\n");
		} else {
			// Remove blockquote syntax if it's already applied to all lines
			selectedText = lines.map((line) => line.replace(/^> /, "")).join("\n");
		}
	} else {
		// For other syntax, toggle on or off
		const isWrapped =
			selectedText.startsWith(syntax) && selectedText.endsWith(syntax);
		if (isWrapped) {
			selectedText = selectedText.slice(syntax.length, -syntax.length);
		} else {
			selectedText = syntax + selectedText + syntax;
		}
	}

	messageInput.value = beforeText + selectedText + afterText;

	// Adjust cursor position
	let newCursorPos = selectionStart + syntax.length;
	if (syntax === "> ") {
		// Do not move cursor for blockquotes
		newCursorPos = selectionStart + 1;
	} else if (selectedText.startsWith(syntax) && selectedText.endsWith(syntax)) {
		newCursorPos = selectionEnd + 2 * syntax.length;
	}

	messageInput.setSelectionRange(newCursorPos, newCursorPos);
}

/**
 * Initializes emoji functionalities by fetching emoji data and setting up the search index.
 * This allows users to search for and select emojis when composing messages. The function also
 * handles input events for emoji search and selection.
 *
 * @sideEffects - Fetches emoji data from an external source, modifies the DOM to display emoji search results,
 *                and sets up event listeners for emoji selection.
 */
fetch("https://cdn.jsdelivr.net/npm/@emoji-mart/data")
	.then((response) => response.json())
	.then((data) => {
		EmojiMart.init({ data });

		let currentEmojiIndex = -1;
		let emojiResults = [];

		/**
		 * Detects if the cursor is adjacent to an emoji character within the message input. This function is used
		 * to improve the user experience by preventing emoji search and selection functionalities from being triggered
		 * inappropriately when the user's cursor is next to an existing emoji.
		 *
		 * @function isCursorNextToEmoji
		 * @param {HTMLInputElement} input - The input element where the user types the message.
		 * @returns {boolean} True if the cursor is next to an emoji, false otherwise.
		 */
		function isCursorNextToEmoji(input) {
			const cursorPosition = input.selectionStart;
			const textBeforeCursor = input.value.slice(0, cursorPosition);
			const textAfterCursor = input.value.slice(cursorPosition);

			// Regex to match an emoji pattern
			const emojiRegex = /[\p{Emoji}\u200d]+/gu;

			// Check if the last character before the cursor or the first character after the cursor is an emoji
			return (
				emojiRegex.test(textBeforeCursor[textBeforeCursor.length - 1]) ||
				emojiRegex.test(textAfterCursor[0])
			);
		}

		/**
		 * Initiates a search for emojis based on the user's query and displays the results. This function enhances
		 * the chat application by allowing users to search for emojis by typing a colon followed by the search term.
		 * The search results are made clickable for easy insertion into the message input.
		 *
		 * @function emojiSearch
		 * @param {string} query - The search term entered by the user after the colon.
		 * @sideEffects - Modifies the DOM to display emoji search results and may change the emoji selection mode state.
		 */
		function emojiSearch(query) {
			if (!query) {
				document.getElementById("emoji-search-results").style.display = "none";
				isEmojiSelectionMode = false; // Ensure we exit emoji selection mode if the query is empty
				return;
			}

			EmojiMart.SearchIndex.search(query).then((emojis) => {
				emojiResults = emojis;
				const resultsContainer = document.getElementById(
					"emoji-search-results"
				);
				resultsContainer.innerHTML = "";
				currentEmojiIndex = -1; // Reset the emoji index

				if (emojis.length) {
					emojis.forEach((emoji, index) => {
						const emojiSpan = document.createElement("span");
						emojiSpan.textContent = emoji.skins[0].native;
						emojiSpan.onclick = function () {
							insertEmoji(emojiSpan.textContent);
							isEmojiSelectionMode = false; // Exit emoji selection mode after insertion
						};
						if (index === 0) {
							// Automatically highlight the first result
							emojiSpan.classList.add("highlighted");
							currentEmojiIndex = 0;
						}
						resultsContainer.appendChild(emojiSpan);
					});

					resultsContainer.style.display = "block";
					isEmojiSelectionMode = true; // Enter emoji selection mode when results are displayed
				} else {
					resultsContainer.style.display = "none";
					isEmojiSelectionMode = false; // Exit emoji selection mode if no results
				}
			});
		}

		/**
		 * Inserts the selected emoji into the message input field at the current cursor position. This function
		 * improves user interaction by allowing users to select emojis from search results and have them automatically
		 * added to their message.
		 *
		 * @function insertEmoji
		 * @param {string} emoji - The emoji character to be inserted into the message input.
		 * @sideEffects - Modifies the value of the message input field and hides the emoji search results.
		 */
		function insertEmoji(emoji) {
			const input = document.getElementById("messageInput");
			let currentValue = input.value;
			const newValue = currentValue.replace(/:[^\s]*$/, emoji + " ");
			input.value = newValue;
			document.getElementById("emoji-search-results").style.display = "none";
			input.focus();
		}

		const messageInput = document.getElementById("messageInput");
		messageInput.addEventListener("input", function () {
			const cursorPosition = messageInput.selectionStart; // Get the current cursor position
			const textBeforeCursor = messageInput.value.slice(0, cursorPosition); // Get the text before the cursor
			const lastColonIndex = textBeforeCursor.lastIndexOf(":"); // Find the last colon before the cursor
			scrollToBottomOfChat();

			const query = messageInput.value.split(":").pop();
			if (
				messageInput.value.includes(":") &&
				!isCursorNextToEmoji(messageInput) &&
				!textBeforeCursor.slice(lastColonIndex).includes(" ")
			) {
				const query = textBeforeCursor.slice(lastColonIndex + 1); // Extract the query after the last colon
				emojiSearch(query);
			} else {
				document.getElementById("emoji-search-results").style.display = "none";
				isEmojiSelectionMode = false; // Make sure to exit emoji selection mode
			}
		});

		// Adjust the keydown event for emoji selection
		messageInput.addEventListener("keydown", function (e) {
			const resultsContainer = document.getElementById("emoji-search-results");
			const emojis = resultsContainer.getElementsByTagName("span");

			// Check if emoji selection mode should be active
			isEmojiSelectionMode =
				resultsContainer.style.display === "block" && emojis.length > 0;

			if (isEmojiSelectionMode) {
				if (["ArrowDown", "ArrowUp", "Enter", "Tab"].includes(e.key)) {
					e.preventDefault(); // Prevent default actions for these keys in emoji selection mode

					if (e.key === "ArrowDown" || e.key === "ArrowRight") {
						currentEmojiIndex = (currentEmojiIndex + 1) % emojis.length;
					} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
						currentEmojiIndex =
							(currentEmojiIndex - 1 + emojis.length) % emojis.length;
					} else if (e.key === "Enter" || e.key === "Tab") {
						emojis[currentEmojiIndex].click(); // Simulate a click on the highlighted emoji
						isEmojiSelectionMode = false; // Exit emoji selection mode
						return; // Stop further processing
					}

					// Highlight the current emoji
					Array.from(emojis).forEach((emoji, index) => {
						emoji.classList.toggle("highlighted", index === currentEmojiIndex);
					});
				}
			}
		});
	});
