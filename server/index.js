// Import all needed packages
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";

const app = express();
// Set the port to host the backend on
const port = 3001;

// Setup Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "Blog",
	password: "lucy1918",
	port: 5432,
});


db.connect();

app.use(cors({
	origin: "http://localhost:3000",
	credentials: true
}));


let posts = []
let message = ""
let currentUser = ""

//Loads the database into the posts array
db.query(`SELECT * FROM blogs`, (err, res) => {
	if (err) {
		console.error(err.stack);
	} else {
		posts = res.rows;
	}
});



app.get("/api/posts", (req, res) => {
	res.json(posts)

});


// Start the server and log a message
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});