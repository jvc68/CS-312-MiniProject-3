//Necessary Set Up
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "Blog",
	password: "lucy1918",
	port: 5432,
});

db.connect();

const port = 3000;
//Array to hold posts later
let posts = []
let exists = false
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

app.get("/index", (req, res) => {
	res.render("index.ejs", { posts });
});

app.get("/signUp", (req, res) => {
	res.render("signUp.ejs", { exists });
});

app.get("/signIn", (req, res) => {
	res.render("signIn.ejs", { exists });
});

app.post("/attemptSignUp", async (req, res) => {
	//Receive the bodyparsed stuff in proper format
	const { name, user_id, password } = req.body;

	try {
		const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
			user_id,
		]);

		if (result.rows.length > 0) {
			let exists = true
			res.render("signUp.ejs", { exists });
		} else {
			const insertion = await db.query(
				"INSERT INTO users VALUES ($1, $2, $3)",
				[user_id, password, name]
			);
			console.log(result);
			res.render("index.ejs", { posts });
		}
	} catch (err) {
		console.log(err);
	}
})


//Posting Capabilities
app.post("/addPost", (req, res) => {
	//Receive the bodyparsed stuff in proper format
	const { creator_name, title, body, } = req.body;

	const result = db.query(`
		INSERT INTO blogs (creator_name, title, body, date_created, creator_user_id) 
		VALUES ($1, $2, $3, $4, $5)`,
		[creator_name, title, body, new Date().toLocaleString(), 1]);

	//Add to array
	posts.push({ creator_name, title, body, date_created: new Date().toLocaleString() });
	//reload home page
	res.redirect("/index");
});


//Grabbing the post to edit,
app.get("/editPost/:index", (req, res) => {
	const post = posts[req.params.index]
	//Rendering the edit post page
	res.render("editPost.ejs", { post, index: req.params.index })
});

//Posting the edited post
app.post("/editPost/:index", (req, res) => {
	//Receive body
	const { name, title, content } = req.body;
	//Set post at index to body.
	posts[req.params.index] = { name, title, content, time: new Date().toLocaleString() }
	//Reload home page
	res.redirect("/index");
});

//Delete post
app.post("/delete/:index", (req, res) => {
	//Delete 1 post at given index.
	posts.splice(req.params.index, 1);
	//Reload home page
	res.redirect("/index");
});
