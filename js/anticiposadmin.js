const anticiposContainer = document.getElementById("moduleContent");
const anticiposStatus = document.getElementById("statusBadge");

renderAnticipos();

anticiposContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  const item = adminData.anticipos.find((anticipo) => anticipo.id === id);

  if (button.dataset.action === "approve" && item) {
    item.status = "aprobado";
    adminCommon.setStatus(anticiposStatus, `Anticipo de la orden #${id} aprobado.`);
  }

  if (button.dataset.action === "reject" && item) {
    item.status = "rechazado";
    adminCommon.setStatus(anticiposStatus, `Anticipo de la orden #${id} rechazado.`);
  }

  if (button.dataset.action === "delete") {
    const index = adminData.anticipos.findIndex((anticipo) => anticipo.id === id);
    if (index >= 0) {
      adminData.anticipos.splice(index, 1);
      adminCommon.setStatus(anticiposStatus, `Orden #${id} eliminada del mock.`);
    }
  }

  if (button.dataset.action === "create-order") {
    adminCommon.setStatus(anticiposStatus, "Nueva orden lista para conectar con backend.");
  }

  if (button.dataset.action === "message-client") {
    adminCommon.setStatus(anticiposStatus, `Mensaje preparado para cliente de la orden #${id}.`);
  }

  renderAnticipos();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-header-action]");
  if (!button) {
    return;
  }

  if (button.dataset.headerAction === "auto-check") {
    adminCommon.setStatus(anticiposStatus, "Verificacion automatica ejecutada en modo mock.");
  }

  if (button.dataset.headerAction === "upload-proof") {
    adminCommon.setStatus(anticiposStatus, "Carga de comprobantes lista para conectar.");
  }
});

function renderAnticipos() {
  const rowsMarkup = adminData.anticipos
    .map(
      (anticipo) => `
        <tr>
          <td class="verification-order-id">#${anticipo.id}</td>
          <td>${anticipo.cliente}</td>
          <td>
            <img class="verification-proof" src="${anticipo.whatsappProof}" alt="Comprobante cliente ${anticipo.id}">
          </td>
          <td>
            <img class="verification-proof" src="${anticipo.bankProof}" alt="Comprobante banco ${anticipo.id}">
          </td>
          <td class="verification-similarity">${anticipo.similarity}%</td>
          <td>
            <span class="status-badge ${adminCommon.normalizeStatusClass(anticipo.status)}">${adminCommon.formatStatus(anticipo.status)}</span>
          </td>
          <td>
            <div class="verification-actions">
              <button class="button primary" type="button" data-action="approve" data-id="${anticipo.id}">Aprobar</button>
              <button class="button danger" type="button" data-action="reject" data-id="${anticipo.id}">Rechazar</button>
              <button class="button secondary" type="button" data-action="message-client" data-id="${anticipo.id}">Escribir</button>
              <button class="button secondary" type="button" data-action="delete" data-id="${anticipo.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  anticiposContainer.innerHTML = `
    <article class="verification-card">
      <div class="block-header">
        <div>
          <h4>Tabla de verificacion visual</h4>
          <span class="block-copy">Comprobantes cliente y banco comparados en una sola fila operativa.</span>
        </div>
        <span class="section-badge">Pendientes: ${adminData.anticipos.filter((item) => item.status === "pendiente").length}</span>
      </div>
      <div class="verification-table-wrap">
        <table class="verification-table">
          <thead>
            <tr>
              <th>ID orden</th>
              <th>Cliente</th>
              <th>Comprobante cliente</th>
              <th>Comprobante banco</th>
              <th>Similitud</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rowsMarkup}
          </tbody>
        </table>
      </div>
    </article>
  `;
}
