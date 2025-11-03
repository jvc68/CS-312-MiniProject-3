// Import all needed packages
import express from "express";
import bodyParser from "body-parser";

const app = express();
// Set the port to host the backend on
const port = 3000;

// Setup Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Create routes for the post modifications and user management
app.use("/api/posts", postsRouter);
app.use("/api", authRouter);

// Start the server and log a message
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});