// modified from https://blog.novoda.com/take-control-of-your-backend-with-firebase-cloud-functions-ii/

const ONE_HOUR = 3600000

var functions = require('firebase-functions')
const MAPS_API_URL = "http://api.urtjumpers.com/?key=" + functions.config().api.key + "&liste=maps&format=json"

var Client = require('node-rest-client').Client
var client = new Client()

const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

const cors = require('cors')({ origin: true })

exports.getMaps = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    var cache = admin.database().ref('/urtjumpers')

    return cache
      .once('value')
      .then(snapshot => {
        if (isCacheValid(snapshot)) {
          return response(res, snapshot.val(), 200)
        } else {
          return request(MAPS_API_URL)
            .then(items => save(cache, items))
            .then(items => response(res, items, 201))
        }
      })
  })
})

function wrapData(items) {
  return {
    date: new Date(Date.now()).toISOString(),
    maps: items
  }
}

function save(databaseRef, items) {
  items = wrapData(items)

  return databaseRef
    .set(items)
    .then(() => {
      return Promise.resolve(items)
    })
}

function request(url) {
  return new Promise(function (fulfill, reject) {
    client.get(url, function (data, response) {
      fulfill(data)
    })
  })
}

function response(res, items, code) {
  return Promise.resolve(res.status(code)
    .type('application/json')
    .send(items))
}

function isCacheValid(snapshot) {
  return (
    snapshot.exists() &&
    elapsed(snapshot.val().date) < ONE_HOUR
  )
}

function elapsed(date) {
  const then = new Date(date)
  const now = new Date(Date.now())
  return now.getTime() - then.getTime()
}