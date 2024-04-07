/**
 * Handles the login form submission on the login page. It prevents the default form submission to perform
 * client-side validation on the input fields for email/username and password. The script supports login using
 * either an email address or a username. It validates the input against specified patterns and length requirements,
 * providing immediate feedback for invalid inputs.
 *
 * Upon successful validation, the script formats the login data, distinguishing between an email or username based
 * on the input pattern, and sends a POST request to the '/login' endpoint using the Fetch API. The request includes
 * the user's credentials in JSON format. If the login is successful, the user is redirected to the home page. In case
 * of a login failure, an error message is displayed to the user.
 *
 * The login button is disabled and updated with a "Logging in..." message and a spinner icon during the processing
 * of the login request to provide visual feedback to the user. The button is then restored to its original state
 * after the operation completes, regardless of the outcome.
 *
 * @listens submit - Attaches an event listener to the login form's submit event to handle the form submission asynchronously.
 */
document
	.querySelector("form")
	.addEventListener("submit", async function (event) {
		event.preventDefault();

		// Target the existing <p> element inside the button
		const loginButton = document.getElementById("login-button");

		// Save the original button text
		const originalButtonText = loginButton.textContent;

		// Change the button text to "Logging in..." and add a spinner icon
		loginButton.disabled = true;
		loginButton.innerHTML =
			'Logging in... <i class="fa fa-spinner fa-spin"></i>'; // Ensure you have a font-awesome or similar library for the spinner icon

		var emailOrUsernameInput = document.getElementById("email");
		var passwordInput = document.getElementById("password");

		var emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		var usernamePattern = /^[a-zA-Z0-9._]+$/;
		var isEmail = emailPattern.test(emailOrUsernameInput.value);
		var isUsername = usernamePattern.test(emailOrUsernameInput.value);

		if (!isEmail && !isUsername) {
			emailOrUsernameInput.setCustomValidity(
				"Please enter a valid email address or username."
			);
			emailOrUsernameInput.reportValidity();
			// Restore button text
			loginButton.innerHTML = originalButtonText;
			return;
		}

		var minLength = 8;
		if (passwordInput.value.length < minLength) {
			passwordInput.setCustomValidity(
				"Password must be at least " + minLength + " characters long."
			);
			passwordInput.reportValidity();
			// Restore button text
			loginButton.innerHTML = originalButtonText;
			return;
		}

		emailOrUsernameInput.setCustomValidity("");
		passwordInput.setCustomValidity("");

		const loginData = {
			password: passwordInput.value,
		};

		if (isEmail) {
			loginData.email = emailOrUsernameInput.value;
		} else {
			loginData.username = emailOrUsernameInput.value;
		}

		const response = await fetch("/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(loginData),
		});

		if (response.ok) {
			window.location.href = "/home";
		} else {
			const errorMessage = await response.text();
			alert(errorMessage);
		}

		// Restore the button text to its original state
		loginButton.disabled = false;
		loginButton.innerHTML = originalButtonText;
	});
