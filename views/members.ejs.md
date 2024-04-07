# members.ejs

**Copy Invite Link Functionality**

{% code lineNumbers="true" %}
```ejs
/**
 * Copies the server invite link to the user's clipboard.
 * The function constructs the full invite link using the provided server code and the origin of the current window location.
 * It then attempts to write this invite link to the clipboard. Upon success, it alerts the user that the link has been copied.
 * In case of failure, it alerts the user that the link copying failed.
 *
 * @param {string} code - The unique code of the server, used to construct the invite link.
 */
function copyInviteLink(code) {
	const inviteLink = `${window.location.origin}/joinserver/${code}`;
	navigator.clipboard.writeText(inviteLink).then(
		function () {
			/* clipboard successfully set */
			alert("Invite link copied to clipboard!");
		},
		function () {
			/* clipboard write failed */
			alert("Failed to copy invite link.");
		}
	);
}
```
{% endcode %}

The script includes a function named `copyInviteLink`, which is triggered when the user clicks the 'Copy Invite' button. This function constructs a full invite link to the server using the server's unique code passed as a parameter and the current window's origin. It attempts to copy this constructed link to the user's clipboard using the Clipboard API. The function provides immediate feedback to the user:

* On successful copy: An alert notifies the user that the invite link has been successfully copied to the clipboard.
* On failure: An alert informs the user of the failure to copy the link.

This feature enhances the user experience by facilitating the easy sharing of server invite links, making the process seamless and user-friendly.

**Hover Interaction Management**

Additionally, the script manages hover interactions over the members' div. It utilizes event listeners for 'mouseover' and 'mouseout' events to control UI behavior based on user interaction.

{% code lineNumbers="true" %}
```ejs
/**
 * Initializes hover interaction behaviors on the members' div.
 * It sets up event listeners for 'mouseover' and 'mouseout' events. The 'mouseover' event clears any existing timeouts,
 * effectively canceling the shrink operation if the user hovers over the div again. The 'mouseout' event starts a timeout
 * which trigger a shrink operation on the members' div after a specified delay, enhancing the UI interaction.
 */
let membersDiv = document.querySelector(".members");
let hoverTimeout;

membersDiv.addEventListener("mouseover", function () {
	clearTimeout(hoverTimeout); // Cancel any pending shrink operation
});

membersDiv.addEventListener("mouseout", function () {
	hoverTimeout = setTimeout(() => {
		// This code will execute after 500ms of not hovering over the members div
		// Can adjust the timeout to control the delay before the div shrinks back
	}, 500);
});
```
{% endcode %}

* On `mouseover`: Any pending timeout set to potentially shrink the members' div (or perform any other UI adjustment) is cleared, ensuring that the operation does not proceed if the user hovers over the div again.
* On `mouseout`: A timeout is initiated, which, after a delay (currently 500ms), could trigger a UI adjustment operation, such as shrinking the members' div. This delayed operation is intended to enhance the interface by not immediately reacting to the mouse leaving the div, providing a smoother user experience.
