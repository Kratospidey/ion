# script.js

#### Section Visibility Toggle

**Overview**

The script facilitates a clean and focused user interface by displaying only the section relevant to the user's current task or selection. It achieves this by hiding all sections initially and then showing the section associated with the clicked 'sidebutton'. This behavior simulates a tabbed interface, which is particularly useful for applications with multiple functional areas.

**Functionality**

* **Initial State**: All sections are hidden initially to provide a clutter-free interface.
* **Section Toggle**: Clicking a 'sidebutton' hides all sections and then displays the target section associated with the clicked button.
* **Bootstrap Tooltips**: Initializes Bootstrap tooltips for elements with tooltips defined, enhancing user guidance and experience.

**Implementation Details**

1.  **Selecting Buttons**:

    * The script selects all buttons with the 'sidebuttons' class.

    {% code lineNumbers="true" %}
    ```javascript
    const buttons = document.querySelectorAll(".sidebuttons");
    ```
    {% endcode %}
2.  **Hiding Sections**:

    * Defines a function to hide all sections, setting their display CSS property to 'none'.

    {% code lineNumbers="true" %}
    ```javascript
    function hideAllSections() {
        document.getElementById("chat").style.display = "none";
        document.getElementById("codespace").style.display = "none";
    }
    ```
    {% endcode %}
3.  **Click Event Handling**:

    * Attaches click event listeners to each 'sidebutton', which invoke the `hideAllSections` function and then display the target section.

    {% code lineNumbers="true" %}
    ```javascript
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            hideAllSections();
            const targetId = this.getAttribute("data-target");
            document.getElementById(targetId).style.display = "block";
        });
    });
    ```
    {% endcode %}
4.  **Bootstrap Tooltips Initialization**:

    * Initializes Bootstrap tooltips for elements with the `data-bs-toggle="tooltip"` attribute upon DOM content load.

    {% code lineNumbers="true" %}
    ```javascript
    document.addEventListener("DOMContentLoaded", function () {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    });
    ```
    {% endcode %}
