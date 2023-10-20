require("dotenv").config()

var path = require('path')
const { v4: generate_random_uuid } = require('uuid');
const express = require("express")
const app = express()
app.set("view engine", "ejs")
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
const bodyParser = require("body-parser") 
app.use(bodyParser.urlencoded({extended:false}))
import('node-fetch')

//Cookies
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const credentials = require('./credentials')

app.use(cookieParser(credentials.cookieSecret))
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieSecret,
}))


const paypal = require("@paypal/checkout-server-sdk")
const Environment =
  process.env.NODE_ENV === "production" ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)


app.get("/", (req, res) => {
  res.render("index", {
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
  })
})

app.get("/form", (req, res) => {
  res.render("form");
});

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
  return data.access_token; //returns token
}


const storeItems = new Map([
  [1, { price: 50, name: "Skateboard deck" }]
])

app.post("/create-order", async (req, res) => {
  // let { username, usersurname, usercountry, useraddress1, useraddress2, usercity, userstate, userzip } = req.body;
  const { items } = req.body;
  generateAccessTokenFetch()
    .then(access_token => {
      let order_data_json = {
        'intent': 'CAPTURE',
        'purchase_units': [
          {
            'amount': {
              'currency_code': 'USD',
              'value': (
                items.reduce((total, item) => total + storeItems.get(item.id).price * item.quantity, 0)
              ).toFixed(2)
            },
            // 'shipping': {
            //   'name': {
            //     'full_name': `${username} ${usersurname}`
            //   },
            //   'address': {
            //     'address_line_1': useraddress1,
            //     'address_line_2': useraddress2,
            //     'admin_area_2': usercity,
            //     'admin_area_1': userstate,
            //     'postal_code': userzip,
            //     'country_code': usercountry
            //   },
            // }
          }
        ],
      };
      const data = JSON.stringify(order_data_json);

      fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
          'PayPal-Request-Id': generate_random_uuid()
        },
        body: data
      })
        .then(res => res.json())
        .then(json => {
          res.send(json);
        })
        .catch(err => {
          console.log(err);
          res.status(500).send(err);
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
});



//form endpoint
app.post('/process', (req, res) => {
  const { username, usersurname, usercountry, useraddress1, useraddress2, usercity, userstate, userzip } = req.body;

  // User info object
  const userInformation = {
    username,
    usersurname,
    usercountry,
    useraddress1,
    useraddress2,
    usercity,
    userstate,
    userzip,
  };

  // Save user info in cookies
  res.cookie('userInformation', userInformation);

  // User details update message
  const message = `Thank you! Your details have been updated!<br>${username} ${usersurname}<br>${useraddress1}, ${useraddress2}<br>${usercity}, ${userstate}, ${usercountry}<br>${userzip}`;
  
  // HTML page showing message and details 
  const dynamicPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/stylesheets/process-style.css">
      <title>Thank You</title>
    </head>
    <body>
      <div class="page">
        <header>
          <a href="/">Home</a>
        </header>
          <h2>Details updated</h2>
          <div id="message" class="message">
            <p>${message}</p>
          </div>
      </div>
    </body>
    </html>
  `;

  res.send(dynamicPage);
});

app.get('/user-profile', (req, res) => {
  // Retrieve cookies info
  const userInformation = req.cookies.userInformation;
  // Render page where users can see their details
  res.render('user-profile', { userInformation });
});

app.listen(3000)
