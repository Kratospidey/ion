---
description: explains the file tree of the project
---

# File Tree

***

### File Tree Overview

{% code title="filetree" lineNumbers="true" %}
```
.
├── README.md
├── config
│   └── config.json
├── models
│   ├── Message.js
│   ├── Server.js
│   ├── ServerUser.js
│   ├── User.js
│   └── index.js
├── package-lock.json
├── package.json
├── public
│   ├── chat.js
│   ├── img
│   │   └── useravatar.png
│   ├── login.css
│   ├── loginScript.js
│   ├── onboarding.css
│   ├── onboardingScript.js
│   ├── script.js
│   ├── signupScript.js
│   └── styles.css
├── scripts
│   ├── dropTables.js
│   ├── seedData.js
│   ├── seedServers.js
│   └── seedUsers.js
├── server.js
└── views
    ├── layout.ejs
    ├── login.ejs
    ├── onboarding.ejs
    ├── partials
    │   ├── activespace.ejs
    │   ├── head.ejs
    │   ├── header.ejs
    │   ├── members.ejs
    │   └── sidepanel.ejs
    └── signup.ejs

7 directories, 32 files
```
{% endcode %}

This documentation provides an overview of the Ion's file structure, offering insights into the organization and functionality of key components.

#### `README.md`

An introductory guide to the project, including setup instructions, features, and usage guidelines.

#### `config/`

Contains configuration files for the application.

* **`config.json`**: Configuration settings for different environments (development, test, production), including database details.

#### `models/`

Defines Sequelize models that map to database tables, establishing the structure and relationships.

* **`Message.js`**: Represents chat messages with content, sender, and associated server.
* **`Server.js`**: Defines chat servers/rooms, including metadata like name and owner.
* **`ServerUser.js`**: Junction model for many-to-many relationships between `Server` and `User`.
* **`User.js`**: User model with details like username, email, and password.
* **`index.js`**: Initializes Sequelize and imports model files.

#### `public/`

Houses static assets such as JavaScript, CSS, and images.

* **`chat.js`**: Client-side logic for real-time chat functionalities.
* **`img/`**: Directory for image assets used within the application.
* **`*.css`**: Stylesheets for various pages and components.
* **`loginScript.js`, `onboardingScript.js`, `signupScript.js`**: Client-side scripts for handling user authentication and onboarding.
* **`script.js`**: General client-side JavaScript.
* **`uploads/`**: Storage for user-uploaded content, such as profile pictures and server images.

#### `scripts/`

Utility scripts for database management and initial setup.

* **`dropTables.js`**: Script to drop all database tables, considering dependencies.
* **`seedData.js`, `seedServers.js`, `seedUsers.js`**: Scripts to populate the database with initial data for development or testing.

#### `server.js`

The main server file that sets up the Express app, middleware, routes, and WebSocket connections for real-time communication.

#### `views/`

EJS templates for rendering server-side HTML.

* **`layout.ejs`**: Base layout that includes common UI components.
* **`login.ejs`, `signup.ejs`, `onboarding.ejs`**: Templates for authentication and user onboarding.
  * **`partials/`**: Reusable EJS snippets like navigation bars, headers, and chat components.
