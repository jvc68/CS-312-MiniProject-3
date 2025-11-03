import './App.css';
import React from 'react';
import Home from "./jsx/home.jsx";
import SignIn from "./jsx/signIn.jsx";
import SignUp from "./jsx/signUp.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Create the app function
function App() {
  // Make each of the routes fpr the various pages
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  )

}
export default App;
