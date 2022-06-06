require('dotenv').config()

const express = require("express");
const app = express()
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const url = process.env.MONGO_URL;
const path = require("path");
var validUrl = require("valid-url");
const shortid = require('shortid');



 mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

 const connection = mongoose.connection;

 connection.once("open", function () {
   console.log("MongoDB database connection established successfully");
 });


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const staticPath = path.join(__dirname, "static"); 
app.use("/", express.static("/static/index.html"));
app.use("/", express.static(staticPath));

const port = 3000;

const Schema = mongoose.Schema;

const urlSchema = new Schema({
    original_url : String,
    short_url  : String

})

const Url = mongoose.model("Url", urlSchema);


app.post("/api/urlshort/new", (req, res) => {

    const submitted_url = req.body.url;

     if (validUrl.isUri(submitted_url)) {

      var clean_url = submitted_url;

      Url.findOne({ original_url: clean_url }, (err, docs) => {

        if(!docs) {
         const url_id = shortid.generate();
         const newUrlObj = new Url({original_url: clean_url,short_url: url_id,});
         newUrlObj.save();
        }
         else {
            return res.status(200).send({ original_url: clean_url, short_url: url_id });
         }
      })
          

    } else {
      console.log("Not a URI");
    }
    res.redirect(200, "/");
    
})

app.get("/short_url/:id", (req, res)=> {
  const id = req.params.id

  Url.findOne({ short_url: id }, (err, docs) => {
    if (!docs) {
      return res.json({ message: "no url supported" });
    } else {
      return res.json({original_url : docs.original_url, short_url : docs.short_url})
    }
  });
})

app.listen(port, ()=> {
    console.log(`working on port ${port}`);
})