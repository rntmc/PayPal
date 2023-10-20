let url_to_head = (url) => {
  return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.onload = function() {
          resolve();
      };
      script.onerror = function() {
          reject('Error loading script.');
      };
      document.head.appendChild(script);
  });
}  
  
const paypal_sdk_url = "https://www.paypal.com/sdk/js";
const client_id = "AZz_cSK44Eijk02IPpE5UMzKGdh-HTsACmDJY0WuJTiHKpdVsKMENfOYZ4q4rfF9LOs-xaExmXnJT0Pj"
const currency = "USD";
const intent = "capture";
  

url_to_head(`${paypal_sdk_url}?client-id=${client_id}&currency=${currency}&intent=${intent}`)
  .then(() => {
    let paypal_buttons = paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'paypal'
      },
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '50.00' 
            }
          }]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture()
          .then(function(details) {
          const transactionId = details.purchase_units[0].payments.captures[0].id;
          
          // Shows Transaction ID 
          const messageElement = document.getElementById("message");
          const transactionIdElement = document.getElementById("transaction-id");
          
          // Updates content of message and transaction ID
          transactionIdElement.textContent = transactionId;
          messageElement.classList.remove("hidden");
          
          // Hide PayPal button after transaction confirmation
          const paypalButton = document.getElementById("paypal");
          paypalButton.style.display = "none";
        });
      },
      onError: function(err) {
        console.log(err)
      },    
    })
    .render("#paypal")
});