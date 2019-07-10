//Imports
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");
var flash = require("express-flash");
mongoose.Promise = global.Promise;


//Config
app.use(flash());
app.use(express.static(__dirname + "/static"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'applessauce',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}))

app.set("views", __dirname + "/views");
app.set("view engine", "ejs")


//Database
mongoose.connect("mongodb://localhost/OwlDashboard");

var OwlSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Owl name required!"], minlength: 3},
    age: {type: Number, required: [true, "Owl age required!"], min: 1, max: 15},
    color: {type: String, required: [true, "Owl color required!"], minlength: 3}
    }, {timestamps: true});
    mongoose.model("Owl", OwlSchema);
    var Owl = mongoose.model("Owl");

//Routes
app.get("/", function(req, res){
    console.log("root");
    Owl.find({}, function(err, owl){
        if(err){
            console.log("error matching DB request", err);
        }
        else{
            res.render("index", {info: owl});
        }
    })
});

app.get("/owl/new", function(req, res){
    console.log("new form");
    res.render("new");
});

app.get("/owl/:_id", function(req, res){
    console.log("Find")
    Owl.findOne({_id:req.params._id}, function(err, owl){
        if(err){
            console.log("error matching DB request", err);
        }
        else{
            res.render("details", {owl:owl});
        }
    })
});

app.get("/owl/edit/:_id", function(req, res){
    console.log("edit page");
    Owl.findOne({_id:req.params._id}, function(err, owl){
        if(err){
            console.log("error matching DB request", err);
        }
        else{
            res.render("edit", {owl:owl});
        }
    })
});

app.post("/owl", function(req, res){
    console.log("post", req.body);
    var owl = new Owl({name: req.body.name, age: req.body.age, color: req.body.color});
    owl.save(function(err){
        if(err){
            console.log("Something added a owl!", err);
            for(var key in err.errors){
                req.flash("owlform", err.errors[key].message);
            }
            res.redirect("/owl/new");
        }
        else{
            console.log("Successfully added a owl!");
            res.redirect("/");
        }
    })
});

app.post("/owl/:_id", function(req, res){
    console.log("edit");
    Owl.findOne({_id:req.params._id}, function(err, owl){
        if(err){
            console.log("error matching DB request", err);
        }
        else{
            Owl.update({_id: owl._id}, {$set: {name: req.body.name, age: req.body.age, color: req.body.color}}, function(err){
                if(err){
                    console.log("Error updating", err);
                }
                else{
                    res.redirect("/");
                }
            })
        }
    })
});

app.post("/owl/destroy/:_id", function(req, res){
    console.log("destroy");
    Owl.findOne({_id:req.params._id}, function(err, owl){
        if(err){
            console.log("error matching DB request", err);
        }
        else{
            Owl.remove({_id:owl._id}, function(err){
                if(err){
					console.log("error on delete", err);
				}
				else{
					res.redirect("/");
				}
            })
        }
    })
});

//Port
app.listen(8000, function(){
    console.log("Listening on port: 8000");
})