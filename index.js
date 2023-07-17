require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  // The process.cwd() method returns the current working directory of the Node.js process.
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// url shortener
const urls = []

app.post("/api/shorturl", (req, res) => {

  let urlRegex = /^https?:\/\//

  // invalid url
  if (!urlRegex.test(req.body.url)) {
    res.json({ error: 'invalid url' })
  }

  let newUrl = req.body.url.replace(/^https?:\/\//, "")
    .replace(/\/.*/, "")

  dns.lookup(newUrl, (err, address, family) => {
    // invalid hostname
    if (err) {
      console.log(err)
      res.json({ error: 'invalid hostname' })
    } else {
      if (!urls.includes(req.body.url)) {
        urls.push(req.body.url)
      }
      res.json({
        original_url: req.body.url,
        short_url: urls.indexOf(req.body.url)
      })
    }
  })

})

// go to the site 'shorturl' specified  
app.get("/api/shorturl/:num", (req, res) => {
  res.redirect(urls[req.params.num])
})


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
