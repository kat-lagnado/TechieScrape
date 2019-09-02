var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");

var cheerio = require("cheerio");
var axios = require("axios");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
// var databaseURI = process.env.MONGODB_URI || "mongodb://localhost/scraperdb";
// mongoose.connect(databaseURI);

// Heroku w/ MlabDB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperdb";
mongoose.connect(MONGODB_URI);

app.get("/", function(req, res) {
  db.Article.find({ saved: false }).then(function(allArticles) {
    res.render("home", { articles: allArticles });
  });
});

app.get("/saved", function(req, res) {
  db.Article.find({ saved: true }).then(function(allArticles) {
    res.render("saved", { articles: allArticles });
  });
});

app.get("/api/scrape", function(req, res) {
  axios.get("http://www.echojs.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("article h2").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
      console.log(result);
      console.log(element.children);
    });
    res.json("Scrape Completed");
  });
});

// app.get("/articles", function(req, res) {
//     db.Article.find({})
//         .then(function(dbArticle) {
//             res.json(dbArticle);
//         })
//         .catch(function(err) {
//             res.json(err);
//         });
// });

// app.get("/articles/:id", function(req, res) {
//     db.Article.findOne({ _id: req.params.id })

//         .populate("note")
//         .then(function(dbArticle) {
//             res.json(dbArticle);
//         })
//         .catch(function(err) {
//             res.json(err);
//         });
// });

// app.post("/articled/:id", function(req, res) {
//     db.Note.create(req.body)
//         .then(function(dbNote) {
//             return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id}, { new: true});
//         })
//         .then(function(dbArticle) {
//             res.json(dbArticle);
//         })
//         .catch(function(err) {
//             res.json(err);
//         });
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
