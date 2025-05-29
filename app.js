const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listings=require("./routes/listing.js");
const Reviews=require("./routes/review.js")
const port = 8080;
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

// -------------------- View Engine --------------------
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -------------------- Middleware --------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// -------------------- Database --------------------
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => console.log("DB connected"))
  .catch (err => console.log("DB connection error:", err));

// -------------------- Joi Validation --------------------





// -------------------- Routes --------------------
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use("/listings",Listings);

app.use("/listings/:id/reviews",Reviews);











// -------------------- Reviews POST Route --------------------


// Delete Review Route


// -------------------- Error Handler --------------------
app.use((err, req, res, next) => {
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).render("error.ejs", { message });
});

// -------------------- Start Server --------------------
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});