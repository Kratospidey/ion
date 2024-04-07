# Message Model

#### Message Model Documentation

**Overview**

The `Message` model is a key component of the chat application, representing the messages exchanged by users within the servers. It captures the essence of communication within the platform, allowing for the exchange of text-based messages that facilitate interaction and collaboration among users.

**Model Definition**

The `Message` model is defined through Sequelize to correspond with a `messages` table in the database, including the following primary attributes:

* `content`: The actual text content of the message, stored as `TEXT` to accommodate messages of varying lengths, from short messages to potentially long code snippets or discussions.
* `createdAt` and `updatedAt`: Sequelize automatically manages these timestamp fields to track the creation and last modification times of each message instance, providing valuable metadata for the application.

**Associations**

To contextualize each message within the application, the `Message` model is associated with both the `User` and `Server` models:

* **BelongsTo User**: This association links each message to its sender, identified by the `userId`. It establishes a foreign key relationship in the `messages` table, embedding the identity of the user who sent the message.
* **BelongsTo Server**: Similarly, each message is associated with the server in which it was sent, indicated by the `serverId`. This relationship embeds the message within a specific chat server, facilitating organized communication channels.

**Usage Example**

**Creating a New Message**

The process of creating a new message involves specifying the content of the message along with the identifiers for the sender and the server where the message is to be posted.

{% code lineNumbers="true" %}
```javascript
Message.create({
  content: 'Hello, world!',
  userId: 1, // ID of the user sending the message
  serverId: 2, // ID of the server where the message is posted
});
```
{% endcode %}

In this example, a new message with the content "Hello, world!" is created. The `userId` is set to 1, indicating the sender, and `serverId` is set to 2, specifying the server in which the message is sent. This operation results in a new entry in the `messages` table that contains the message content along with references to both the sender and the server.
