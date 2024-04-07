# What is EJS

#### What is EJS?

EJS, which stands for Embedded JavaScript Templating, is a templating language that allows you to generate HTML markup with plain JavaScript. It provides a simple and effective way to inject data into HTML templates from the server side before sending the final rendered HTML to the client. EJS uses tags like `<% %>` to embed JavaScript code within an HTML file, making it straightforward to dynamically render web pages based on the data provided by a server.

#### Why is EJS Used?

EJS is used for server-side templating in Node.js applications for several reasons:

* **Simplicity**: EJS syntax is straightforward, especially for those already familiar with HTML and JavaScript. It doesn't introduce complex new syntax, making it easy to learn and use.
* **Dynamic Content Generation**: It allows developers to create dynamic content on the server before sending it to the client, which is useful for applications that require data-driven, interactive web pages.
* **Code Reusability**: EJS supports partials (reusable template fragments), which promotes DRY (Don't Repeat Yourself) principles and code reusability.

#### What are Views in EJS?

Views in EJS are templates or pages that are rendered and sent to the client. These are essentially the HTML templates that contain EJS syntax for embedding data. Views define the structure of the web page and dictate how the data injected into the template will be displayed to the users. Typically, the views are stored in a `views` directory in a Node.js project.

For example, a simple EJS view (`user.ejs`) might look like this:

```html
<!DOCTYPE html>
<html>
<head>
    <title>User Profile</title>
</head>
<body>
    <h1>Welcome, <%= user.name %></h1>
    <p>Email: <%= user.email %></p>
</body>
</html>
```

#### What are Partials?

Partials are reusable pieces of EJS templates that can be included in other EJS views. They are typically used for components that are shared across multiple pages, like headers, footers, and navigation bars. This encourages DRY principles and improves maintainability.

For instance, you could have a footer partial (`footer.ejs`):

```html
<footer>
    <p>&copy; 2024 My Website</p>
</footer>
```

And include it in your main layout like so:

```html
<% include partials/footer %>
```

#### Where are Partials Used?

Partials are used anywhere consistent elements are needed across multiple views. They help in avoiding repetition of the same markup across different templates. For example, a navigation bar that appears on every page can be maintained in a single partial file and included in each view, simplifying changes and updates to the navigation structure.

#### Advantages of EJS Over Normal JS

* **Server-Side Rendering**: EJS operates on the server, preparing the HTML before it reaches the client. This can lead to faster page load times since the browser doesn't need to render the content dynamically using client-side JavaScript.
* **SEO Benefits**: Since the content is rendered on the server and sent to the client as plain HTML, it is more accessible to search engine crawlers, potentially improving SEO.
* **Simplified Data Handling**: Injecting data into templates is straightforward with EJS, making it easier to display server-side data on the web page.
* **No Additional Libraries Required**: EJS is pure JavaScript and HTML. There's no need for external libraries or frameworks to manipulate the DOM after page load, which can simplify development.
