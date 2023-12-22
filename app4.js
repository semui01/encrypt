//jshint esversion:6

import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
 

import bcrypt from "bcrypt";                                //level 4 hash and salt   https://www.npmjs.com/package/bcrypt
const saltRounds =10;                                        //level 4 hash and salt note: nodejs stable version 

 
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
  bcrypt.hash(req.body.password, saltRounds,function(err,hash) {                     // bcrypt to crypt password
       const newUser = new User({
      email: req.body.username,
      password:hash
  });

  newUser.save(); 
  res.render("secrets.ejs")
  });

})

app.post("/login",(req,res)=>{
    const username =req.body.username;
    const password = req.body.password;

    User.findOne({email:username}).then((foundUser)=>{
      

        bcrypt.compare(password, foundUser.password, function(err,result) {                 // bcrypt compare
            if(result === true){
                  res.render("secrets.ejs")
            }else{
                console.log("wrong password.")
                res.redirect("/login")
            }
        });
       
        });
    })

 
   



app.listen(3000,function(){
    console.log("the server is running on port 3000")
})