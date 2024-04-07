# chat.js

The `chat.js` script is a comprehensive client-side JavaScript file that powers the real-time chat functionalities of a web-based chat application. It leverages WebSocket communication via Socket.IO for real-time interactions, including message sending, receiving, and rendering in the chat interface. The script also includes advanced features such as emoji selection, rich text formatting, and image uploads.

#### Core Functionalities

**Socket.IO Integration**

The script initializes a Socket.IO client connection, allowing for real-time bidirectional event-based communication between the web clients and the server.

{% code lineNumbers="true" %}
```javascript
const socket = io();
```
{% endcode %}

**Room Management**

It extracts the server or room ID from the URL and emits a `joinRoom` event to join the specific chat room, enabling scoped message exchanges.

{% code lineNumbers="true" %}
```javascript
let roomId;
if (match) {
    roomId = match[1];
    socket.emit("joinRoom", roomId);
}
```
{% endcode %}

**Message Handling**

The script listens for `chatMessage` events from the server and dynamically appends received messages to the chat window, ensuring the chat interface is always up-to-date with the latest messages.

{% code lineNumbers="true" %}
```javascript
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
```
{% endcode %}

**Sending Messages**

It captures message input from the user and emits a `sendMessage` event when the user submits a message. The input field is cleared after sending to ready it for the next message.

{% code lineNumbers="true" %}
```javascript
messageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !isEmojiSelectionMode) {
        e.preventDefault();
        if (this.value.trim() !== "") {
            socket.emit("sendMessage", { message: this.value, roomId });
            this.value = "";
        }
    }
});
```
{% endcode %}

#### Advanced Features

**Rich Text Formatting**

The script includes a `renderFormattedMessage` function that applies rich text formatting to messages using a markdown-like syntax, enhancing message readability and presentation.

{% code lineNumbers="true" %}
```javascript
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
```
{% endcode %}

**Emoji Integration**

It integrates emoji functionalities, allowing users to search for and insert emojis into their messages, enriching the chat experience.

{% code lineNumbers="true" %}
```javascript
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
		results	Container.innerHTML = "";
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

```
{% endcode %}

**Image Handling**

The script supports image uploads and rendering within the chat. It listens for `sendImage` events and appends the images to the chat interface.

{% code lineNumbers="true" %}
```javascript
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

```
{% endcode %}

**Link Handling**

It includes a `linkify` function that converts plain text URLs in messages into clickable links, facilitating easy navigation to referenced web content.

{% code lineNumbers="true" %}
```javascript
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
```
{% endcode %}

**Security Considerations**

The script employs a `sanitizeHTML` function to sanitize user-generated content, preventing Cross-Site Scripting (XSS) attacks and ensuring the chat application's security.

{% code lineNumbers="true" %}
```javascript
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
```
{% endcode %}

**Typing Indicator**

Implements a typing indicator feature, showing when users are typing in real-time, enhancing the sense of live interaction.

{% code lineNumbers="true" %}
```javascript
let typingTimeout;
...
messageInput.addEventListener("input", () => { ... });
...
socket.on("typing", (data) => { ... });
```
{% endcode %}

**Fetching Historical Messages**

Provides functionality to fetch and display historical messages for a given chat room, ensuring users can view past conversations upon entering a chat room.

{% code lineNumbers="true" %}
```javascript
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
```
{% endcode %}

**User Details Fetching**

Includes the capability to fetch and display user details, such as updating a user's profile picture in the chat interface based on data retrieved from the server.

{% code lineNumbers="true" %}
```javascript
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
```
{% endcode %}

## Keybings for Rich Text Formatting

#### Rich Text Formatting Options

1. **Bold**
   * **Manually**: Surround the text with `**` (double asterisks).
     * Example: `**This text will be bold**`
   * **Keyboard Shortcut**: Ctrl + Shift + Q
     * Action: Toggles `**` around selected text.
2. **Italic**
   * **Manually**: Surround the text with `*` (single asterisk).
     * Example: `*This text will be italic*`
   * **Keyboard Shortcut**: Ctrl + Shift + W
     * Action: Toggles `*` around selected text.
3. **Underline**
   * **Manually**: Surround the text with `__` (double underscores).
     * Example: `__This text will be underlined__`
   * **Keyboard Shortcut**: Ctrl + Shift + U
     * Action: Toggles `__` around selected text.
4. **Strikethrough**
   * **Manually**: Surround the text with `~~` (double tildes).
     * Example: `~~This text will be struck through~~`
   * **Keyboard Shortcut**: Ctrl + Shift + S
     * Action: Toggles `~~` around selected text.
5. **Spoiler**
   * **Manually**: Surround the text with `||` (double vertical bars).
     * Example: `||This text will be a spoiler||`
   * **Keyboard Shortcut**: Ctrl + Shift + P
     * Action: Toggles `||` around selected text.
6. **Blockquote**
   * **Manually**: Start the line with `>` (greater than sign).
     * Example: `> This will be a blockquote`
   * **Keyboard Shortcut**: Ctrl + Shift + M
     * Action: Toggles `>` at the start of the selected line(s).
7. **Bold and Italic**
   * **Manually**: Surround the text with `***` (triple asterisks).
     * Example: `***This text will be bold and italic***`
   * **Keyboard Shortcut**: Ctrl + Shift + B
     * Action: Toggles `***` around selected text.

#### Applying Formatting

Users can manually type the syntax symbols before and after their text to apply the desired formatting. Alternatively, they can select the text they wish to format and use the corresponding keyboard shortcut to wrap the selected text with the appropriate syntax symbols automatically.

The `applyMarkdownSyntax` function within the script listens for specific keyboard shortcuts and applies the corresponding syntax to the selected text in the message input field. This provides a quick and convenient way for users to style their messages without manually typing the syntax symbols.
