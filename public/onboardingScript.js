/**
 * This script handles user interactions on the onboarding page, specifically for creating new servers
 * and joining existing ones. It listens for form submissions on both the 'Create Server' and 'Join Server'
 * forms, processes the input, and communicates with the server via fetch API calls to either create a new
 * server or join an existing one based on the provided server code.
 */

/**
 * Handles the submission of the 'Create Server' form. When the form is submitted, it disables the submit
 * button and displays a loading indicator. It then sends a POST request to the '/create-server' endpoint
 * with the form data. Based on the response from the server, it either redirects the user to the new server's
 * page, displays an error message, or re-enables the form for correction and resubmission.
 *
 * @listens submit - Attaches an event listener to the 'Create Server' form submission.
 */
document
	.getElementById("createServerForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault();
		const createServerButton = document.querySelector(
			"#createServerForm button"
		);
		const originalButtonText = createServerButton.innerHTML;

		createServerButton.disabled = true;
		createServerButton.innerHTML =
			'Creating Server... <i class="fa fa-spinner fa-spin"></i>';

		const formData = new FormData(this);
		try {
			const response = await fetch("/create-server", {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			if (response.ok) {
				const result = await response.json();
				window.location.href = result.redirectUrl;
			} else if (response.status === 409 || response.status === 400) {
				// Check for the status code
				const result = await response.text(); // Assuming the server sends back a plain text message
				alert(result); // Show the server's error message
			} else {
				alert("Failed to create server. Please try again.");
			}
		} catch (error) {
			console.error("Error occurred:", error);
			alert("An error occurred while trying to create the server.");
		} finally {
			createServerButton.innerHTML = originalButtonText;
			createServerButton.disabled = false;
		}
	});

/**
 * Handles the submission of the 'Join Server' form. This function is triggered when the form is submitted,
 * disabling the submit button and showing a loading indicator. It sends a POST request to the '/join-server'
 * endpoint with the server code. If successful, the user is redirected to the server's page or informed about
 * the successful join. If the attempt fails, an error message is displayed, and the form is reset for another attempt.
 *
 * @listens submit - Attaches an event listener to the 'Join Server' form submission.
 */
document
	.getElementById("joinServerForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault();
		const joinServerButton = document.querySelector("#joinServerForm button");
		const originalButtonText = joinServerButton.innerHTML;

		joinServerButton.disabled = true;
		joinServerButton.innerHTML =
			'Joining Server... <i class="fa fa-spinner fa-spin"></i>';

		const serverCode = document.getElementById("serverCode").value;

		const response = await fetch("/join-server", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ serverCode }),
			credentials: "include",
		});

		if (response.ok) {
			const result = await response.json();
			if (result.redirectUrl) {
				window.location.href = result.redirectUrl;
			} else {
				// handle the case where there is no redirectUrl
				alert("Successfully joined the server");
			}
		} else {
			// Handle errors
			alert("Failed to join server. Please check the code and try again.");
		}

		joinServerButton.disabled = false;
		joinServerButton.innerHTML = originalButtonText;
	});
