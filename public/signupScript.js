// public/signupScript.js
document
	.getElementById("signupForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault();
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
	});
