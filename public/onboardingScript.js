// Handle creating a new server
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

// Handle joining an existing server
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
