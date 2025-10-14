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

let posts = []
let message = ""
let currentUser = ""


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
	res.render("index.ejs", { posts, currentUser, message });
});

app.get("/signUp", (req, res) => {
	message = ""
	res.render("signUp.ejs", { message });
});

app.get("/signIn", (req, res) => {
	message = ""
	res.render("signIn.ejs", { message });
});

app.post("/attemptSignUp", async (req, res) => {
	const { name, user_id, password } = req.body;

	try {
		const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
			user_id,
		]);

		if (result.rows.length > 0) {
			message = "User Id already exists"
			res.render("signUp.ejs", { message });
		} else {
			const insertion = await db.query(
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


app.post("/attemptSignIn", async (req, res) => {
	const { user_id, password } = req.body;
	try {
		const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
			user_id,
		]);

		if (result.rows.length > 0) {
			if (result.rows[0].password == password) {
				currentUser = user_id
				message = ""
				res.render("index.ejs", { posts, currentUser, message })
			} else {
				message = "Password is wrong";
				res.render("signIn.ejs", { message })
			}
		} else {
			message = "User doesn't exist"
			res.render("signIn.ejs", { message })
		}

	} catch (err) {
		console.log(err);
	}


})

app.post("/addPost", async (req, res) => {
	if (currentUser == "") {
		message = "Not signed in!"
		res.render("index.ejs", { posts, currentUser, message })
		return
	}

	const { creator_name, title, body } = req.body;

	let findPrimaryKey = await db.query(`SELECT MAX(blog_id) FROM blogs`);
	let blog_id = findPrimaryKey.rows[0].max
	if (blog_id == null) {
		await db.query('ALTER SEQUENCE blogs_blog_id_seq RESTART WITH 1')
	}
	const result = db.query(`
		INSERT INTO blogs (creator_name, title, body, date_created, creator_user_id) 
		VALUES ($1, $2, $3, $4, $5)`,
		[creator_name, title, body, new Date().toLocaleString(), currentUser]);

	findPrimaryKey = await db.query(`SELECT MAX(blog_id) FROM blogs`);
	blog_id = findPrimaryKey.rows[0].max
	posts.push({ blog_id, creator_name, title, body, date_created: new Date().toLocaleString() });
	message = ""
	res.redirect("/index");
});


app.get("/editPost/:index", async (req, res) => {
	const post = posts[req.params.index]
	let blog_id = post.blog_id;

	const verifyUser = await db.query(`SELECT * FROM blogs WHERE blog_id = $1`, [blog_id]);

	if (verifyUser.rows[0].creator_user_id === currentUser) {
		res.render("editPost.ejs", { post, index: req.params.index })
	} else {
		message = "Not yours"
		res.redirect("/")
	}

});

app.post("/editPost/:index", async (req, res) => {
	const { creator_name, title, body } = req.body;
	let blog_id = posts[req.params.index].blog_id
	posts[req.params.index] = { blog_id, creator_name, title, body, date_created: new Date().toLocaleString() }

	await db.query(`UPDATE blogs
	SET creator_name = $1, title = $2, body = $3, date_created = $4
	WHERE blog_id = $5`, [creator_name, title, body, new Date().toLocaleString(), blog_id]);

	message = ""
	res.redirect("/index");
});

app.post("/delete/:index", async (req, res) => {

	const post = posts[req.params.index]
	let blog_id = post.blog_id;
	const verifyUser = await db.query(`SELECT * FROM blogs WHERE blog_id = $1`, [blog_id]);

	if (verifyUser.rows[0].creator_user_id === currentUser) {
		posts.splice(req.params.index, 1);
		message = ""
		res.redirect("/index");
		await db.query(`DELETE FROM blogs WHERE blog_id = $1`, [blog_id])

	} else {
		message = "Not yours"
		res.redirect("/")
	}

});
