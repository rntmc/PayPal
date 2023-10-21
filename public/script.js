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
const client_id = "AZz_cSK44Eijk02IPpE5UMzKGdh-HTsACmDJY0WuJTiHKpdVsKMENfOYZ4q4rfF9LOs-xaExmXnJT0Pj";
const currency = "USD";
const intent = "capture";


url_to_head(paypal_sdk_url + "?client-id=" + client_id + "&enable-funding=venmo&currency=" + currency + "&intent=" + intent)
  .then(() => {
    let paypal_buttons = paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'paypal',
      },
      createOrder: function(data, actions) {
        return fetch("http://localhost:3000/create-order", {
          method: "post",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ "intent": intent }),
        })
          .then((response) => response.json())
          .then((order) => {
            return order.id;
          });
      },
      onApprove: function (data, actions) {
        return actions.order.capture()
          .then(function(details) {
            // Obtenha o ID da transação
            const transactionId = details.purchase_units[0].payments.captures[0].id;
            
            // Mostre o ID da transação
            const messageElement = document.getElementById("message");
            const transactionIdElement = document.getElementById("transaction-id");
      
            // Certifique-se de que os elementos existam no DOM
            if (messageElement && transactionIdElement) {
              // Atualize o conteúdo da mensagem e o ID da transação
              transactionIdElement.textContent = transactionId;
              messageElement.classList.remove("hidden");
              
              // Oculte o botão do PayPal após a confirmação da transação
              const paypalButton = document.getElementById("paypal-button");
              if (paypalButton) {
                paypalButton.style.display = "none";
              } else {
                console.error("Elemento do botão do PayPal não encontrado.");
              }
            } else {
              console.error("Elementos do DOM não encontrados.");
            }
          })
          .catch(function(error) {
            console.error("Erro ao capturar a transação:", error);
          });
      },
      onError: function(err) {
        console.log(err);
      },
    });

    paypal_buttons.render('#paypal-button');
  })
  .catch((error) => {
    console.error(error);
  });
