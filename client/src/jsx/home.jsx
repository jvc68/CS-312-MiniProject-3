import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


export default function Home() {
	const [newLog, setLog] = useState("2");

	useEffect(() => {
		console.log("Before anything, newlog is ", newLog)
		const fetchData = async () => {
			try {
				const res = await axios.get("http://localhost:3001/api");
				setLog(res.data.post);
				console.log("Hey newlog is now: ", newLog);
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
			<Link to="/signin">Sign In</Link>  <Link to="/signup">Sign Up</Link>
		</div>
	);
}
