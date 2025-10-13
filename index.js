//Necessary Set Up
import express from "express";
import bodyParser from "body-parser";

const app = express();

const port = 3000;

//Array to hold posts later
let posts = []

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//Starts the app.
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});

//Homepage
app.get("/", (req, res) => {
	res.render("index.ejs", { posts });
});

//Posting Capabilities
app.post("/addPost", (req, res) => {
	//Receive the bodyparsed stuff in proper format
	const { name, title, content } = req.body;
	//Add to array
	posts.push({ name, title, content, time: new Date().toLocaleString() });
	//reload home page
	res.redirect("/");
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
	res.redirect("/");
});

//Delete post
app.post("/delete/:index", (req, res) => {
	//Delete 1 post at given index.
	posts.splice(req.params.index, 1);
	//Reload home page
	res.redirect("/");
});
