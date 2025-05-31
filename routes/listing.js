const express =require("express");
const router=express.Router();

const wrapAsync = require('../utils/wrapAsync');
const { listingSchema, reviewSchema } = require("../Schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require('../models/listing.js');


const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

router.get('/', async (req, res) => { 
  const allListing = await Listing.find({});
 
  res.render('listing/index', { allListing });
});


router.get("/new", (req, res) => {
  res.render("listing/new");
});

router.get('/:id', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");  // ✅ Add return here
  }

  res.render("listing/show", { listing });
}));


router.post("/", validateListing, wrapAsync(async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
}));



router.get('/:id/edit', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
    if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");  // ✅ Add return here
  }
  res.render('listing/edit', { listing });
}));

router.put("/:id",  wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", " Listing Update");
  res.redirect(`/listings/${id}`);
}));
router.delete('/:id',  wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success","Listing Deleted")
  res.redirect('/listings');
}));

module.exports=router