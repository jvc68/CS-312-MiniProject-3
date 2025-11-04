import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
	const [form, setForm] = useState({ user_id: "", password: "" });
	const [message, setMessage] = useState("");
	const navigate = useNavigate();

	//Handles submit
	const handleSubmit = async (e) => {
		e.preventDefault();
		//Send form to api
		try {
			await axios.post("http://localhost:3001/attemptSignIn", form);
			navigate("/");
		} catch (err) {
			setMessage("Something went wrong!");
		}
	};

	return (
		<div>
			<h1 className="title">Sign In</h1>
			<Link to="/signUp">Sign Up</Link> <Link to="/">Home</Link>
			<form onSubmit={handleSubmit} className="addPost">
				<h2>Sign In</h2>

				<label htmlFor="user_id">Username:</label>
				<input type="text" name="user_id" required value={form.user_id}
					onChange={(e) => setForm({ ...form, user_id: e.target.value })} />

				<br />

				<label htmlFor="password">Password:</label>
				<input type="text" name="password" required value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })} />

				<br />

				<button type="submit">Sign In</button>
				<p className="Error"> {message}</p>
			</form>
		</div>
	);
}
