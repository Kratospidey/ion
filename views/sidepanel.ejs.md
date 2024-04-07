# sidepanel.ejs

**File Upload Functionality**

The file upload script enhances the user experience by providing immediate feedback and validation. It ensures that users select a file before attempting an upload and checks that the file size does not exceed 20 MB. The script employs an `XMLHttpRequest` to submit the file(s) to a specified endpoint asynchronously, allowing for non-blocking file uploads.

* **Form Submission Interception**: Prevents the default form submission action, enabling custom file upload handling.
* **File Validation**: Checks if a file is selected and verifies that each file's size is within acceptable limits.
* **Asynchronous File Upload**: Utilizes `XMLHttpRequest` for submitting the form data to the server, ensuring the process does not block user interaction with the page.
* **User Feedback**: Provides alerts to inform the user about the status of the file upload, including success, error messages, and a page reload upon successful upload.

**Code Snippet for File Upload**

{% code lineNumbers="true" %}
```javascript
const uploadButton = document.querySelector(".uploadbtn");
uploadButton.innerHTML = 'Uploading... <i class="fa fa-spinner fa-spin"></i>';
uploadButton.disabled = true;

// XMLHttpRequest setup and event handling
xhr.onload = function () {
    if (xhr.status === 200) {
        alert(xhr.response.message);
        setTimeout(function () { location.reload(); }, 2000);
    } else {
        // Error handling
        alert("An error occurred during the upload.");
    }
    uploadButton.innerHTML = "Upload File";
    uploadButton.disabled = false;
};

xhr.open("POST", "/upload", true);
xhr.send(formData);
```
{% endcode %}

**File Deletion Functionality**

The file deletion script provides a straightforward mechanism for users to remove uploaded files. It confirms the user's intent to delete a file and then communicates with the server to remove the specified file. Successful deletions result in the immediate removal of the file's UI element, maintaining an updated view.

* **Confirmation Dialog**: Prompts the user to confirm file deletion, preventing accidental removal of files.
* **Server Communication**: Sends a POST request to the server to delete the file, using the file's path and server ID.
* **Dynamic UI Update**: Removes the file's UI element upon successful deletion, keeping the file list current.
* **Error Handling**: Displays an error alert if the deletion process encounters an issue.

**Code Snippet for File Deletion**

{% code lineNumbers="true" %}
```javascript
const isConfirmed = confirm(`Are you sure you want to delete "${fileName}"?`);
if (!isConfirmed) { return; }

// Fetch request setup and handling
const response = await fetch("/delete-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl: filePath, serverId: serverId }),
    credentials: "include",
});

if (response.ok) {
    alert("File successfully deleted.");
    fileItem.remove();
} else {
    // Error handling
    alert("Error deleting file.");
}
```
{% endcode %}

Both the file upload and deletion scripts work together within the `sidepanel.ejs` template to manage file-related functionalities, offering a user-friendly interface for uploading and managing files within the application.
