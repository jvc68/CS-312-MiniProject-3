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

app.get("/api/currentUser", (req, res) => {
	res.json({ user: currentUser })
});

app.post("/attemptSignIn", async (req, res) => {
	const { user_id, password } = req.body;
	console.log("Credentials:")
	console.log("user_id: ", user_id)
	console.log("password: ", password)
	try {
		//Search for user id
		const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
			user_id,
		]);

		//If it does exist, send them to the home page.
		if (result.rows.length > 0) {
			//Ensure the password is correct.
			if (result.rows[0].password == password) {
				currentUser = user_id
				res.json({ message: "Signed in successfully" });
			} else {
				return res.status(401).json({ error: "Password is Wrong." });
			}
			//Otherwise, let user know
		} else {
			res.status(401).json({ error: "Username is Wrong!" });
		}

	} catch (err) {
		res.status(500).json({ error: "Error signing in." });
	}


})


// Start the server and log a message
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});