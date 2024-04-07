/**
 * This script is responsible for toggling visibility of different sections within the application based on user interactions
 * with buttons that have the class 'sidebuttons'. It initially hides all sections and then displays only the section related
 * to the clicked button, identified by a data attribute ('data-target') on the button itself.
 *
 * Additionally, the script initializes Bootstrap tooltips for elements that have the attribute 'data-bs-toggle="tooltip"'.
 * This initialization occurs once the DOM content has fully loaded, ensuring that tooltips are attached to all relevant elements.
 *
 * The hide and show functionality facilitates a tab-like interface where only one section is visible at a time, improving the
 * user interface and user experience by reducing clutter and focusing the user's attention on one section at a time.
 *
 * @function hideAllSections
 * Hides all sections in the interface by setting their display CSS property to 'none'. This function is called before displaying
 * the target section related to a clicked button to ensure that only one section is visible at a time.
 *
 * @listens click - Attaches click event listeners to buttons with the class 'sidebuttons' to toggle section visibility.
 * @listens DOMContentLoaded - Attaches a listener for the 'DOMContentLoaded' event to initialize Bootstrap tooltips once the DOM is fully loaded.
 * 
 * @example
 * // Clicking a button with the class 'sidebuttons' and a 'data-target' attribute
 * <button class="sidebuttons" data-target="chat">Chat</button>
 * // This will hide all sections and then display the section with the ID 'chat'.
 * 
 * @example
 * // Initializing tooltips on elements with the 'data-bs-toggle="tooltip"' attribute after the DOM content has loaded.
 * <button data-bs-toggle="tooltip" title="Tooltip on top">Tooltip</button>
 */

// const tooltipTriggerList = document.querySelectorAll(
// 	"[data-bs-toggle='tooltip']"
// );
// const tooltipList = [...tooltipTriggerList].map(
// 	(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
// );

// Select all buttons with the class 'sidebuttons'
const buttons = document.querySelectorAll(".sidebuttons");

// Function to hide all sections
function hideAllSections() {
	document.getElementById("chat").style.display = "none";
	document.getElementById("codespace").style.display = "none";
}

// Loop through each button and attach a click event listener
buttons.forEach((button) => {
	button.addEventListener("click", function () {
		// Hide all sections first
		hideAllSections();

		// Get the target from the button's data attribute
		const targetId = this.getAttribute("data-target");
		const targetDiv = document.getElementById(targetId);

		targetDiv.style.display = "block";
	});
});

document.addEventListener("DOMContentLoaded", function () {
	var tooltipTriggerList = [].slice.call(
		document.querySelectorAll('[data-bs-toggle="tooltip"]')
	);
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl);
	});
});
