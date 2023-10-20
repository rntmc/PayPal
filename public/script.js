  paypal_sdk
    .Buttons({
      createOrder: function () {
        return fetch("/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                id: 1,
                quantity: 1,
              }
            ],
          }),
        })
          .then(res => { 
            if (res.ok) return res.json()
            return res.json().then(json => Promise.reject(json))
          })
          .then(({ id }) => {
            return id
          })
          .catch(e => {
            console.error(e.error)
          })
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