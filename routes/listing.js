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
  const listing = await Listing.findById(id).populate("reviews"); // ✅ POPULATE reviews

  res.render("listing/show", { listing });
}));

router.post("/listings", validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

router.get('/:id/edit', wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
 
  res.render('listing/edit', { listing });
}));

router.put("/:id",  wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));
router.delete('/:id',  wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect('/listings');
}));

module.exports=router