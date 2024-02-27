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
