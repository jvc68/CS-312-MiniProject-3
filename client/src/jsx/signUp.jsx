import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {

	const [form, setForm] = useState({ name: "", user_id: "", password: "" });
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axios.post("http://localhost:3001/attemptSignUp", form, { withCredentials: true });
			navigate("/signIn");
		} catch (err) {
			setError("Something went wrong!");
		}
	};

	return (
		<div>
			<h1 className="title">Sign Up</h1>
			<Link to="/signIn">Sign In</Link> <Link to="/">Home</Link>
			<hr />
			<form onSubmit={handleSubmit} className="addPost">
				<h2>Sign Up</h2>

				<label htmlFor="name">Name:</label>
				<input type="text" name="name" placeholder="Your Name" required maxLength="15"
					value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })} />
				<br />

				<label htmlFor="user_id">Username:</label>
				<input type="text" name="user_id" required maxLength="30"
					value={form.user_id}
					onChange={(e) => setForm({ ...form, user_id: e.target.value })} />
				<br />

				<label htmlFor="password">Password:</label>
				<input type="text" name="password" required maxLength="12"
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })} />
				<br />
				<button type="submit">Sign Up</button>
				<p className="Error">{error}</p>
			</form>
		</div>

	)
}