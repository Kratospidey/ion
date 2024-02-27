// Handle creating a new server
document
	.getElementById("createServerForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault();
		const createServerButton = document.querySelector(
			"#createServerForm button"
		);
		const originalButtonText = createServerButton.innerHTML;

		// Change the button text to "Creating Server..." and add a spinner icon
		createServerButton.disabled = true;
		createServerButton.innerHTML =
			'Creating Server... <i class="fa fa-spinner fa-spin"></i>';

		const formData = new FormData(this); // 'this' refers to the form
		const response = await fetch("/create-server", {
			method: "POST",
			body: formData,
			credentials: "include",
		});

		if (response.ok) {
			const result = await response.json();
			if (result.redirectUrl) {
				window.location.href = result.redirectUrl;
			} else {
				// handle the case where there is no redirectUrl
				alert("Server created successfully");
			}
		} else {
			// Handle errors
			alert("Failed to create server. Please try again.");
		}
		createServerButton.innerHTML = originalButtonText;
		createServerButton.disabled = false;
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
