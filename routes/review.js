const express =require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync');
const {validateReview, isLoggedIn,isReviewAuthor}=require('../middleware.js')
const ReviewControler=require("../controllers/review.js");

/// create Review
router.post("/",isLoggedIn,validateReview, wrapAsync(ReviewControler.CreateReview));

// Delete Review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(ReviewControler.destroyReview)
);

module.exports=router