---
description: High Level View of the Project
---

# Overview

***

### Project Overview and Motivation

This chat application, developed as part of my final year diploma project, is inspired by the functionality of Discord but with a distinctive focus on software engineering and programming communities. The application allows users to create servers with dedicated chat spaces, share images and files, and uniquely, execute code snippets in a variety of popular programming languages directly within the browser. This feature aims to foster a collaborative environment for coding discussions and real-time problem-solving, reflecting the project's goal to serve as a practical tool for programming enthusiasts and students alike.

***

#### Technologies Used and Rationale

The choice of technologies for this project was driven by functionality, ease of development, and the learning opportunities they presented:

* **Node.js and Express**: Node.js provides a scalable and efficient JavaScript runtime environment, while Express simplifies server-side scripting with its powerful yet minimalistic web application framework, making the development process more streamlined.
* **Socket.io**: For real-time bidirectional event-based communication, Socket.io was instrumental in enabling live chat functionality and collaborative coding features, utilizing web sockets for instant data exchange.
* **Sequelize with MySQL**: Sequelize, an ORM for MySQL, was chosen for its ability to abstract database queries, making data manipulation safer and more intuitive, especially for complex relational databases.
* **EJS (Embedded JavaScript Templating)**: EJS was selected for its simplicity and ease of integration with Express, allowing for dynamic content rendering on the server side without the overhead of more complex frameworks like React.
* **Multer**: Utilized for handling `multipart/form-data`, Multer is essential for the robust file upload feature, enabling users to share images and files seamlessly within the application.
* **Google Cloud Storage Buckets and AWS Flexible MySQL Server**: These cloud services were employed to store files and manage the database, respectively, offering scalability, reliability, and extensive support for managing application data in a cloud environment.
* **AWS Deploy Node.js App Service**: This service facilitated the deployment of the application, ensuring a smooth transition from development to a live environment, with managed updates and scaling.
* **Halfmoon CSS Library**: A Bootstrap variant known for its dark mode and customization features, Halfmoon was chosen to streamline the UI development process, providing a modern and responsive design with minimal effort.
* **jQuery**: For simpler DOM manipulation, event handling, and AJAX calls, jQuery was incorporated, speeding up the development of interactive features without the complexity of modern frontend frameworks.
* **EmojiMart**: Integrated via CDN, EmojiMart provided a rich, customizable emoji picker, enhancing the chat experience with a wide range of expressive options.
* **JDoodle API**: This API was integrated to support the execution of code snippets in various languages, adding a unique dimension to the application by allowing users to compile and run code directly within the chat interface.
* **nanoid**: A compact and secure library for generating unique, URL-friendly IDs, used for creating distinct server invite codes.
