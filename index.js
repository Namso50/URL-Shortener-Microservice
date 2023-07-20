require('dotenv').config(); // process.env is used to access the .env file variables
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns')
const mongoose = require('mongoose')
const Url = require('./Url')
const add_find = require('./add_find')

// mongoose 
mongoose.connect(process.env.MONGO_URI)

// Basic Configuration
const port = process.env.PORT || 3000; 

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  // The process.cwd() method returns the current working directory of the Node.js process.
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// url shortener

app.post("/api/shorturl", (req, res) => {

  let urlRegex = /^https?:\/\//

  // invalid url
  if (!urlRegex.test(req.body.url)) {
    res.json({ error: 'invalid url' })
    return
  }

  let newUrl = req.body.url.replace(/^https?:\/\//, "")
    .replace(/\/.*/, "")

  dns.lookup(newUrl, (err, address, family) => {
    // invalid hostname
    if (err) {
      console.log(err)
      res.json({ error: 'invalid hostname' })
    } else {
      add_find(req, res)
    }
  })

})

// go to the site 'shorturl' specified  
app.get("/api/shorturl/:num", (req, res) => {
  goUrl()
  async function goUrl() { 
     let url = await Url.find({ short_url: req.params.num})
   res.redirect(url[0].original_url)
  }
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
