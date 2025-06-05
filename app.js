if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

 // Load .env variables


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js")
const userRouter=require("./routes/user.js")



const port = 8080;
// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const dbUrl=process.env.MONGO_URL;

const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const wrapAsync = require("./utils/wrapAsync.js");
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
  await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("DB connected"))
  .catch (err => console.log("DB connection error:", err));

// -------------------- Joi Validation --------------------

 const store=MongoStore.create({
   mongoUrl:dbUrl,
     crypto: {
    secret: process.env.SECRET
  },
  touchAfter:24*3600, 
 });

 store.on("error",()=>{
  console.log("Error in Mongo Session Store",err)
 });

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7 days in milliseconds
    httpOnly: true                   // ✅ Helps prevent XSS
  }
}; 




app.use(session(sessionOptions)); // ✅ CORRECT
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user; // ✅ this line makes `currUser` available in all EJS files
  next();
});
 

// -------------------- Routes --------------------
app.get("/", (req, res) => {
  res.redirect("/listings");
});



app.use("/listings",listingsRouter);

app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);















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