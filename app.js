if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}

//console.log(process.env);
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const ejsMate=require("ejs-mate");
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
const methodOverride=require("method-override");


const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const url=process.env.ATLASDB_URL;
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));
main().then(()=>{
    console.log("connected to DB!");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(url);
}    

// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log("Sample was Saved");
//     res.send("Sucessful!");

// });
const store=MongoStore.create({
    mongoUrl:url,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*60*60
});
store.on("error",()=>{
    console.log("Mongo Session related Problem");
})
const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*3,
        maxAge:1000*60*60*24*3,
        httpOnly:true
    }
};


app.use(session(sessionOptions));


app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currUser=req.user;
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"));
});
app.use((err,req,res,next)=>{
    let {status=500,message="Something went Wrong"}=err;
    res.status(status).render("listings/error.ejs",{err});
    //res.status(status).send(message);
})


app.listen(8080,(req,res)=>{
    console.log("Server listening ...");
})

