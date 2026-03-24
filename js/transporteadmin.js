const transporteContainer = document.getElementById("moduleContent");
const transporteStatus = document.getElementById("statusBadge");
const transporteTabs = document.querySelectorAll("[data-tab]");

let transporteTabActual = "entregas";

renderTransporteTab();

transporteTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    transporteTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    transporteTabActual = tab.dataset.tab;
    renderTransporteTab();
  });
});

transporteContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  if (button.dataset.action === "message-carrier") {
    adminCommon.setStatus(transporteStatus, `Mensaje listo para ${button.dataset.name}.`);
  }

  if (button.dataset.action === "mark-delivered") {
    const item = adminData.ordenesEntrega.find((orden) => orden.id === Number(button.dataset.id));
    if (item) {
      item.estado = "entregado";
      adminCommon.setStatus(transporteStatus, `Entrega confirmada para la orden #${button.dataset.id}.`);
    }
  }

  renderTransporteTab();
});

function renderTransporteTab() {
  const views = {
    entregas: `
      <article class="admin-block glow">
        <div class="block-header">
          <div><h4>Entregas proximas</h4><span class="block-copy">Urgente primero.</span></div>
        </div>
        <div class="urgent-list">
          ${adminData.entregasProximas
            .map(
              (entrega) => `
                <article class="urgent-item">
                  <div class="transport-meta">
                    <strong class="urgent-title">Orden #${entrega.id}</strong>
                    <span class="priority-badge ${adminCommon.normalizeStatusClass(entrega.prioridad)}">${adminCommon.formatStatus(entrega.prioridad)}</span>
                  </div>
                  <span class="mini-copy">${entrega.cliente} · ${entrega.destino}</span>
                  <span class="mini-copy">Fecha: ${entrega.fecha}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </article>
    `,
    transportistas: `
      <article class="admin-block">
        <div class="block-header">
          <div><h4>Transportistas</h4><span class="block-copy">Carga visible y accion rapida.</span></div>
        </div>
        <div class="transport-cards">
          ${adminData.transportistas
            .map(
              (item) => `
                <article class="transport-card">
                  <div class="transport-meta">
                    <strong>${item.nombre}</strong>
                    <span class="priority-badge ${adminCommon.normalizeStatusClass(item.disponibilidad)}">${adminCommon.formatStatus(item.disponibilidad)}</span>
                  </div>
                  <span class="transport-load">${item.pedidos} pedidos asignados</span>
                  <span class="mini-copy">${item.telefono}</span>
                  <button class="button secondary" type="button" data-action="message-carrier" data-name="${item.nombre}">Escribir transportista</button>
                </article>
              `
            )
            .join("")}
        </div>
      </article>
    `,
    "en-entrega": `
      <article class="admin-block">
        <div class="block-header">
          <div><h4>Ordenes en entrega</h4><span class="block-copy">Seguimiento final con evidencia.</span></div>
        </div>
        <div class="record-list">
          ${adminData.ordenesEntrega
            .map(
              (orden) => `
                <article class="record-card delivery-card">
                  <div class="record-main">
                    <div class="record-title-row">
                      <h4 class="record-title">Orden #${orden.id} · ${orden.producto}</h4>
                      <span class="status-badge ${adminCommon.normalizeStatusClass(orden.estado)}">${adminCommon.formatStatus(orden.estado)}</span>
                    </div>
                    <span class="record-meta">Cliente: ${orden.cliente}</span>
                    <span class="muted">Transportista: ${orden.transportista}</span>
                  </div>
                  <div class="record-side">
                    <img class="delivery-proof" src="${orden.proof}" alt="Confirmacion entrega">
                  </div>
                  <div class="record-actions">
                    <button class="button primary" type="button" data-action="mark-delivered" data-id="${orden.id}">Marcar entregado</button>
                    <button class="button secondary" type="button" data-action="message-carrier" data-name="${orden.transportista}">Escribir transportista</button>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </article>
    `
  };

  transporteContainer.innerHTML = views[transporteTabActual];
}
