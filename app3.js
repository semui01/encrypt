//jshint esversion:6

import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";

import md5 from "md5";                                   //level 3 md5 hashing (con:same pw has same hash value,so to avoid popular pw)  https://www.npmjs.com/package/md5


const app =express();

 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

mongoose.connect('mongodb://127.0.0.1:27017/userDB'); 

 
const userSchema = new mongoose.Schema({
    email: String,
    password:String,
    
});

const User = new mongoose.model("User", userSchema);


app.get("/",(req,res)=>{
    res.render("home.ejs")
})

 
app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.get("/register",(req,res)=>{
    res.render("register.ejs")
})

app.get("/logout",(req,res)=>{
  res.redirect("/")
})

app.post("/register",(req,res)=>{
    const newUser = new User({
        email: req.body.username,
        password:md5(req.body.password)                                    // md5 since the same info have the same hash,so use md5 for encryt and decrypt
    });

    newUser.save(); 
    res.render("secrets.ejs")

})


app.post("/login",(req,res)=>{
    const username =req.body.username;
    const password = md5(req.body.password);                                //md5 since the same info have the same hash,so use md5 for encryt and decrypt

    User.findOne({email:username}).then((foundUser)=>{
        if (foundUser.password === password){
            res.render("secrets.ejs")

        } else(
            res.redirect("/login")
        )
        });

    })


    



app.listen(3000,function(){
    console.log("the server is running on port 3000")
})