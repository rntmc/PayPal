paypal
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
      return actions.order.capture().then(function(details) {
        const transactionId = details.purchase_units[0].payments.captures[0].id;
        
        // Exibir a mensagem e o ID da transação no centro da tela
        const messageElement = document.getElementById("message");
        const transactionIdElement = document.getElementById("transaction-id");
        
        // Atualizar o conteúdo da mensagem e do ID da transação
        transactionIdElement.textContent = transactionId;
        messageElement.classList.remove("hidden");
        
        // Ocultar o botão do PayPal
        const paypalButton = document.getElementById("paypal");
        paypalButton.style.display = "none";
      });
    },
    onError: function(err) {
      console.log(err)
    },    
  })
  .render("#paypal")

