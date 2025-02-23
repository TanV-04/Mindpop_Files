import mongoose from "mongoose";
mongoose
  .connect("mongodb://localhost:27017/Mindpop")
  .then(() => {
    console.log("mongoDB connected");
  })
  .catch(() => {
    console.log("failed");
  });

// create a schema
const newSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// create a collection
const collection = mongoose.model("collection", newSchema);

module.exports = collection;
