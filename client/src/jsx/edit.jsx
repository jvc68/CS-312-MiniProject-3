import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function SignIn() {
	const { id, index } = useParams();
	const [form, setForm] = useState({ creator_name: "", title: "", body: "" })
	const [error, setError] = useState("");

	const navigate = useNavigate();

	const fetchData = async () => {
		try {
			const getPosts = await axios.get(`http://localhost:3001/api/posts/${id}`, { withCredentials: true })
			setForm(getPosts.data.post);
		} catch (err) {
			console.log("Error, axios didn't get!");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios.post(`http://localhost:3001/editPost/${index}`, form);
			navigate("/");
		} catch (err) {
			setError("Something went wrong!");
		}
	};

	useEffect(() => {

		fetchData();
	}, []);

	return (
		<div>
			<form onSubmit={handleSubmit} className="addPost">
				<h2>Edit Post</h2>

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
		</div>
	);
}
