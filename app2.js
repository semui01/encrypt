//jshint esversion:6

import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";               //leve 2 security mongoose encryption  https://www.npmjs.com/package/mongoose-encryption

 
const app =express();

 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

 
mongoose.connect('mongodb://127.0.0.1:27017/userDB'); 

 
const userSchema = new mongoose.Schema({
    email: String,
    password:String,
                                                        
});

 
userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});     //leve 2  mongoose (database) encryption   more fields can be added,e.g  ['password','age'] For convenience,  a single secret string used  instead of two keys. 

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
        password:req.body.password
    });

    newUser.save();                                                      // save and find will encrypt and decrypt the relevent field datar R(nror erxtra work is needed)
    res.render("secrets.ejs")

})

app.post("/login",(req,res)=>{
    const username =req.body.username;
    const password =req.body.password;

    User.findOne({email:username}).then((foundUser)=>{
        if (foundUser.password === password){                                    // save and find will encrypt and decrypt the relevent field datar R(nror erxtra work is needed)
            res.render("secrets.ejs")
        } else(
            res.redirect ("/login")
        )
        });

    })
 

app.listen(3000,function(){
    console.log("the server is running on port 3000")
})