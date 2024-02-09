// const tooltipTriggerList = document.querySelectorAll(
// 	"[data-bs-toggle='tooltip']"
// );
// const tooltipList = [...tooltipTriggerList].map(
// 	(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
// );


// Select all buttons with the class 'sidebuttons'
const buttons = document.querySelectorAll('.sidebuttons');

// Function to hide all sections
function hideAllSections() {
    document.getElementById('chat').style.display = 'none';
    document.getElementById('codespace').style.display = 'none';
}

// Loop through each button and attach a click event listener
buttons.forEach(button => {
    button.addEventListener('click', function() {
        // Hide all sections first
        hideAllSections();

        // Get the target from the button's data attribute
        const targetId = this.getAttribute('data-target');
		const targetDiv = document.getElementById(targetId);
		if (targetId === "chat")
		{
			targetDiv.style.backgroundColor = "#1e1e1e";
			console.log("executed");
		}
        

        // Toggle the display property of the target div
        if (targetDiv.style.display === 'none') {
            targetDiv.style.display = 'block';
        } else {
            targetDiv.style.display = 'none';
        }
    });
});

