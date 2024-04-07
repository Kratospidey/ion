# User Model

#### User Model Documentation

**Overview**

The `User` model is a central component of the chat application, designed to represent the users who interact within the platform. It encompasses essential user information, including credentials and personal details, facilitating user management and authentication processes. This model plays a pivotal role in the application's functionality, from user registration to login and participation in various servers or chat rooms.

**Model Definition**

The `User` model is defined using Sequelize, a powerful ORM tool for Node.js. It maps to a corresponding `users` table in the MySQL database, with the following fields:

* `username`: A unique identifier for the user, essential for user interaction and display within the application.
* `password`: A hashed representation of the user's password, ensuring security and privacy. The hashing is performed using the `bcrypt` library.
* `email`: The user's email address, serving as an alternative unique identifier and a means of communication outside the platform.
* `profilePicture`: A URL or path pointing to the user's profile image, enhancing personalization and user experience.
* `createdAt`: The timestamp marking the creation of the user account, automatically set to the current time by default.
* `lastLogin`: A timestamp of the user's last login, useful for tracking activity and implementing features like "last seen".

**Associations**

The `User` model is associated with the `Server` model through a many-to-many relationship, facilitated by the `ServerUser` join table. This association allows users to be part of multiple servers, reflecting the diverse and community-driven nature of the chat application.

**Model Methods**

* `comparePassword`: A prototype method that leverages `bcrypt.compare` to validate a given password against the stored hashed password. This method is crucial for secure authentication processes, ensuring that user logins are handled safely and reliably.

**Usage Examples**

**Defining the User Model**

In the Sequelize setup, the `User` model is defined with its fields and constraints. Each field is configured with specific data types and properties, such as `allowNull` and `unique`, to maintain data integrity and enforce rules like unique usernames and emails.

```javascript
const User = sequelize.define('User', {
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  email: DataTypes.STRING,
  profilePicture: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  lastLogin: DataTypes.DATE,
});
```

**Using the comparePassword Method**

The `comparePassword` method is used to compare a plaintext password with the hashed password stored in the database. This is typically used during the login process to authenticate users.

```javascript
User.findOne({ where: { username: 'johnDoe' } })
  .then(user => user.comparePassword('password123'))
  .then(isMatch => console.log('Password match:', isMatch));
```

In this example, a user with the username `johnDoe` is retrieved from the database, and the `comparePassword` method is invoked with a candidate password. The method returns a boolean indicating whether the provided password matches the stored hashed password.
