document
	.getElementById("signupForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault();

		// Button element
		const submitButton = document.querySelector('button[type="submit"]');

		// Original button text
		const originalButtonText = submitButton.innerHTML;

		// Change button text and disable it
		submitButton.innerHTML =
			'Signing Up... <i class="fa fa-spinner fa-spin"></i>'; // Ensure you have a font-awesome or similar library for the spinner icon
		submitButton.disabled = true;

		const username = document.getElementById("username").value.toLowerCase();

		const formData = new FormData();
		formData.append("username", username);
		formData.append("email", document.getElementById("email").value);
		formData.append(
			"profilePicture",
			document.getElementById("profilePicture").files[0]
		);
		formData.append("password", document.getElementById("password").value);
		formData.append(
			"confirmPassword",
			document.getElementById("confirmPassword").value
		);

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

		// Restore button text and enable it
		submitButton.innerHTML = originalButtonText;
		submitButton.disabled = false;
	});
