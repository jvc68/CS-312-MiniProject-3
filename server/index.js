// Import all needed packages
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
// Set the port to host the backend on
const port = 3001;

// Setup Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cors({
	origin: "http://localhost:3000",
	credentials: true
}));

// Create routes for the post modifications and user management
app.get("/api", (req, res) => {
	res.json({ post: "Okay" })

});

// Start the server and log a message
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});