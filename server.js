/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

require("dotenv").config(); // loads environment variables from .env file.
const path = require("path");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const routes = require("./routes.js");
const express = require("express");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.engine("html", require("ejs").renderFile);
app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);

const CONNECTION_STRING = process.env.DB;

MongoClient.connect(
  CONNECTION_STRING,

  { useNewUrlParser: true, 
  useUnifiedTopology: true,
  poolsize: 10 /* pools (caches) 10 connections to run 10 queries in parallel.*/ }, 

  function(err, client) {
    if (err) {
      console.log("Connection attempt to mongodb failed");
    } else {
      console.log("Connected to mongodb successfully.");
    }

    var db = client.db("cluster0");

    routes(app, db);

    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res
        .status(404)
        .type("text")
        .send("Not Found");
    });

    // Run the server and report out to the logs
    app.listen(process.env.PORT, function() {
      console.log("Server is running on http://127.0.0.1:" + process.env.PORT);
    });
  }
);
