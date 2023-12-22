//jshint esversion:6

import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
 

import session from 'express-session';                            //lever5 passport cookies sessions https://www.npmjs.com/package/express-session
import passport from 'passport';                                  //lever5 passport cookies sessions
import passportLocalMongoose from "passport-local-mongoose";      //lever5 passport cookies sessions
 
const app =express();

 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');


app.use(session({                                                     //lever5 passport cookies sessions
    secret: process.env.SECRET,                                      // Session data is not saved in the cookie itself, just the session ID. Session data is stored server-side.
    resave: false,
    saveUninitialized:false,
    
}));

app.use(passport.initialize());                                     //lever5 passport cookies sessions     
app.use(passport.session());                                          //lever5 passport cookies sessions
 
mongoose.connect('mongodb://127.0.0.1:27017/userDB'); 

 
const userSchema = new mongoose.Schema({
    email: String,
    password:String,   
});


userSchema.plugin(passportLocalMongoose);                           //lever5 passport cookies sessions
 

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());                                 //lever5   //passport local mongoose simple version

passport.serializeUser(User.serializeUser());                          //lever5   //passport local mongoose simple version
passport.deserializeUser(User.deserializeUser());                       //lever5   //passport local mongoose  simple version

 
app.get("/",(req,res)=>{
    res.render("home.ejs")
})

 
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

app.get("/logout",(req,res)=>{                                    //lever5 from passport 
    req.logout(function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/");
        }
    });
    
});


app.post("/register",(req,res)=>{

    User.register({username:req.body.username, active: false}, req.body.password, function(err, user) {               //passport local mongoose
        if (err) { 
            console.log(err);
            res.redirect("/register");
         }else{
            passport.authenticate("local")(req,res,function(){                                                    //passport authorisation
                res.redirect("/secrets");
            })
         }
     });
});


app.post("/login",(req,res)=>{

    const user =new User({
         username : req.body.username,
         password : req.body.password
    });
    req.login(user, function(err) {                                             //from passport
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