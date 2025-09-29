const btn = document.querySelector("button");
const statusDiv = document.getElementById("status");
const attendingPanel = document.getElementById("attending-panel");

console.log("Script carregado");
console.log("Botão encontrado:", !!btn);
console.log("Status div encontrado:", !!statusDiv);
console.log("Attending panel encontrado:", !!attendingPanel);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .catch(err => console.log("Service worker não encontrado (normal)"));
}

if (btn && statusDiv && attendingPanel) {
  btn.onclick = function () {
    console.log("Botão clicado!"); // Debug
    showStatus("⏳ Chamando...", "loading");

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
      console.log("Resposta recebida:", response.status); // Debug
      if (!response.ok) throw new Error("Erro na resposta");
      return response.json();
    })
    .then(data => {
      console.log("Sucesso:", data); // Debug
      console.log("Estado do ticket:", data.state); // Debug específico
      
      // Verificar se o ticket está em estado "attending"
      if (data && data.state === 'attending') {
        console.log("Mostrando botões de atendimento"); // Debug
        showAttendingButtons(data);
      } else {
        console.log("Mostrando ticket chamado"); // Debug
        // Mostrar ticket chamado
        const ticketNumber = data.number || data.ticket?.number || 'N/A';
        showTicketCalled(ticketNumber);
      }
    })
    .catch(error => {
      console.error("Erro:", error);
      showStatus("❌ Erro ao chamar", "error");
    });
  };
} else {
  console.log("Botão, status div ou attending panel não encontrados");
}

function showStatus(message, type, hasTimeout = true) {
  const statusDiv = document.getElementById("status");
  if (statusDiv) {
    statusDiv.innerText = message;
    statusDiv.className = type;
    statusDiv.style.display = "block";

    // Só aplicar timeout se hasTimeout for true
    if (hasTimeout) {
      setTimeout(() => {
        statusDiv.style.display = "none";
      }, 3000);
    }
  }
}

function showTicketCalled(ticketNumber) {
  const statusDiv = document.getElementById("status");
  if (statusDiv) {
    statusDiv.innerHTML = `
      <div class="ticket-called">
        <p>📢 Ticket Chamado</p>
        <p><strong>Número:</strong> ${ticketNumber}</p>
      </div>
    `;
    statusDiv.className = "called";
    statusDiv.style.display = "block";

    // Timeout para esconder após 5 segundos
    setTimeout(() => {
      statusDiv.style.display = "none";
    }, 5000);
  }
}

function showAttendingButtons(ticket) {
  console.log("showAttendingButtons chamada com:", ticket); // Debug
  const attendingPanel = document.getElementById("attending-panel");
  if (attendingPanel) {
    attendingPanel.innerHTML = `
      <div class="attending-status">
        <p>🎫 Ticket em atendimento</p>
        <p><strong>Número:</strong> ${ticket.label || 'N/A'}</p>
        <div class="action-buttons">
          <button onclick="finishTicket('${ticket.id || ticket.code}')" class="finish-btn">
            ✅ Finalizar Atendimento
          </button>
          <button onclick="cancelTicket('${ticket.code || ticket.id}')" class="cancel-btn">
            ❌ Cancelar Atendimento
          </button>
        </div>
      </div>
    `;
    attendingPanel.className = "attending";
    attendingPanel.style.display = "block";
    console.log("Botões de atendimento exibidos permanentemente até ação bem-sucedida"); 
    // BOTÕES PERMANECEM VISÍVEIS ATÉ AÇÃO BEM-SUCEDIDA
  }
}

function hideAttendingButtons() {
  const attendingPanel = document.getElementById("attending-panel");
  if (attendingPanel) {
    attendingPanel.style.display = "none";
    attendingPanel.innerHTML = "";
  }
}

function finishTicket(ticketId) {
  console.log("Finalizando ticket:", ticketId);
  showStatus("⏳ Finalizando atendimento...", "loading", false); // SEM timeout
  
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
    hideAttendingButtons(); // Esconde os botões
    showStatus("✅ Atendimento finalizado!", "success"); // COM timeout normal
  })
  .catch(error => {
    console.error("Erro ao finalizar:", error);
    showStatus("❌ Erro ao finalizar", "error");
  });
}

function cancelTicket(ticketId) {
  console.log("Cancelando ticket:", ticketId);
  showStatus("⏳ Cancelando atendimento...", "loading", false); // SEM timeout
  
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
    hideAttendingButtons(); // Esconde os botões
    showStatus("✅ Atendimento cancelado!", "success"); // COM timeout normal
  })
  .catch(error => {
    console.error("Erro ao cancelar:", error);
    showStatus("❌ Erro ao cancelar", "error");
  });
}