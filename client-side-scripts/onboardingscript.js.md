# onboardingScript.js

#### Create Server Form Submission Handler

**Overview**

This part of the script manages the submission of the 'Create Server' form. It provides immediate visual feedback by disabling the submit button and displaying a loading indicator during the processing phase. Depending on the server's response, it directs the user to the newly created server's page or provides error feedback for correction and resubmission.

**Implementation Details**

*   **Event Listener**: Attaches to the 'Create Server' form's `submit` event.

    ```javascript
    document.getElementById("createServerForm").addEventListener("submit", async function (event) { ... });
    ```
*   **Submit Button State Management**: Disables the submit button and changes its text to indicate the ongoing creation process.

    ```javascript
    const createServerButton = document.querySelector("#createServerForm button");
    createServerButton.innerHTML = 'Creating Server... <i class="fa fa-spinner fa-spin"></i>';
    createServerButton.disabled = true;
    ```
*   **Form Data Processing**: Collects the form data and sends a POST request to the `/create-server` endpoint.

    ```javascript
    const formData = new FormData(this);
    const response = await fetch("/create-server", {
        method: "POST",
        body: formData,
        credentials: "include",
    });
    ```
*   **Server Response Handling**: On successful server creation, redirects the user to the new server's page. In case of errors (e.g., server code conflicts or invalid inputs), displays an appropriate error message.

    ```javascript
    if (response.ok) {
        const result = await response.json();
        window.location.href = result.redirectUrl;
    } else {
        // Error handling logic
        const result = await response.text();
        alert(result);
    }
    ```

#### Join Server Form Submission Handler

**Overview**

This portion handles the 'Join Server' form submission, employing a similar pattern of user feedback and server communication. It processes the server code input, sends it to the server, and either redirects the user to the server's page upon a successful join or displays an error message for failed attempts.

**Implementation Details**

*   **Event Listener**: Attaches to the 'Join Server' form's `submit` event.

    ```javascript
    document.getElementById("joinServerForm").addEventListener("submit", async function (event) { ... });
    ```
*   **Submit Button State Management**: Updates the join button's state to reflect the ongoing join process.

    ```javascript
    const joinServerButton = document.querySelector("#joinServerForm button");
    joinServerButton.innerHTML = 'Joining Server... <i class="fa fa-spinner fa-spin"></i>';
    joinServerButton.disabled = true;
    ```
*   **Server Code Submission**: Sends the server code through a POST request to the `/join-server` endpoint and handles the response.

    ```javascript
    const serverCode = document.getElementById("serverCode").value;
    const response = await fetch("/join-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverCode }),
        credentials: "include",
    });
    ```
*   **Server Response and User Redirection**: Redirects the user to the joined server's page on success, or alerts the user in case of a failure.

    ```javascript
    if (response.ok) {
        const result = await response.json();
        window.location.href = result.redirectUrl;
    } else {
        // Error feedback
        alert("Failed to join server. Please check the code and try again.");
    }
    ```
