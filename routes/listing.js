const express =require("express");
const router=express.Router();

const wrapAsync = require('../utils/wrapAsync');


const{isLoggedIn, isOwner,validateListing}=require("../middleware.js");
const ListingController=require("../controllers/listings.js")
const multer  = require('multer')

const{storage}=require("../cloudernar.js")
const upload = multer({storage })

router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(ListingController.CreateListing)
  );


router.get("/new",isLoggedIn,ListingController.renderNewForm );

router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(isLoggedIn, isOwner, wrapAsync(ListingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(ListingController.destroyListing));

router.get('/:id/edit',isLoggedIn,isOwner, wrapAsync(ListingController.editListing));

module.exports=router