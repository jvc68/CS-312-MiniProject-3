//Necessary Set Up
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//Set up the Database
const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "Blog",
	password: "lucy1918",
	port: 5432,
});

db.connect();

const port = 3000;

//Necessary global variables
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


//Starts the app.
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});

//Homepage
app.get("/", (req, res) => {
	res.redirect("/index")
});

//Homepage again, for ease of access.
app.get("/index", (req, res) => {
	res.render("index.ejs", { posts, currentUser, message });
});

//Sign Up
app.get("/signUp", (req, res) => {
	message = ""
	res.render("signUp.ejs", { message });
});

//Sign In
app.get("/signIn", (req, res) => {
	message = ""
	res.render("signIn.ejs", { message });
});

//Attempts to sign the user up
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
			message = "User Id already exists"
			res.render("signUp.ejs", { message });
		} else {
			//Otherwise insert new user into the users table.
			await db.query(
				"INSERT INTO users VALUES ($1, $2, $3)",
				[user_id, password, name]
			);
			message = ""
			res.render("signIn.ejs", { message });
		}
	} catch (err) {
		console.log(err);
	}
})

//Attempts to sign the user in
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
				message = ""
				res.render("index.ejs", { posts, currentUser, message })
			} else {
				message = "Password is wrong";
				res.render("signIn.ejs", { message })
			}
			//Otherwise, let user know
		} else {
			message = "User doesn't exist"
			res.render("signIn.ejs", { message })
		}

	} catch (err) {
		console.log(err);
	}


})

//Add post
app.post("/addPost", async (req, res) => {
	//If not signed in, you cannot add a post.
	if (currentUser == "") {
		message = "Not signed in!"
		res.render("index.ejs", { posts, currentUser, message })
		return
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
	message = ""
	res.redirect("/index");
});


//This one was hard to do.
app.get("/editPost/:index", async (req, res) => {
	//Grab proper post
	const post = posts[req.params.index]
	//Grab their location in the database
	let blog_id = post.blog_id;

	//Grab the post from the database
	const verifyUser = await db.query(`SELECT * FROM blogs WHERE blog_id = $1`, [blog_id]);

	//If the post was made by the current user of the website, allow them to edit.
	if (verifyUser.rows[0].creator_user_id === currentUser) {
		res.render("editPost.ejs", { post, index: req.params.index })
	} else {
		//Otherwise tell them no.
		message = "Not yours"
		res.redirect("/")
	}

});

//Edit page
app.post("/editPost/:index", async (req, res) => {
	//Here is where the user data is sent after we allow them to edit.
	const { creator_name, title, body } = req.body;
	let blog_id = posts[req.params.index].blog_id
	posts[req.params.index] = { blog_id, creator_name, title, body, date_created: new Date().toLocaleString() }

	//Update database in the proper position.
	await db.query(`UPDATE blogs
	SET creator_name = $1, title = $2, body = $3, date_created = $4
	WHERE blog_id = $5`, [creator_name, title, body, new Date().toLocaleString(), blog_id]);

	message = ""
	res.redirect("/index");
});

//This was way easier
app.post("/delete/:index", async (req, res) => {

	//Same concept, grab proper post from the db
	const post = posts[req.params.index]
	let blog_id = post.blog_id;
	const verifyUser = await db.query(`SELECT * FROM blogs WHERE blog_id = $1`, [blog_id]);

	//If the user is the same as the poster, then delete
	if (verifyUser.rows[0].creator_user_id === currentUser) {
		posts.splice(req.params.index, 1);
		message = ""
		res.redirect("/index");
		await db.query(`DELETE FROM blogs WHERE blog_id = $1`, [blog_id])
		//Otherwise refuse.
	} else {
		message = "Not yours"
		res.redirect("/")
	}

});
