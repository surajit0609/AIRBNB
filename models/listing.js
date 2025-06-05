const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review =require("./review");
const User=require("./user");
const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=600",
      set: (v) =>
        v === ""
          ? "https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=600"
          : v
    }
  },
  price: Number,
  location: String,
  country: String,

  // ✅ FIXED: define reviews as array of ObjectId referencing "Review"
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner:{
      type: Schema.Types.ObjectId,
      ref :"User"
  }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
})

module.exports = mongoose.model("Listing", listingSchema);
