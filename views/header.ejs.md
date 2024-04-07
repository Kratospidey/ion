# header.ejs

User Settings and Server Management Features

**getCurrentUserId**

This asynchronous function fetches the current user's ID from the server. It's essential for identifying the user across various operations, such as leaving a server or changing user-specific settings.

{% code lineNumbers="true" %}
```javascript
/**
 * Asynchronously fetches the current user's ID from the server. It sends a GET request to a specific endpoint
 * and returns the user ID if the request is successful. In case of an error, it logs the error and returns null.
 *
 * @async
 * @function getCurrentUserId
 * @returns {Promise<string|null>} The current user's ID if the request is successful, otherwise null.
 */
async function getCurrentUserId() {
	try {
		const response = await fetch("/api/get-current-user", {
			credentials: "include", // Include cookies
		});
		const data = await response.json();
		return data.currentUserId;
	} catch (error) {
		console.error("Error fetching current user ID:", error);
		return null;
	}
}
```
{% endcode %}

**leaveServer**

Allows a user to leave a specified server. It prompts the user for confirmation and then sends a request to the server to remove the user from the server's member list.

{% code lineNumbers="true" %}
```javascript
/**
 * Asynchronously sends a request to the server to remove the current user from a specified server. It confirms the
 * user's intent to leave and, upon confirmation, sends a POST request with the server ID and user ID. The user is
 * informed of the outcome through an alert message.
 *
 * @async
 * @function leaveServer
 * @param {string} serverId - The ID of the server the user intends to leave.
 * @param {string} userId - The ID of the user leaving the server.
 */
async function leaveServer(serverId, userId) {
	try {
		const response = await fetch(`/leave-server/${serverId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ userId }),
			credentials: "include",
		});

		const result = await response.json(); // Parse the JSON result

		if (response.ok) {
			alert(result.message);
			if (result.redirectUrl) {
				window.location.href = result.redirectUrl; // Redirect to the provided URL
			}
		} else {
			throw new Error(result.message || "Failed to leave server");
		}
	} catch (error) {
		console.error("Error leaving server:", error);
		alert(error.message || "Error leaving server");
	}
}
```
{% endcode %}

**changeUsername**

Enables users to change their username by submitting a form. The function validates the new username, updates it on the server, and provides feedback to the user.

{% code lineNumbers="true" %}
```javascript
window.addEventListener("DOMContentLoaded", (event) => {
	const changeUsernameForm = document.getElementById("changeUsernameForm");
	const changeUsernameButton = document.getElementById(
		"change-username-button"
	);
	const changeUsernameButtonText = document.getElementById(
		"change-username-button-text"
	);

	if (!changeUsernameForm || !changeUsernameButtonText) {
		console.error("Change username form or button text element not found");
		return;
	}

	changeUsernameForm.addEventListener("submit", async (event) => {
		event.preventDefault(); // Prevent the default form submission
		console.log("Handling change username form submission");

		// Change button text and show spinner
		changeUsernameButton.disabled = true;
		changeUsernameButtonText.innerHTML =
			'Changing Username... <i class="fa fa-spinner fa-spin"></i>';

		const formData = new FormData(changeUsernameForm);

		try {
			const response = await fetch("/change-username", {
				method: "POST",
				body: formData,
				credentials: "include", // Include cookies for session management
			});

			// Read the response as JSON only once
			const result = await response.json();

			if (response.ok) {
				alert(result.message || "Username changed successfully");
				// Optionally, redirect or update UI here
			} else {
				// Use the error message from the server response
				alert(result.error || "Failed to change username");
			}
		} catch (error) {
			console.error("Error:", error);
			alert("An error occurred while trying to change the username.");
		} finally {
			// Restore the button text to its original state
			changeUsernameButton.disabled = false;
			changeUsernameButtonText.innerHTML = "Change Username";
		}
	});
});
```
{% endcode %}

**logout**

Logs out the user by redirecting them to the logout route, effectively ending their session.

{% code lineNumbers="true" %}
```javascript
document.getElementById("logoutButton").addEventListener("click", function () {
    window.location.href = "/logout";
});
```
{% endcode %}

**changeProfilePicture**

Facilitates changing the user's profile picture. Users can select a new image file and submit it, after which the server updates the user's profile picture.

{% code lineNumbers="true" %}
```javascript
// Target the form for changing the user profile picture
const changePFPForm = document.getElementById("changePFPForm");
const changePFPButton = document.getElementById("changePFPButton"); // Target the new span in the button
const changePFPButtonText = document.getElementById("changePFPButtonText"); // Target the new span in the button

if (!changePFPForm || !changePFPButtonText) {
	console.error(
		"Upload profile picture form or button text element not found"
	);
} else {
	changePFPForm.addEventListener("submit", async (event) => {
		event.preventDefault(); // Prevent the default form submission
		console.log("Handling upload profile picture form submission");

		// Change button text and show spinner
		changePFPButton.disabled = true;
		changePFPButtonText.innerHTML =
			'Uploading... <i class="fa fa-spinner fa-spin"></i>'; // Ensure you have a spinner icon library

		const formData = new FormData(changePFPForm);

		for (let [key, value] of formData.entries()) {
			console.log(key, value);
		}

		try {
			const response = await fetch("/upload-user-profile", {
				method: "POST",
				body: formData,
				credentials: "include", // Include cookies for session management
			});

			if (response.ok) {
				const result = await response.json();
				alert(result.message || "Profile picture uploaded successfully");
				// Redirect to the home page if a redirectUrl is provided
				if (result.redirectUrl) {
					window.location.href = result.redirectUrl;
				}
			} else {
				throw new Error("Failed to upload profile picture");
			}
		} catch (error) {
			console.error("Error:", error);
			alert(error.message || "Error uploading profile picture");
		} finally {
			// Restore the button text to its original state after the operation is complete
			changePFPButton.disabled = false;
			changePFPButtonText.innerHTML = "Change PFP";
		}
	});
}
```
{% endcode %}

**deleteAccount**

Allows users to delete their account. It asks for confirmation before sending a deletion request to the server.

{% code lineNumbers="true" %}
```javascript
window.addEventListener("DOMContentLoaded", (event) => {
	const deleteAccountButton = document.getElementById("deleteAccountButton");

	if (!deleteAccountButton) {
		console.error("Delete account button not found");
		return;
	}

	deleteAccountButton.addEventListener("click", async () => {
		try {
			const response = await fetch("/delete-account", {
				method: "DELETE",
				credentials: "include", // Include cookies for session management
			});

			if (response.ok) {
				alert("Account deleted successfully. You will be logged out.");
				// Optionally, redirect to the login page or home page
				window.location.href = "/login"; // or "/home" if you have a home page
			} else {
				throw new Error("Failed to delete account");
			}
		} catch (error) {
			console.error("Error:", error);
			alert(error.message || "Error deleting account");
		}
	});
});
```
{% endcode %}

**getServerIdFromUrl**

Extracts the server ID from the current page's URL. This ID is used in various server-related operations.

{% code lineNumbers="true" %}
```javascript
/**
	 * Extracts the server ID from the current URL's path. It uses a regular expression to match the server ID pattern in the URL path.
	 * If a match is found, it returns the server ID; otherwise, it returns null. This function is useful for operations that require the
	 * server ID based on the current page's URL, such as fetching server-specific data or performing server-related actions.
	 *
	 * @function getServerIdFromUrl
	 * @returns {string|null} The server ID if found in the URL, otherwise null.
	 *
	 * @example
	 * // If the current URL is "http://example.com/server/123",
	 * // this function will return "123".
	 * const serverId = getServerIdFromUrl();
	 */
	function getServerIdFromUrl() {
		const path = window.location.pathname; // Gets the path part of the URL
		const match = path.match(/\/server\/(\d+)/); // Regular expression to match the /server/{id} pattern

		if (match && match[1]) {
			return match[1]; // Return the first capturing group (the server ID)
		} else {
			return null; // Return null if the pattern is not found
		}
	}
```
{% endcode %}

**checkIfCurrentUserIsServerCreator**

Checks whether the current user is the creator of a server. This information is used to determine if the user has permission to access certain server settings.

{% code lineNumbers="true" %}
```javascript
/**
 * Asynchronously checks if the current user is the creator of a specified server by sending a GET request to a server endpoint.
 * The function sends the server ID as part of the request, and the server responds with a boolean indicating whether the current
 * user is the creator. The function handles both successful and unsuccessful responses and logs errors in case of request failures.
 *
 * This function is essential for determining user permissions and displaying appropriate UI elements based on the user's role within a server.
 *
 * @async
 * @function checkIfCurrentUserIsServerCreator
 * @param {string} serverId - The ID of the server to check the creator status for.
 * @returns {Promise<boolean>} True if the current user is the creator of the server, false otherwise.
 *
 * @example
 * // Assuming the current user is the creator of server with ID "456",
 * // this function will return true.
 * const isCreator = await checkIfCurrentUserIsServerCreator("456");
 */
async function checkIfCurrentUserIsServerCreator(serverId) {
	try {
		const response = await fetch(`/api/is-creator/${serverId}`, {
			method: "GET",
			credentials: "include", // to include cookies with the request
		});

		if (response.ok) {
			const data = await response.json();
			return data.isCreator;
		} else {
			console.error(
				"Failed to check if user is server creator",
				response.status
			);
			return false; // Assuming false if the request fails
		}
	} catch (error) {
		console.error("Error checking if user is server creator", error);
		return false;
	}
}
```
{% endcode %}

**changeServerProfilePicture**

The `changeServerPFPForm` event listener manages the process of changing the server's profile picture. It handles the form submission, disables the submission button with a visual feedback of the ongoing operation, submits the form data (including the server ID) to a specified endpoint using the Fetch API, provides a success or error message based on the response, and finally, resets the submission button state.

{% code lineNumbers="true" %}
```javascript
const changeServerPFPForm = document.getElementById("changeServerPFPForm");
const changeServerPFPButton = document.getElementById(
	"changeServerPFPButton"
);
const changeServerPFPButtonText = document.getElementById(
	"changeServerPFPButtonText"
);

if (!changeServerPFPForm || !changeServerPFPButtonText) {
	console.error(
		"Change server profile picture form or button text element not found"
	);
	return;
}

changeServerPFPForm.addEventListener("submit", async (event) => {
	event.preventDefault(); // Prevent default form submission

	// Change button text and show spinner
	changeServerPFPButton.disabled = true;
	changeServerPFPButtonText.innerHTML =
		'Uploading... <i class="fa fa-spinner fa-spin"></i>';

	const formData = new FormData(changeServerPFPForm);
	formData.append(
		"serverId",
		document.getElementById("serverIdInput").value
	); // Use the server ID from the hidden input

	try {
		const response = await fetch("/upload-server-profile", {
			method: "POST",
			body: formData,
			credentials: "include", // Include cookies for session management
		});

		if (response.ok) {
			const result = await response.json();
			alert("Server profile picture changed successfully");
			// Optionally, redirect or update UI here
		} else {
			throw new Error("Failed to change server profile picture");
		}
	} catch (error) {
		console.error("Error:", error);
		alert("Error changing server profile picture");
	} finally {
		// Restore the button text to its original state after the operation is complete
		changeServerPFPButton.disabled = false;
		changeServerPFPButtonText.innerHTML = "Change Server PFP";
	}
});
```
{% endcode %}

**changeServerName**

The `changeServerName` event listener manages the process of changing the server's name. It handles the form submission, disables the submission button with a visual feedback of the ongoing operation, submits the form data (including the server ID) to a specified endpoint using the Fetch API, provides a success or error message based on the response, and finally, resets the submission button state.

{% code lineNumbers="true" %}
```javascript
// Change Server Name Form
const changeServerNameForm = document.getElementById(
"changeServerNameForm"
);
const changeServerNameButton = document.getElementById(
"changeServerNameButton"
);
const changeServerNameButtonText = document.getElementById(
"changeServerNameButtonText"
); // Target the new span in the button

if (changeServerNameForm && changeServerNameButtonText) {
changeServerNameForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	console.log("Handling change server name form submission");

	// Change button text and show spinner
	changeServerNameButton.disabled = true;
	changeServerNameButtonText.innerHTML =
		'Updating... <i class="fa fa-spinner fa-spin"></i>';

	const formData = new FormData(changeServerNameForm);
	const serverId = getServerIdFromUrl(); // Assuming you have a function to extract the server ID from the URL
	formData.append("serverId", serverId); // Add serverId to formData

	try {
		const response = await fetch("/change-server-name", {
			method: "POST",
			body: formData,
			credentials: "include",
		});

		if (response.ok) {
			const result = await response.json();
			alert(result.message || "Server name changed successfully");
			// Optionally, redirect or update UI here
		} else {
			throw new Error("Failed to change server name");
		}
	} catch (error) {
		console.error("Error:", error);
		alert(error.message || "Error changing server name");
	} finally {
		// Restore the button text to its original state after the operation is complete
		changeServerNameButton.disabled = false;
		changeServerNameButtonText.innerHTML = "Change Server Name";
	}
});
```
{% endcode %}

**removeMember**

These functionalities allow the server creator to remove members from the server. It involves confirmation dialogs and requests to the server to perform the removal action.

{% code lineNumbers="true" %}
```javascript
// Remove Member Form
const removeMemberForm = document.getElementById("removeMemberForm");
const memberToRemoveSelect = document.getElementById("memberToRemove");
const removeMemberButton = document.getElementById("removeMemberButton");
const removeMemberButtonText = document.getElementById(
	"removeMemberButtonText"
);

// Function to fetch server members and populate the dropdown
async function populateMemberDropdown(serverId) {
	if (!serverId) {
		return;
	}
	const response = await fetch(`/api/server/${serverId}/members`);
	const members = await response.json();
	// Clear existing options
	memberToRemoveSelect.innerHTML = "";
	// Populate the dropdown with new options
	members.forEach((member) => {
		// Assuming you have the member's ID and username
		if (member.id !== member.ownerId) {
			// Ensure ownerId is being sent in the API response
			// Don't add the server creator
			const option = document.createElement("option");
			option.value = member.id;
			option.textContent = member.username;
			memberToRemoveSelect.appendChild(option);
		}
	});
}
```
{% endcode %}

**deleteServer**

These functionalities allow the server creator to delete the server. It involves confirmation dialogs and requests to the server to perform the deletion action.

{% code lineNumbers="true" %}
```javascript
// Delete Server Form
const deleteServerForm = document.getElementById("deleteServerForm");
if (deleteServerForm) {
	deleteServerForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		console.log("Handling delete server form submission");

		const serverId = getServerIdFromUrl(); // Use the existing function to get the server ID

		try {
			const response = await fetch(`/delete-server/${serverId}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (response.ok) {
				const result = await response.json();
				alert(result.message || "Server deleted successfully");
				window.location.href = result.redirectUrl || "/home"; // Redirect to the provided URL or home
			} else {
				throw new Error("Failed to delete server");
			}
		} catch (error) {
			console.error("Error:", error);
			alert(error.message || "Error deleting server");
		}
	});
}
```
{% endcode %}
