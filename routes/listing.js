const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage })
const Listing=require("../models/listing.js");
const {isLoggedin, isOwner, validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
router
.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedin,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing));

router.get("/new",isLoggedin,listingController.renderNewForm);
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedin,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedin,isOwner,wrapAsync(listingController.deleteListing));





//Edit Route
router.get("/:id/edit",isLoggedin,isOwner,wrapAsync(listingController.renderEditForm));


module.exports=router;