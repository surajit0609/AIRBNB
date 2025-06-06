if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// -------------------- Imports --------------------
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const User = require("./models/user.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const wrapAsync = require("./utils/wrapAsync.js");

// -------------------- Config --------------------
const port = process.env.PORT || 3000; // Use dynamic port on Render
const dbUrl = process.env.MONGO_URL;
const secret = process.env.SECRET || "thisshouldbeabettersecret";

// -------------------- Database Connection --------------------
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("DB connected"))
  .catch(err => console.log("DB connection error:", err));

// -------------------- Session Store --------------------
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret },
  touchAfter: 24 * 3600
});

store.on("error", err => {
  console.log("Session Store Error:", err);
});

const sessionOptions = {
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

// -------------------- View Engine --------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- Middleware --------------------
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());

// -------------------- HTTPS Redirect (for Render) --------------------
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// -------------------- Passport Config --------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- Flash + Current User Middleware --------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// -------------------- Routes --------------------
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// -------------------- 404 Handler --------------------
// app.all("*", (req, res) => {
//   res.status(404).render("error", { message: "Page Not Found" });
// });

// -------------------- Error Handler --------------------
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).render("error", { message });
});

// -------------------- Start Server --------------------
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
