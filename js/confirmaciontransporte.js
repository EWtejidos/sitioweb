const summaryContainer = document.getElementById("confirmationSummary");
const confirmationList = document.getElementById("confirmationList");
const confirmationBadge = document.getElementById("confirmationBadge");

renderSummary();
renderConfirmations();

confirmationList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-confirmation-action]");
  if (!button) {
    return;
  }

  const item = window.transportistaData.confirmations.find((confirmation) => confirmation.id === button.dataset.id);
  if (!item) {
    return;
  }

  if (button.dataset.confirmationAction === "confirm") {
    item.status = "confirmado";
    item.note = "Entrega cerrada desde el panel del transportista.";
  }

  if (button.dataset.confirmationAction === "notify") {
    item.note = "Mensaje enviado al cliente y al autorizado para confirmar arribo.";
  }

  renderSummary();
  renderConfirmations();
});

function renderSummary() {
  const total = window.transportistaData.confirmations.length;
  const confirmed = window.transportistaData.confirmations.filter((item) => item.status === "confirmado").length;
  const pending = total - confirmed;

  summaryContainer.innerHTML = `
    <article class="summary-tile transport-summary">
      <strong>${total} movimientos</strong>
      <span>Despachos visibles en este turno.</span>
    </article>
    <article class="summary-tile transport-summary">
      <strong>${confirmed} confirmados</strong>
      <span>Ordenes con evidencia aceptada.</span>
    </article>
    <article class="summary-tile transport-summary">
      <strong>${pending} pendientes</strong>
      <span>Requieren llamada, evidencia o validacion.</span>
    </article>
  `;

  confirmationBadge.textContent = `${pending} entregas listas para cierre`;
}

function renderConfirmations() {
  confirmationList.innerHTML = window.transportistaData.confirmations
    .map(
      (item) => `
        <article class="gold-panel confirmation-card">
          <div class="confirmation-meta">
            <p class="panel-kicker">${item.id}</p>
            <h2 class="confirmation-title">${item.action} · ${item.client}</h2>
            <span><strong>Direccion:</strong> ${item.address}</span>
            <span><strong>Autorizado:</strong> ${item.authorized}</span>
            <span><strong>Estado:</strong> <span class="status-pill ${item.status}">${item.status}</span></span>
            <span class="mini-copy">${item.note}</span>
          </div>
          <div class="confirmation-proof">
            <img src="${item.image}" alt="Evidencia de ${item.client}">
            <span class="mini-copy">Evidencia cargada por el transportista.</span>
          </div>
          <div class="confirmation-actions">
            <button class="button primary" type="button" data-confirmation-action="confirm" data-id="${item.id}">Confirmar cierre</button>
            <button class="button secondary" type="button" data-confirmation-action="notify" data-id="${item.id}">Notificar cliente</button>
          </div>
        </article>
      `
    )
    .join("");
}
