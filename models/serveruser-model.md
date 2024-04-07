# ServerUser Model

#### ServerUser Join Model Documentation

**Overview**

The `ServerUser` model is a join table in Sequelize that establishes a many-to-many relationship between the `User` and `Server` models within the chat application. This model is pivotal for managing the associations between users and servers, enabling users to participate in multiple chat servers and servers to host multiple users.

**Model Definition**

Defined using Sequelize, the `ServerUser` join model does not directly correspond to a user-facing feature but is crucial for the relational structure of the database. The model includes an auto-incrementing primary key `id`, ensuring each association between a user and a server is uniquely identifiable. To maintain data integrity and prevent duplicate entries, a unique constraint is enforced on the combination of `serverId` and `userId`.

**Associations**

The `ServerUser` model explicitly defines its relationships with both the `User` and `Server` models:

* **BelongsTo User**: This association indicates that each `ServerUser` entry is linked to a specific user, represented by the `userId`.
* **BelongsTo Server**: Similarly, each `ServerUser` entry is associated with a specific server, identified by the `serverId`.

The `onDelete: "CASCADE"` option is set for both associations, ensuring that if a user or server is deleted, all related `ServerUser` entries are automatically removed, preserving the database's referential integrity.

**Usage Example**

**Associating a User with a Server**

When a user joins a server or a server adds a new member, a new `ServerUser` entry is created, linking the user to the server. This process is central to managing server memberships within the application.

{% code lineNumbers="true" %}
```javascript
ServerUser.create({
  userId: 1, // The ID of the user joining the server
  serverId: 2, // The ID of the server being joined
});
```
{% endcode %}

In this example, a user with an `id` of 1 is associated with a server with an `id` of 2. The `create` method facilitates this association, adding a new entry to the `server_users` table that links the user to the server.
