const Listing = require("../models/listing");


module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};
module.exports.renderNewForm=(req,res)=>{
    
    res.render("./listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing});
};

module.exports.createListing=async(req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing created!");
    res.redirect("/listings");
        
};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_256");
    res.render("./listings/edit.ejs",{listing,originalImageUrl});
    
};

module.exports.updateListing=async(req,res)=>{
    
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file!=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);

};
module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    let DeletedListing=await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};

module.exports.bookForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_256");
    res.render("./listings/book.ejs",{listing,originalImageUrl});
    
};
module.exports.bookConfirm=async(req,res)=>{
    req.flash("success","Your booking has been confirmed.");
    res.redirect("/listings");
};
module.exports.categoryForm=async(req,res)=>{
    let {id}=req.params;
    const allListings=await Listing.find({category:id});
    res.render("listings/category.ejs",{allListings,id});
}
module.exports.search = async(req, res)=>{
    console.log(req.query.q);
    let input = req.query.q.trim().replace(/\s+/g, " "); 
    console.log(input);
    if (input == "" || input == " ") {
      req.flash("error", "Search value empty !!!");
      res.redirect("/listings");
    }
    let element=input;
    let allListings = await Listing.find({
        title: { $regex: element, $options: "i" },
      });
      if (allListings.length != 0) {
        res.locals.success = "Listings searched by Title";
        res.render("listings/index.ejs", { allListings });
        return;
      }
      if (allListings.length == 0) {
        allListings = await Listing.find({
          category: { $regex: element, $options: "i" },
        }).sort({ _id: -1 });
        if (allListings.length != 0) {
          res.locals.success = "Listings searched by Category";
          res.render("listings/index.ejs", { allListings });
          return;
        }
      }
      if (allListings.length == 0) {
        allListings = await Listing.find({
          country: { $regex: element, $options: "i" },
        }).sort({ _id: -1 });
        if (allListings.length != 0) {
          res.locals.success = "Listings searched by Country";
          res.render("listings/index.ejs", { allListings });
          return;
        }
      }
      if (allListings.length == 0) {
        let allListings = await Listing.find({
          location: { $regex: element, $options: "i" },
        }).sort({ _id: -1 });
        if (allListings.length != 0) {
          res.locals.success = "Listings searched by Location";
          res.render("listings/index.ejs", { allListings });
          return;
        }
      }
      const intValue = parseInt(element, 10); // 10 for decimal return - int ya NaN
      const intDec = Number.isInteger(intValue); 
    
      if (allListings.length == 0 && intDec) {
        allListings = await Listing.find({ price: { $lte: element } }).sort({
          price: 1,
        });
        if (allListings.length != 0) {
          res.locals.success = `Listings searched for less than Rs ${element}`;
          res.render("listings/index.ejs", { allListings });
          return;
        }
      }
      if (allListings.length == 0) {
        req.flash("error", "Listings is not here !!!");
        res.redirect("/listings");
      }
}    