const Url = require('./Url')

async function add_find(req, res) {
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

module.exports = add_find