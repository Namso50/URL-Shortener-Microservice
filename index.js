require('dotenv').config(); // process.env is used to access the .env file variables
const express = require('express');
const app = express();
const dns = require('dns')
const mongoose = require('mongoose')
const Url = require('./Url')

// mongoose 
mongoose.connect(process.env.MONGO_URI)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

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

  dns.lookup(newUrl, async (err, address, family) => {
    // invalid hostname
    if (err) {
      console.log(err)
      res.json({ error: 'invalid hostname' })
    } else {
      let findedUrl = await Url.find({ original_url: req.body.url })
      if (findedUrl.length == 0) {
        let urls = await Url.find() // find all values
        // if there is no value, short_url became 1 firstly
        await Url.create({
          original_url: req.body.url,
          short_url: urls[urls.length - 1] ? urls[urls.length - 1].short_url + 1 : 1,
        })
      }

      res.json((await Url.find({ original_url: req.body.url }, { _id: 0, __v: 0 }))[0])
    }
  })
})

// go to the site 'shorturl' specified  
app.get("/api/shorturl/:num", async (req, res) => {
  let url = await Url.find({ short_url: req.params.num })
  res.redirect(url[0].original_url)
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
