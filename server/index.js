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

app.get("/api/posts/:id", async (req, res) => {
	const { id } = req.params;
	const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
	res.json({ post: result.rows[0] })

});

app.get("/api/currentUser", (req, res) => {
	res.json({ user: currentUser })
});

app.post("/addPost", async (req, res) => {
	//If not signed in, you cannot add a post.
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
	let creator_user_id = currentUser
	posts.push({ blog_id, creator_name, title, body, date_created: new Date().toLocaleString(), creator_user_id });
	res.json({ message: "Added Post Successfully" });
});

app.post("/attemptSignUp", async (req, res) => {
	//Grab user input
	const { name, user_id, password } = req.body;

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

//This one was hard to do.
app.get("/editPost/:index", async (req, res) => {
	//Grab proper post
	const post = posts[req.params.index]
	if (post) {
		//Grab their location in the database
		let blog_id = post.blog_id;

		//Grab the post from the database
		const verifyUser = await db.query(`SELECT * FROM blogs WHERE blog_id = $1`, [blog_id]);

		//If the post was made by the current user of the website, allow them to edit.
		if (verifyUser.rows[0].creator_user_id === currentUser) {
			console.log("Success!")
			res.json({ message: "Yer" })
		} else {
			console.log("Current user != creator_user_id")
			res.status(401).json("No")
		}
	}


});

//Edit page
app.post("/editPost/:index", async (req, res) => {

	console.log(posts);
	console.log(req.params)

	const { creator_name, title, body } = req.body;
	let blog_id = posts[req.params.index].blog_id
	let creator_user_id = currentUser
	posts[req.params.index] = { blog_id, creator_name, title, body, date_created: new Date().toLocaleString(), creator_user_id }

	//Update database in the proper position.
	await db.query(`UPDATE blogs
	SET creator_name = $1, title = $2, body = $3, date_created = $4
	WHERE blog_id = $5`, [creator_name, title, body, new Date().toLocaleString(), blog_id]);

	message = ""
	res.json({ message: "Success!" });
});

app.post("/delete/:index", async (req, res) => {

	const post = posts[req.params.index]
	if (post) {
		let blog_id = post.blog_id;
		const verifyUser = await db.query(`SELECT * FROM blogs WHERE blog_id = $1`, [blog_id]);

		//If the user is the same as the poster, then delete
		console.log("Creator of Post: ", verifyUser.rows[0].creator_user_id, " Current User: ", currentUser)
		if (verifyUser.rows[0].creator_user_id === currentUser) {
			posts.splice(req.params.index, 1);
			message = ""
			res.json({ message: "Success" })
			await db.query(`DELETE FROM blogs WHERE blog_id = $1`, [blog_id])
			//Otherwise refuse.
		} else {
			console.log("Post does not exist!")
			res.status(401).json({ message: "Failure" })
		}

	}

});

// Start the server and log a message
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});