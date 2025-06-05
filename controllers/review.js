const Listing=require("../models/listing")
const Review=require("../models/review");

module.exports.CreateReview=async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const reviewData = req.body.review;
  const newReview = new Review(reviewData);
  newReview.author=req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created");

  res.redirect(`/listings/${listing._id}`); // ✅ Redirect to show page
}

module.exports.destroyReview=async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");

    res.redirect(`/listings/${id}`);
  }