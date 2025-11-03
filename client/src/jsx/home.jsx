import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


export default function Home() {
	const [posts, setPosts] = useState([]);
	const [user, setUser] = useState("");
	const [form, setForm] = useState({ creator_name: "", title: "", body: "" })
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const fetchData = async () => {
		try {
			const getPosts = await axios.get("http://localhost:3001/api/posts");
			setPosts(getPosts.data);

			const getCurrentUser = await axios.get("http://localhost:3001/api/currentUser");
			setUser(getCurrentUser.data)

		} catch (err) {

			console.log("Error, axios didn't get!");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios.post("http://localhost:3001/addPost", form, { withCredentials: true });
			fetchData();
			setForm({ creator_name: "", title: "", body: "" });
		} catch (err) {
			console.log("B")
			setError("Something went wrong!");
		}
	};

	useEffect(() => {

		fetchData();
	}, []);

	return (
		<div>
			<h1 className="title">Daily Blog:</h1>
			<p className="curUser">Current User: {user.user}</p>
			<Link to="/signin">Sign In</Link> <Link to="/signup">Sign Up</Link>



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
				<p className="Error"></p>
			</form>



			<div className="postArea">
				{posts.map((post, index) =>
					<div className="post">

						<h2>{post.title}</h2>
						<p>by: {post.creator_name}</p>

						<hr />

						<p>{post.body}</p>
						<p className="time">Posted on: {post.date_created}</p>


						<form className="options" action={`/editPost/${index}`} method="GET">
							<button type="submit" className="btn-edit">Edit</button>
						</form>

						<form className="options" action={`/delete/${index}`} method="POST">
							<button type="submit" className="btn-delete">Delete</button>
						</form>

					</div>
				)}
			</div>

		</div>
	);
}
