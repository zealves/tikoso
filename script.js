const btn = document.getElementById("callButton");
const statusDiv = document.getElementById("status");
const attendingPanel = document.getElementById("attendingPanel");

// console.log("Script carregado");
// console.log("Botão encontrado:", !!btn);
// console.log("Status div encontrado:", !!statusDiv);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .catch(err => console.log("Service worker não encontrado (normal)"));
}

function callNext() {
    showStatus("⏳ Chamando...", "loading", false);

    fetch("https://dev.moviik.com/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer gyOaS0IhFOCkP0dvFlKC4rZK4O19f9m9"
      },
      body: JSON.stringify({
        action:"call",
        counter:"6",
        user:"1"
      })
    })
    .then(response => {
      console.log("Resposta recebida:", response.status); 
      if (!response.ok) throw new Error("Erro na resposta");
      return response.json();
    })
    .then(data => {
      hideStatus();
      if (data && data.state === 'attending') {
        showAttendingButtons(data);
      } else {
        const ticketLabel = data.label || 'N/A';
        showTicketCalled(ticketLabel);
      }
    })
    .catch(error => {
      console.error("Erro:", error);
      showStatus("❌ Erro ao chamar", "error");
    });
}

// if (btn) {
//   btn.onclick = function () {
//     console.log("Botão clicado!"); 
  //   showStatus("⏳ Chamando...", "loading");

  //   fetch("https://dev.moviik.com/api/tickets", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": "Bearer gyOaS0IhFOCkP0dvFlKC4rZK4O19f9m9"
  //     },
  //     body: JSON.stringify({
  //       action:"call",
  //       counter:"6",
  //       user:"1"
  //     })
  //   })
  //   .then(response => {
  //     console.log("Resposta recebida:", response.status); 
  //     if (!response.ok) throw new Error("Erro na resposta");
  //     return response.json();
  //   })
  //   .then(data => {
  //     console.log("Sucesso:", data); 
  //     console.log("Estado do ticket:", data.state); 
      
  //     // Verificar se o ticket está em estado "attending"
  //     if (data && data.state === 'attending') {
  //       console.log("Mostrando botões de atendimento"); 
  //       showAttendingButtons(data);
  //     } else {
  //       console.log("Mostrando ticket chamado"); 
  //       // Mostrar ticket chamado
  //       const ticketNumber = data.number || data.ticket?.number || 'N/A';
  //       showTicketCalled(ticketNumber);
  //     }
  //   })
  //   .catch(error => {
  //     console.error("Erro:", error);
  //     showStatus("❌ Erro ao chamar", "error");
  //   });
  // };
// } 
// else {
//   console.log("Botão, status div ou attending panel não encontrados");
// }

function showStatus(message, type, hasTimeout = true) {
  const statusDiv = document.getElementById("status");
  // if (statusDiv) {
    statusDiv.innerText = message;
    statusDiv.className = type;
    statusDiv.style.display = "block";

    // Só aplicar timeout se hasTimeout for true
    if (hasTimeout) {
      setTimeout(() => {
        hideStatus();
      }, 3000);
    }
  // }
}

function hideStatus() {
  const statusDiv = document.getElementById("status");
  statusDiv.style.display = "none";
}

function showTicketCalled(ticketLabel) {
  // const statusDiv = document.getElementById("status");
  // if (statusDiv) {
  //   statusDiv.innerHTML = `
  //     <div class="ticket-called">
  //       <p>📢 Ticket Chamado</p>
  //       <p><strong>Número:</strong> ${ticketLabel}</p>
  //     </div>
  //   `;
  //   statusDiv.className = "called";
  //   statusDiv.style.display = "block";

  //   // Timeout para esconder após 5 segundos
  //   setTimeout(() => {
  //     statusDiv.style.display = "none";
  //   }, 5000);
  // }
}

function showAttendingButtons(ticket) {
  console.log("showAttendingButtons chamada com:", ticket); 
  const attendingPanel = document.getElementById("attendingPanel");
  const callButton = document.getElementById("callButton");
  
  if (attendingPanel) {
    attendingPanel.innerHTML = 
      '<div class="attending-status">' +
        '<p>🎫 Ticket em atendimento</p>' +
        '<p><strong>Número:</strong> ' + (ticket.label || 'N/A') + '</p>' +
        '<div class="action-buttons">' +
          '<button onclick="finishTicket(\'' + (ticket.id || ticket.code) + '\')" class="finish-btn big-btn">' +
            '✅ Finalizar Atendimento' +
          '</button>' +
          '<button onclick="cancelTicket(\'' + (ticket.code || ticket.id) + '\')" class="cancel-btn big-btn">' +
            '❌ Cancelar Atendimento' +
          '</button>' +
        '</div>' +
      '</div>';
    attendingPanel.className = "attending";
    attendingPanel.style.display = "block";
    
    // Esconder o botão de chamar
    if (callButton) {
      callButton.style.display = "none";
    }
    
    console.log("Botões de atendimento exibidos permanentemente até ação bem-sucedida"); 
  }
}

function hideAttendingButtons() {
  const attendingPanel = document.getElementById("attendingPanel");
  const callButton = document.getElementById("callButton");
  
  if (attendingPanel) {
    attendingPanel.style.display = "none";
    attendingPanel.innerHTML = "";
  }
  
  // Mostrar novamente o botão de chamar
  if (callButton) {
    callButton.style.display = "block";
  }
}

function finishTicket(ticketId) {
  showStatus("⏳ Finalizando atendimento...", "loading", false); 

  fetch("https://dev.moviik.com/api/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer gyOaS0IhFOCkP0dvFlKC4rZK4O19f9m9"
    },
    body: JSON.stringify({
      action: "terminate",
      ticket: ticketId,
      counter: "6",
      user: "1"
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("Erro ao finalizar");
    return response.json();
  })
  .then(data => {
    console.log("Atendimento finalizado:", data);
    hideAttendingButtons(); 
    showStatus("✅ Atendimento finalizado!", "success"); 
  })
  .catch(error => {
    console.error("Erro ao finalizar:", error);
    showStatus("❌ Erro ao finalizar", "error");
  });
}

function cancelTicket(ticketId) {
  showStatus("⏳ Cancelando atendimento...", "loading", false);
  fetch("https://dev.moviik.com/api/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer gyOaS0IhFOCkP0dvFlKC4rZK4O19f9m9"
    },
    body: JSON.stringify({
      action: "cancel",
      ticket: ticketId
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("Erro ao cancelar");
    return response.json();
  })
  .then(data => {
    console.log("Atendimento cancelado:", data);
    hideAttendingButtons(); 
    showStatus("✅ Atendimento cancelado!", "success"); 
  })
  .catch(error => {
    console.error("Erro ao cancelar:", error);
    showStatus("❌ Erro ao cancelar", "error");
  });
}