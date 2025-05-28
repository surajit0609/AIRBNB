const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const { listingSchema, reviewSchema } = require("./Schema.js");

const Review = require("./models/review.js");
const Listing = require('./models/listing.js');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require("./utils/ExpressError.js");
const ejsMate = require("ejs-mate");

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
  .catch(err => console.log("DB connection error:", err));

// -------------------- Joi Validation --------------------
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


// -------------------- Routes --------------------
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.get('/listings', async (req, res) => {
  const allListing = await Listing.find({});
  res.render('listing/index', { allListing });
});

app.get("/listings/new", (req, res) => {
  res.render("listing/new");
});

app.get('/listings/:id', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews"); // ✅ POPULATE reviews

  res.render("listing/show", { listing });
}));

app.post("/listings", validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
 
  res.render('listing/edit', { listing });
}));

app.put("/listings/:id",  wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

app.delete('/listings/:id',  wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect('/listings');
}));

// -------------------- Reviews POST Route --------------------
app.post("/listings/:id/reviews",validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const reviewData = req.body.review;
  
  const newReview = new Review(reviewData);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`); // ✅ Redirect to show page
}));

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