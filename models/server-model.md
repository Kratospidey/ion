# Server Model

#### Server Model Documentation

**Overview**

The `Server` model is a fundamental component of the chat application, encapsulating the concept of chat servers or rooms where users can interact. These servers act as distinct spaces within the application, each with its own members, conversations, and potentially unique settings or features. The model facilitates the creation, management, and participation of users in these servers, mirroring the collaborative and community-centric nature of the application.

**Model Definition**

The `Server` model, defined through Sequelize, corresponds to a `servers` table in the database and includes the following key fields:

* `name`: The name of the server, visible to all its members and serving as the primary identifier of the server within the application.
* `profilePicture`: A URL or path to an image representing the server, enhancing its visual identification and user experience.
* `filePaths`: An optional JSON field that can store various file paths related to the server, such as documents, images, or other media, facilitating resource sharing and management within the server.
* `serverCode`: A unique code for the server, generated using the `nanoid` library, which can be used for invitation or access control mechanisms.
* `ownerId`: A foreign key linking to the `User` model, identifying the user who owns or administrates the server.

**Associations**

The `Server` model is associated with the `User` model in two significant ways:

1. **Many-to-Many Relationship through ServerUser**: This association allows users to join multiple servers and servers to have multiple members, enabling the dynamic and interconnected nature of community participation.
2. **One-to-Many Relationship with Users as Owners**: Each server has a single owner, but a user can own multiple servers. This relationship is crucial for server management and governance.

**Model Methods**

* `addUser`: This instance method provides the functionality to add a user to the server, ensuring that users are not added more than once. It leverages the `ServerUser` model to manage the many-to-many relationship between users and servers, encapsulating the logic required to maintain the integrity of server memberships.

**Usage Examples**

**Defining the Server Model**

When setting up Sequelize within the application, the `Server` model is defined with its respective fields and configurations, aligning with the database schema and application requirements.

```javascript
const Server = sequelize.define('Server', {
  name: DataTypes.STRING,
  profilePicture: DataTypes.STRING,
  filePaths: DataTypes.JSON,
  serverCode: DataTypes.STRING,
  ownerId: DataTypes.INTEGER,
});
```

**Using the addUser Method**

The `addUser` method facilitates adding a new member to a server, ensuring that the user is not already a member of the server. This method is particularly useful when managing server memberships through the application's UI or API endpoints.

```javascript
Server.findOne({ where: { name: 'Study Lounge' } })
  .then(server => server.addUser(1)) // Assuming '1' is the userId
  .then(serverUser => console.log(`Added user to server: ${serverUser}`))
  .catch(error => console.error(error));
```

In this example, a server named `Study Lounge` is queried, and a user with `userId` 1 is added to it. The method internally checks for existing membership before adding the user, ensuring no duplicate memberships.
