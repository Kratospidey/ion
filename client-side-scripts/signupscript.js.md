# signupScript.js

#### Sign-Up Form Submission Handler

**Overview**

This script is responsible for handling the 'Sign Up' form's submission on a registration page. It enhances the form submission process by providing visual feedback, performing client-side validation, and communicating with the server asynchronously using the Fetch API. The script ensures a smooth user experience by managing the submit button's state, displaying a loading indicator during the process, and providing immediate feedback upon completion.

**Functionality**

* **Form Submission Interception**: Prevents the default form submission action, allowing for custom validation and submission handling.
* **Visual Feedback**: Updates the submit button to indicate the ongoing submission process and prevent multiple submissions.
* **Data Collection and Submission**: Gathers user input, formats it as needed, and sends it to the server using an asynchronous POST request.
* **Response Handling**: Provides user feedback based on the server's response, including success messages and error handling.

**Code Snippets and Explanation**

1.  **Event Listener Setup**: The script begins by attaching an event listener to the 'Sign Up' form's `submit` event.

    ```javascript
    document.getElementById("signupForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        ...
    });
    ```
2.  **Submit Button State Management**: Changes the submit button's content to "Signing Up..." and disables it to prevent further submissions during the processing period.

    ```javascript
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = 'Signing Up... <i class="fa fa-spinner fa-spin"></i>';
    submitButton.disabled = true;
    ```
3.  **Form Data Collection**: Collects the input data from the form, converts the username to lowercase for consistency, and prepares the data for submission.

    ```javascript
    const username = document.getElementById("username").value.toLowerCase();
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", document.getElementById("email").value);
    formData.append("profilePicture", document.getElementById("profilePicture").files[0]);
    formData.append("password", document.getElementById("password").value);
    formData.append("confirmPassword", document.getElementById("confirmPassword").value);
    ```
4.  **Server Submission and Response Handling**: Submits the form data to the server and handles the response. On success, the user is notified and redirected. On failure, an error message is displayed.

    ```javascript
    const response = await fetch("/signup", {
        method: "POST",
        body: formData,
    });

    if (response.ok) {
        alert("Account created successfully!");
        window.location.href = "/onboarding";
    } else {
        const errorMessage = await response.text();
        alert(errorMessage);
    }
    ```
5.  **Restoring Button State**: After the server response is handled, the submit button's original text is restored, and it's re-enabled for further actions.

    ```javascript
    submitButton.innerHTML = originalButtonText;
    submitButton.disabled = false;
    ```
