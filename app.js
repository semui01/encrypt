//jshint esversion:6

import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

const app =express();

 

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');


mongoose.connect('mongodb://127.0.0.1:27017/userDB'); 

// const userSchema ={
//     email: String,
//     password:String
// };

// lever 2 security
const userSchema = new mongoose.Schema({
    email: String,
    password:String
});


userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});

// lever 2 security end

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

app.post("/register",(req,res)=>{
    const newUser = new User({
        email: req.body.username,
        password:req.body.password
    });

    newUser.save(); 
    res.render("secrets.ejs")

})

app.post("/login",(req,res)=>{
    const username =req.body.username;
    const password =req.body.password;

    User.findOne({email:username}).then((foundUser)=>{
        if (foundUser.password === password){
            res.render("secrets.ejs")

        } else(
            console.log("wrong password")
        )
        });

    })
           
               





app.listen(3000,function(){
    console.log("the server is running on port 3000")
})