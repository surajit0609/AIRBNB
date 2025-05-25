const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require('./models/listing.js');
const path = require("path");
const methodOverride = require("method-override");
app.use(express.static('public'));


 // For PUT and DELETE
 const ejsMate=require("ejs-mate");
 app.engine('ejs',ejsMate );
const port = 8080;
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.get('/listings', async (req, res) => {
  const allListing = await Listing.find({});
  res.render('listing/index', { allListing }); // ✅ use 'listings'
});

app.get("/listings/new", (req, res) => {
  res.render("listing/new"); // ✅ use 'listings'
});

app.get('/listings/:id', async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listing/show", { listing }); // ✅ use 'listings'
});

app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

app.get('/listings/:id/edit', async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render('listing/edit', { listing }); // ✅ use 'listings'
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
app.put("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});
app.delete('/listings/:id', async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect('/listings'); // Redirect to listings page after deletion
});





// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});