document
	.querySelector("form")
	.addEventListener("submit", async function (event) {
		event.preventDefault();
		var emailOrUsernameInput = document.getElementById("email"); // Consider renaming the ID to 'emailOrUsername'
		var passwordInput = document.getElementById("password");

		// Validate email or username format
		var emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		var usernamePattern = /^[a-zA-Z0-9._]+$/; // Adjust this pattern as needed
		var isEmail = emailPattern.test(emailOrUsernameInput.value);
		var isUsername = usernamePattern.test(emailOrUsernameInput.value);

		if (!isEmail && !isUsername) {
			emailOrUsernameInput.setCustomValidity(
				"Please enter a valid email address or username."
			);
			emailOrUsernameInput.reportValidity();
			return;
		}

		// Validate password length (optional)
		var minLength = 8; // Minimum length for password
		if (passwordInput.value.length < minLength) {
			passwordInput.setCustomValidity(
				"Password must be at least " + minLength + " characters long."
			);
			passwordInput.reportValidity();
			return;
		}

		// Clear custom validity messages
		emailOrUsernameInput.setCustomValidity("");
		passwordInput.setCustomValidity("");

		// Prepare the data to be sent to the server
		const loginData = {
			password: passwordInput.value,
		};
		// Determine if the input is an email or username and add to the loginData accordingly
		if (isEmail) {
			loginData.email = emailOrUsernameInput.value;
		} else {
			loginData.username = emailOrUsernameInput.value;
		}

		// Submit the form data to the server
		const response = await fetch("/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(loginData),
		});

		if (response.ok) {
			// Handle successful login
			window.location.href = "/home"; // Redirect to dashboard or another page
		} else {
			// Handle error response
			const errorMessage = await response.text();
			alert(errorMessage); // Show the error message to the user
		}
	});
