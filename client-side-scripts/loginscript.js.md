# loginScript.js

#### Login Form Submission Handler

**Overview**

The script is tasked with handling the login form submission, employing client-side validation for inputs and asynchronous communication with the server. It supports login via either an email address or a username, incorporating pattern and length validations for these inputs. The script offers immediate, user-friendly feedback for any invalid inputs and provides visual indications of the ongoing login process.

**Key Functionalities**

* **Form Submission Interception**: Prevents the default form submission mechanism to enable custom handling, including validation and asynchronous server communication.
* **Input Validation**: Validates email/username and password fields against predefined patterns and length requirements, respectively.
* **Visual Feedback During Processing**: Disables the login button and updates its label to "Logging in..." with a spinner icon, indicating the ongoing login process.
* **Asynchronous Server Communication**: On successful validation, formats and sends the login credentials to the server using the Fetch API, and handles the server's response appropriately.

**Detailed Implementation**

1.  **Event Listener Attachment**:

    * Attaches an event listener to the login form's `submit` event.

    {% code lineNumbers="true" %}
    ```javascript
    document.querySelector("form").addEventListener("submit", async function (event) { ... });
    ```
    {% endcode %}
2.  **Submit Button State Management**:

    * Temporarily modifies the login button to signal the ongoing login attempt.

    {% code lineNumbers="true" %}
    ```javascript
    const loginButton = document.getElementById("login-button");
    loginButton.disabled = true;
    loginButton.innerHTML = 'Logging in... <i class="fa fa-spinner fa-spin"></i>';
    ```
    {% endcode %}
3.  **Client-Side Validation**:

    * Validates the email/username input against specific patterns and checks the password length.

    {% code lineNumbers="true" %}
    ```javascript
    var isEmail = emailPattern.test(emailOrUsernameInput.value);
    var isUsername = usernamePattern.test(emailOrUsernameInput.value);
    ...
    if (passwordInput.value.length < minLength) { ... }
    ```
    {% endcode %}
4.  **Preparation and Submission of Login Data**:

    * Formats the login credentials, distinguishing between email and username logins, and submits the data to the server.

    {% code lineNumbers="true" %}
    ```javascript
    const loginData = { ... };
    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
    });
    ```
    {% endcode %}
5.  **Server Response Handling and User Feedback**:

    * On successful login, redirects the user to the home page. Displays an error message in case of failure.

    {% code lineNumbers="true" %}
    ```javascript
    if (response.ok) {
        window.location.href = "/home";
    } else {
        const errorMessage = await response.text();
        alert(errorMessage);
    }
    ```
    {% endcode %}
6.  **Restoration of Button State**:

    * Restores the login button to its original state after the process concludes.

    {% code lineNumbers="true" %}
    ```javascript
    loginButton.disabled = false;
    loginButton.innerHTML = originalButtonText;
    ```
    {% endcode %}
