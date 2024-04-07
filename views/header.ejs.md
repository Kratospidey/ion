# header.ejs

User Settings and Server Management Features

**getCurrentUserId**

This asynchronous function fetches the current user's ID from the server. It's essential for identifying the user across various operations, such as leaving a server or changing user-specific settings.

```javascript
async function getCurrentUserId() {
    // Fetch user ID logic here
}
```

**leaveServer**

Allows a user to leave a specified server. It prompts the user for confirmation and then sends a request to the server to remove the user from the server's member list.

```javascript
async function leaveServer(serverId, userId) {
    // Leave server logic here
}
```

**changeUsername**

Enables users to change their username by submitting a form. The function validates the new username, updates it on the server, and provides feedback to the user.

```javascript
document.getElementById("changeUsernameForm").addEventListener("submit", async (event) => {
    // Change username logic here
});
```

**logout**

Logs out the user by redirecting them to the logout route, effectively ending their session.

```javascript
document.getElementById("logoutButton").addEventListener("click", function () {
    window.location.href = "/logout";
});
```

**changeProfilePicture**

Facilitates changing the user's profile picture. Users can select a new image file and submit it, after which the server updates the user's profile picture.

```javascript
const changePFPForm = document.getElementById("changePFPForm");
changePFPForm.addEventListener("submit", async (event) => {
    // Change profile picture logic here
});
```

**deleteAccount**

Allows users to delete their account. It asks for confirmation before sending a deletion request to the server.

```javascript
const deleteAccountButton = document.getElementById("deleteAccountButton");
deleteAccountButton.addEventListener("click", async () => {
    // Delete account logic here
});
```

**getServerIdFromUrl**

Extracts the server ID from the current page's URL. This ID is used in various server-related operations.

```javascript
function getServerIdFromUrl() {
    // Extract server ID from URL logic here
}
```

**checkIfCurrentUserIsServerCreator**

Checks whether the current user is the creator of a server. This information is used to determine if the user has permission to access certain server settings.

```javascript
async function checkIfCurrentUserIsServerCreator(serverId) {
    // Check server creator status logic here
}
```

**changeServerProfilePicture and changeServerName**

Enables the server creator to change the server's profile picture and name. Similar to changing the user's profile picture, these functions use forms where the server creator can submit new values.

```javascript
const changeServerPFPForm = document.getElementById("changeServerPFPForm");
changeServerPFPForm.addEventListener("submit", async (event) => {
    // Change server profile picture logic here
});

const changeServerNameForm = document.getElementById("changeServerNameForm");
changeServerNameForm.addEventListener("submit", async (event) => {
    // Change server name logic here
});
```

**removeMember and deleteServer**

These functionalities allow the server creator to remove members from the server or delete the server entirely. They involve confirmation dialogs and requests to the server to perform the respective actions.

```javascript
const removeMemberForm = document.getElementById("removeMemberForm");
removeMemberForm.addEventListener("submit", async (event) => {
    // Remove member logic here
});

const deleteServerForm = document.getElementById("deleteServerForm");
deleteServerForm.addEventListener("submit", async (event) => {
    // Delete server logic here
});
```
