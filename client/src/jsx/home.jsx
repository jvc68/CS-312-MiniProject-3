import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


export default function Home() {
	const [posts, setPosts] = useState([]);
	const [user, setUser] = useState("");
	const [form, setForm] = useState({ creator_name: "", title: "", body: "" })
	const [error, setError] = useState("");
	const navigate = useNavigate();

	//Grab posts and current user
	const fetchData = async () => {
		try {
			const getPosts = await axios.get("http://localhost:3001/api/posts");
			setPosts(getPosts.data);

			const getCurrentUser = await axios.get("http://localhost:3001/api/currentUser");
			setUser(getCurrentUser.data.user)
			setError("")

		} catch (err) {
			console.log("Error, axios didn't get!");
		}
	};

	//Handles adding a post
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			//Sends our form to my API, which handles the mess
			await axios.post("http://localhost:3001/addPost", form, { withCredentials: true });
			fetchData();
			setForm({ creator_name: "", title: "", body: "" });
			setError("")
		} catch (err) {
			setError("Something went wrong!");
		}
	};
	//Handles editing a post, 
	const editPost = async (id) => {
		//Ensure the current user can only edit their posts
		if (posts[id].creator_user_id === user) {
			let blog_id = posts[id].blog_id;
			navigate(`/edit/${blog_id}/${id}`)
		} else {
			setError("Not Yours")
		}

	}

	//Handles delting post
	const deletePost = async (id) => {
		try {
			await axios.post(`http://localhost:3001/delete/${id}`, {}, {
				withCredentials: true,
			});
			// Reload Posts
			fetchData();
			setError("")
		} catch (err) {
			setError("Not Your Post")
			console.error(err);
		}
	};

	useEffect(() => {

		fetchData();
	}, []);

	return (
		<div>
			<h1 className="title">Daily Blog:</h1>
			<p className="curUser">Current User: {user}</p>
			<Link to="/signin">Sign In</Link> <Link to="/signup">Sign Up</Link>
			<hr></hr>

			<form onSubmit={handleSubmit} className="addPost">
				<h2>Create Post</h2>

				<label htmlFor="creator_name">Name:</label>
				<input type="text" name="creator_name" placeholder="Your Name" required maxLength="15" value={form.creator_name}
					onChange={(e) => setForm({ ...form, creator_name: e.target.value })} />
				<br />

				<label htmlFor="title"> Title:</label>
				<input type="text" name="title" placeholder="Title" required maxLength="30" value={form.title}
					onChange={(e) => setForm({ ...form, title: e.target.value })} />
				<br />

				<p>Content: </p>
				<textarea className="postInput" name="body" placeholder="Write about your day!" required maxLength="300" value={form.body}
					onChange={(e) => setForm({ ...form, body: e.target.value })} ></textarea>
				<br />

				<button type="submit">Add Post</button>
				<p className="Error">{error}</p>
			</form>



			<div className="postArea">
				{posts.map((post, index) =>
					<div className="post">

						<h2>{post.title}</h2>
						<p>by: {post.creator_name}</p>

						<hr />

						<p>{post.body}</p>
						<p className="time">Posted on: {post.date_created.toLocaleString()}</p>

						<button onClick={() => editPost(index)}>
							Edit
						</button>

						<button onClick={() => deletePost(index)}>
							Delete
						</button>

					</div>
				)}
			</div>

		</div >
	);
}
