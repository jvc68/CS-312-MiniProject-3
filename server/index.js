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

app.post("/addPost", async (req, res) => {
	//If not signed in, you cannot add a post.
	console.log("Hey now", currentUser);
	if (currentUser == "") {
		return res.status(401).json({ error: "Not Signed In!" });
	}

	const { creator_name, title, body } = req.body;

	//Here is where proj 1 and proj 3 differ:

	//First find the highest primary key, I use this write to each post where they are index-wise in the db.
	let findPrimaryKey = await db.query(`SELECT MAX(blog_id) FROM blogs`);
	let blog_id = findPrimaryKey.rows[0].max

	//If this is the first post however, then we need to reset the pk count in the db to 1.
	if (blog_id == null) {
		await db.query('ALTER SEQUENCE blogs_blog_id_seq RESTART WITH 1')
	}

	//Insert the user data into database.
	const result = db.query(`
		INSERT INTO blogs (creator_name, title, body, date_created, creator_user_id) 
		VALUES ($1, $2, $3, $4, $5)`,
		[creator_name, title, body, new Date().toLocaleString(), currentUser]);

	//Now that it's been done, we once again read the max pk as we will store it along with the post here in the array as well.
	findPrimaryKey = await db.query(`SELECT MAX(blog_id) FROM blogs`);
	blog_id = findPrimaryKey.rows[0].max
	posts.push({ blog_id, creator_name, title, body, date_created: new Date().toLocaleString() });
	res.json({ message: "Added Post Successfully" });
});

app.post("/attemptSignUp", async (req, res) => {
	//Grab user input
	const { name, user_id, password } = req.body;
	console.log(name, " ", user_id, " ", password);

	//Try to read from database
	try {
		//First we see search for the user id
		const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
			user_id,
		]);

		//If the user id shows up, then this new user cannot be created
		if (result.rows.length > 0) {
			res.status(401).json({ error: "Username already Exists!" });
		} else {
			await db.query(
				"INSERT INTO users VALUES ($1, $2, $3)",
				[user_id, password, name]
			);
			res.json({ message: "Signed Up successfully" });
		}
	} catch (err) {
		console.log(err);
	}
})

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