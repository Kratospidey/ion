// public/onboardingScript.js

// Handle creating a new server
document
	.getElementById("createServerForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault();
		const formData = new FormData(this); // 'this' refers to the form
		const response = await fetch("/create-server", {
			method: "POST",
			body: formData,
			credentials: "include",
		});

		if (response.ok) {
			// Redirect to the home page or display a success message
			window.location.href = "/home";
		} else {
			// Handle errors
			alert("Failed to create server. Please try again.");
		}
	});

// Handle joining an existing server
document
	.getElementById("joinServerForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault();
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
			// Redirect or display success message
			window.location.href = "/home";
		} else {
			// Handle errors
			alert("Failed to join server. Please check the code and try again.");
		}
	});
