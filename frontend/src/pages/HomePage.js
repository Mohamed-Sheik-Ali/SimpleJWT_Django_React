import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const HomePage = () => {
  let [notes, setNotes] = useState([]);
  let { authTokens, logoutUser } = useContext(AuthContext);
  useEffect(() => {
    getNotes();
  }, []);

  let getNotes = async () => {
    let data = await axios.get("http://127.0.0.1:8000/api/notes/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    });
    if (data.status === 200) {
      setNotes(data.data);
    } else if (data.statusText === "Unauthorized") {
      logoutUser();
    }
  };
  return (
    <div>
      <p>You are logged in</p>
      <ul>
        {notes.map((note, index) => (
          <li key={index}>{note.body}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
