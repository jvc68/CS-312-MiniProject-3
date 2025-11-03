import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


export default function Home() {
	const [posts, setPosts] = useState([]);
	const [user, setUser] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const getPosts = await axios.get("http://localhost:3001/api/posts");
				setPosts(getPosts.data);

				const getCurrentUser = await axios.get("http://localhost:3001/api/currentUser");
				console.log(getCurrentUser.data)
				setUser(getCurrentUser.data)

			} catch (err) {

				console.log("Error, axios didn't get!");
			}
		};

		fetchData();
	}, []);

	return (
		<div>
			<h1 className="title">Daily Blog:</h1>
			<p className="curUser">Current User: {user.user}</p>
			<Link to="/signin">Sign In</Link> <Link to="/signup">Sign Up</Link>



			<form action="/addPost" method="POST" className="addPost">
				<h2>Create Post</h2>

				<label htmlFor="creator_name">Name:</label>
				<input type="text" name="creator_name" placeholder="Your Name" required maxLength="15" />
				<br />

				<label htmlFor="title"> Title:</label>
				<input type="text" name="title" placeholder="Title" required maxLength="30" />
				<br />

				<p>Content: </p>
				<textarea className="postInput" name="body" placeholder="Write about your day!" required maxLength="300"></textarea>
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
