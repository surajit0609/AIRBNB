const Listing=require("../models/listing")
module.exports.index=async (req, res) => { 
  const allListing = await Listing.find({});
 
  res.render('listing/index', { allListing });
};
module.exports.renderNewForm=(req, res) => {
 
  res.render("listing/new");
}

// create listin 
module.exports.CreateListing=async (req, res, next) => {
  let url=req.file.path;
  let filename=req.file.filename;
  
  const newListing = new Listing(req.body.listing);
 
  newListing.owner=req.user._id;
  newListing.image={url,filename}
  await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
}

module.exports.showListing=async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({
    path:"reviews",
    populate:{
      path:"author"
    },
  }).populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");  // ✅ Add return here
  }

  res.render("listing/show", { listing });
}
module.exports.editListing=async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
    if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");  // ✅ Add return here
  }
  res.render('listing/edit', { listing });
}
module.exports.updateListing=async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", " Listing Update");
  res.redirect(`/listings/${id}`);
}
module.exports.destroyListing=async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success","Listing Deleted")
  res.redirect('/listings');
}
