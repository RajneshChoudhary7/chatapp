import React, { useState } from 'react'
import './Login.css'
import { Link } from 'react-router-dom'
import axios from 'axios';


function Signup() {
  const [data, setData] = useState([])
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: ""
  })

  function handleChange(e) {
    const { name, value } = e.target
    setInput({ ...input, [name]: value })
  }

    async function handleSubmit() {
    const { name, email, password } = input
    if (name && email && password) {
      setData([...data, input])
      setInput({ name: "", email: "", password: "" })

      try{
        console.log("data going to backend:",input)
        const res = await axios.post("http://localhost:5000/api/users/register",input,{

        });
        console.log("server Responce = ",res.data)
      }
      catch(error){
        console.log("error :",error)
      }


    } else {
      alert("⚠️ Please fill all fields!")
    }
  }

  return (
    <div className="form-container bg-green-500">
      <h1 className="form-title">User Registration</h1>

      <div className="form-box bg-green-200 ">
        <input
          type="text"
          name="name"
          value={input.name}
          onChange={handleChange}
          placeholder="Enter Name"
        />
        <input
          type="email"
          name="email"
          value={input.email}
          onChange={handleChange}
          placeholder="Enter Email"
        />
        <input
          type="password"
          name="password"
          value={input.password}
          onChange={handleChange}
          placeholder="Enter Password"
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>

      <hr />

      <Link to="/Login">
        <button>Already registered? Login</button>
      </Link>

      <div className="data-display">
        {data.map((user) => (
          <div key={user.email} className="data-card">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Password:</strong> {'*'.repeat(user.password.length)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Signup
