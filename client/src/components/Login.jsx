import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import axios
import "./Login2.css";

function Login() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  function handleChange(e) {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  }

  async function handleLogin() {
    setMessage("");

    const { email, password } = input;
    if (email && password) {
      try {
        console.log("🔹 Data going to backend:", input);

        const res = await axios.post(
          "http://localhost:5000/api/users/login",
          input,
        );

        console.log("✅ Server Response:", res.data);

        // assuming backend sends a token or success flag
        if (res.data.token) {
          setMessage("✅ Login Successful!");

          // ✅ Save token
          localStorage.setItem("token", res.data.token);

          // ✅ Save user also
          localStorage.setItem("user", JSON.stringify(res.data.user));

          setInput({ email: "", password: "" });

          setTimeout(() => {
            navigate("/home");
          }, 1000);
        } else {
          setMessage("❌ Invalid Email or Password");
        }
      } catch (error) {
        console.error("🚨 Login Error:", error);
        setMessage("❌ Server Error or Invalid Credentials");
      }
    } else {
      alert("⚠️ Please fill all fields!");
    }
  }

  return (
    <div className="form-container bg-green-500">
      <h1 className="form-title bg-green-200">Login</h1>

      <div className="form-box bg-green-200">
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={input.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={input.password}
          onChange={handleChange}
        />
        <button onClick={handleLogin}>Login</button>
        <hr />
        <Link to="/">
          <button>New User</button>
        </Link>

        {message && (
          <p
            className={`message ${message.includes("✅") ? "success" : "error"}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
