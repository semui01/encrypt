//jshint esversion:6

import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
// import encrypt from "mongoose-encryption";               //leve 2 security

// import md5 from "md5";                                   //level 3 hashing

// import bcrypt from "bcrypt";                                //level 4 hash and salt
// const saltRounds =10;                                        //level 4 hash and salt

import session from 'express-session';                         //lever5 passport cookies sessions
import passport from 'passport';                                  //lever5 passport cookies sessions
import passportLocalMongoose from "passport-local-mongoose";      //lever5 passport cookies sessions

import {Strategy as GoogleStrategy} from 'passport-google-oauth20'      //level6 oauth google  equals to   var GoogleStrategy = require('passport-google-oauth20').Strategy; 
import findOrCreate from 'mongoose-findorcreate';                          //lever6 oauth google

const app =express();

 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');


app.use(session({                                                     //lever5 passport cookies sessions
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:false
}));

app.use(passport.initialize());                                     //lever5 passport cookies sessions     
app.use(passport.session());                                          //lever5 passport cookies sessions




mongoose.connect('mongodb://127.0.0.1:27017/userDB'); 

// const userSchema ={
//     email: String,
//     password:String
// };

// lever 2 security
const userSchema = new mongoose.Schema({
    email: String,
    password:String,
    googleId:String                                                         //lever6 oath google add googleId to userSchma
});


userSchema.plugin(passportLocalMongoose);                           //lever5 passport cookies sessions

userSchema.plugin(findOrCreate);                                   //lever6 oauth google

// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});

// lever 2 security end


const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());                                 //lever5 passport cookies sessions 

// passport.serializeUser(User.serializeUser());                          //lever5 passport cookies sessions
// passport.deserializeUser(User.deserializeUser());                       //lever5 passport cookies sessions



passport.serializeUser(function(user, cb) {                       // lever6 Oauth  
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        // username: user.username,
        // picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {                       // lever6 Oauth  
    process.nextTick(function() {
      return cb(null, user);
    });
  });





passport.use(new GoogleStrategy({                                        //lever6 oauth google
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
     
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",(req,res)=>{
    res.render("home.ejs")
})

app.get("/auth/google",                                                                // lever6 Oauth  google
    passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",                                                         // lever6 Oauth  google
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });



app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.get("/register",(req,res)=>{
    res.render("register.ejs")
})

app.get("/secrets",(req,res)=>{                                  //lever5 passport cookies sessions 
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.get("/logout",(req,res)=>{                                    //lever5 passport cookies sessions
    req.logout(function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/");
        }
    });
    
});

//lever 1 and 2 security

// app.post("/register",(req,res)=>{
//     const newUser = new User({
//         email: req.body.username,
//         password:req.body.password
//     });

//     newUser.save(); 
//     res.render("secrets.ejs")

// })


// app.post("/login",(req,res)=>{
//     const username =req.body.username;
//     const password =req.body.password;

//     User.findOne({email:username}).then((foundUser)=>{
//         if (foundUser.password === password){
//             res.render("secrets.ejs")

//         } else(
//             console.log("wrong password")
//         )
//         });

//     })
// end of level 2 security
// - - - - - - - -   -          -            - - - - - 
//lever 3 security hash md5
// app.post("/register",(req,res)=>{
//     const newUser = new User({
//         email: req.body.username,
//         password:md5(req.body.password)
//     });

//     newUser.save(); 
//     res.render("secrets.ejs")

// })


// app.post("/login",(req,res)=>{
//     const username =req.body.username;
//     const password = md5(req.body.password);

//     User.findOne({email:username}).then((foundUser)=>{
//         if (foundUser.password === password){
//             res.render("secrets.ejs")

//         } else(
//             console.log("wrong password")
//         )
//         });

//     })

//  end of level 3
// - - - - - - - -   -          -            - - - - - 
    //lever 4 hash with salt
// app.post("/register",(req,res)=>{
//     bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
//          const newUser = new User({
//         email: req.body.username,
//         password:hash
//     });

//     newUser.save(); 
//     res.render("secrets.ejs")
//     });

// })


// app.post("/login",(req,res)=>{
//     const username =req.body.username;
//     const password = req.body.password;

//     User.findOne({email:username}).then((foundUser)=>{

//         bcrypt.compare(password, foundUser.password).then(function(result) {
//             if(result === true){
//                   res.render("secrets.ejs")
//             }else{
//                 console.log("wrong password.")
//                 res.redirect("/login")
//             }
//         });
       
//         });
//     })

// end of lever 4 hash and salt with bcrypt
  // - - - - - - - -   -          -            - - - - -          
//lever 5 passport sessions cookies             
app.post("/register",(req,res)=>{

    User.register({username:req.body.username, active: false}, req.body.password, function(err, user) {
        if (err) { 
            console.log(err);
            res.redirect("/register");
         }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
         }
      
   
      });

})


 app.post("/login",(req,res)=>{

    const user =new User({
         username : req.body.username,
         password : req.body.password
    });
    req.login(user, function(err) {
        if (err) { 
            console.log(err);
         } else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
        
      });
    }
});  
    
        
        });



app.listen(3000,function(){
    console.log("the server is running on port 3000")
})