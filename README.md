The website is hosted on the following link : https://test-cx6w.onrender.com
In order for PayPal the button to work, the server must be running.

*** Front-end ***
[x]A web page to simulate a basic shopping cart page on a web store

[x] It shows at least one product with its name, item number and price.

[x] It shows fields with a buyer’s information: her first name, last name, email, phone number and shipping address (address line 1, 2, state or province, zip or postal code, and country). 

[x] The pre-filled shipping address shall be a valid address in the US. All buyer information shall be editable HTML fields on the page.

[x] Button(s) to initiate a PayPal payment process, at least one of which should be a yellow “PayPal” one. These button(s) shall be rendered by the PayPal JS SDK (paypal.com/sdk/js)

*** Back-end ***
[x] The server program(s) shall implement use of a PayPal API that authenticates using oauth2 (client-id and secret keys) to generate an access token (on demand or cached) and make subsequent API calls.

[x] The payment process shall be initiated by the user clicking the button mentioned above, which will call the PayPal API for setup.

[] The buyer’s pre-filled information shall be passed to PayPal in this setup so that the buyer does not have to input any of her information on PayPal again (although a buyer account with different shipping information might be used for checkout)

[x] After the payer approves the payment at PayPal and returns, the server shall capture/execute the set-up payment so that a PayPal transaction is created.

[X] After the server creates a successful transaction, a thank you message, or page shall be displayed to the buyer. This should include the transaction ID created for the checkout process.
