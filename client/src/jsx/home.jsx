import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


export default function Home() {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get("http://localhost:3001/api/posts");

				setPosts(res.data);
				console.log(res.data);
			} catch (err) {
				console.log("Error, axios didn't get!");
			}
		};

		fetchData();
	}, []);

	return (
		<div>
			<h1 className="title">Daily Blog:</h1>
			<p className="curUser">Current User:</p>
			<Link to="/signin">Sign In</Link> <Link to="/signup">Sign Up</Link>

			<div className="postArea">
				{posts.map((post, index) =>
					<div className="post">

						<h2>{post.title}</h2>
						<p>by: {post.creator_name}</p>

						<hr />

						<p>{post.body}</p>
						<p className="time">Posted on: {post.date_created}</p>


						<form class="options" action="/editPost/<%= index %>" method="GET">
							<button type="submit" class="btn-edit">Edit</button>
						</form>

						<form class="options" action="/delete/<%= index %>" method="POST">
							<button type="submit" class="btn-delete">Delete</button>
						</form>

					</div>
				)}
			</div>

		</div>
	);
}
