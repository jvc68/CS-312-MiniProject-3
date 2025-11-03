import { useState, useEffect } from "react";
import axios from "axios";

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
			<h1>I {newLog} hate React and Node Coupling</h1>
			<p>Cus its hard and I don't yet</p>
		</div>
	);
}
