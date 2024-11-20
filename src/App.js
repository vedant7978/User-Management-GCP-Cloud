import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [errors, setErrors] = useState({});

  // Handle image input
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Convert image to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!email || !/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Valid email is required";
    if (!image) newErrors.image = "Image upload is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create user
  const createUser = async () => {
    if (!validateForm()) return;

    const imageBase64 = await convertToBase64(image);
    const response = await fetch(
      "https://us-central1-csci-5410-serverless-442216.cloudfunctions.net/create_user",
      {
        method: "POST",
        body: JSON.stringify({ name, email, image: imageBase64 }),
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await response.json();
    console.log(data);
    setMessage(`User created successfully!`);
    fetchAllUsers();
  };

  // Pre-fill the form when updating user
  const handleEditClick = (user) => {
    setEditUserId(user.UserID);
    setEditName(user.Name);
    setEditEmail(user.Email);
  };

  // Update user based on the passed userId
  const updateUser = async (userId) => {
    const response = await fetch(
      "https://us-central1-csci-5410-serverless-442216.cloudfunctions.net/update_user",
      {
        method: "PUT",
        body: JSON.stringify({ userId, name: editName, email: editEmail }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    setMessage(data.message);
    setEditUserId(null);
    fetchAllUsers();
  };

  // Delete user with confirmation
  const deleteUser = async (userId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmation) return; // If the user cancels, stop the delete action

    const response = await fetch(
      "https://us-central1-csci-5410-serverless-442216.cloudfunctions.net/delete_user",
      {
        method: "DELETE",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    setMessage(data.message);
    fetchAllUsers();
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(
        "https://us-central1-csci-5410-serverless-442216.cloudfunctions.net/get_user"
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Fetched Data:", data);
  
      // Directly use the `users` array from the response
      if (data.users && data.users.length > 0) {
        setUsers(data.users);
        setMessage(""); // Clear any previous error messages
      } else {
        setMessage("No users found.");
        setUsers([]); 
      }
    } catch (error) {
      console.error("Error fetching users:", error.message);
      setMessage("Error fetching users.");
      setUsers([]); 
    }
  };
  
  

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">User Management System</h1>
      <div className="card p-4 mb-4">
        <div className="form-group mb-3">
          <label>Name</label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="Enter Name"
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="form-group mb-3">
          <label>Email</label>
          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="Enter Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        <div className="form-group mb-3">
          <label>Upload Image</label>
          <input
            type="file"
            className={`form-control ${errors.image ? "is-invalid" : ""}`}
            onChange={handleImageChange}
          />
          {errors.image && (
            <div className="invalid-feedback">{errors.image}</div>
          )}
        </div>

        <button className="btn btn-primary" onClick={createUser}>
          Create User
        </button>
      </div>

      <h3 className="text-success">{message}</h3>

      <h2 className="mb-4">All Users</h2>
      <div className="row">
        {users.map((user) => (
          <div className="col-md-4 mb-3" key={user.UserID}>
            <div className="card">
              <img
                src={user.ImageURL}
                className="card-img-top img-fluid"
                alt={user.Name}
                style={{
                  width: "450px",
                  height: "300px",
                  objectFit: "cover",
                  margin: "0 auto",
                }}
              />
              <div className="card-body">
                <h5 className="card-title">{user.Name}</h5>
                <p className="card-text">{user.Email}</p>
                <p className="card-text">
                  <small className="text-muted">ID: {user.UserID}</small>
                </p>

                {editUserId === user.UserID ? (
                  <>
                    <input
                      type="text"
                      placeholder="New Name"
                      className="form-control mb-2"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="New Email"
                      className="form-control mb-2"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                    <button
                      className="btn btn-success"
                      onClick={() => updateUser(user.UserID)}
                    >
                      Confirm Update
                    </button>
                  </>
                ) : (
                  <div className="d-flex">
                    {" "}
                    {/* Flexbox for horizontal alignment */}
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEditClick(user)}
                    >
                      Update User
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteUser(user.UserID)}
                    >
                      Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
