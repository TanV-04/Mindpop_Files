import express from "express";
const app = express();
import cors from "cors";

// middleware to allow cross-origin requests
app.use(cors());
app.use(express.json());

// SIGN IN
app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  console.log(
    `received login attempt from user: ${email}, password: ${password}`
  );

  // check if the email already exists in the database
  try {
    const check = await collection.findOne({ email: email });
    if (check) {
      res.json("exists");
    } else {
      res.json("notexists");
    }
  } catch (e) {
    res.json("notexists");
  }

  // validate the credentials against database
  // if (email === "Test" || password === "password") {
  //   return res.status(200).json({ message: "login successful" });
  // } else {
  //   return res.status(401).json({ message: "invalid credentials" });
  // }
});


// SIGN UP
app.post("/sign-up", async (req, res) => {
  const { username, email, password } = req.body;
  const data = {
    email: email,
    password: password
  }

  // check if the email already exists in the database
  try {
    const check = await collection.findOne({ email: email });
    if (check) {
      res.json("exists");
    } else {
      res.json("does not exist");
      await collection.insertMany([data]) // insert into the collection
    }
  } catch (e) {
    res.json("does not exists");
  }

  // validate the credentials against database
  // if (email === "Test" || password === "password") {
  //   return res.status(200).json({ message: "login successful" });
  // } else {
  //   return res.status(401).json({ message: "invalid credentials" });
  // }
});

// start the server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});


// nodemon server.js