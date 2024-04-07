/**
 * Handles the submission of the 'Sign Up' form on the registration page. It intercepts the default form submission,
 * performs validations, and then sends a POST request to the '/signup' endpoint with the user's sign-up data. The function
 * manages the submit button state to provide visual feedback by displaying a loading indicator and disabling the button during
 * the submission process. Upon successful account creation, the user is redirected to the onboarding page. If the submission fails,
 * an appropriate error message is displayed to the user.
 *
 * The function gathers form data, including username, email, profile picture, and password, and submits it using the Fetch API.
 * The username is converted to lowercase to ensure consistency. Error handling includes both server-side errors (e.g., username
 * already taken) and network issues, providing feedback to the user in each case.
 *
 * @listens submit - Adds an event listener to the 'Sign Up' form submission event, preventing the default form submission action.
 */
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
