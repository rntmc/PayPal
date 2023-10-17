require("dotenv").config()

const { v4: generate_random_uuid } = require('uuid');
const express = require("express")
const app = express()
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.json())

const paypal = require("@paypal/checkout-server-sdk")
const Environment =
  process.env.NODE_ENV === "production" ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)

const storeItems = new Map([
  [1, { price: 50, name: "Skateboard deck" }]
])

app.get("/", (req, res) => {
  res.render("index", {
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
  })
})

const base = "https://api-m.sandbox.paypal.com"
async function generateAccessTokenFetch() {
  const response = await fetch(base + "/v1/oauth2/token", { // pass URL as the initial argument
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: "Basic " + Buffer.from(process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET).toString("base64"), //require to encode username and password
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const data = await response.json(); //convert to json
  return data.access_token; //retorna somente o token
}

app.post("/create-order", async (req, res) => {
  generateAccessTokenFetch()
  .then(access_token => {
    let order_data_json = {
        'intent': "CAPTURE",
        'purchase_units': [{
            'amount': {
                'currency_code': 'USD',
                'value': '100.00'
            }
        }]
    }
    const data = JSON.stringify(order_data_json)

    fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'PayPal-Request-Id': generate_random_uuid()
      },
      body: data
    })
    .then(res => res.json())
    .then(json => { res.send(json); })
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  })
}) 

app.listen(3000)
