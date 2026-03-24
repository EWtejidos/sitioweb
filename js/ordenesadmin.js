const ordenesContainer = document.getElementById("moduleContent");
const ordenesStatus = document.getElementById("statusBadge");
const ordenesTabs = document.querySelectorAll("[data-tab]");

let ordenesTabActual = "fase1";
const ordenesFiltros = { conFecha: true, sinFecha: true, asignado: true, noAsignado: true };

renderOrdenesTab();

ordenesTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    ordenesTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    ordenesTabActual = tab.dataset.tab;
    renderOrdenesTab();
  });
});

ordenesContainer.addEventListener("change", (event) => {
  if (!event.target.matches("[data-filter]")) {
    return;
  }

  ordenesFiltros[event.target.dataset.filter] = event.target.checked;
  renderOrdenesTab();
});

ordenesContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);

  if (button.dataset.action === "assign") {
    const item = adminData.preAsignacion.find((orden) => orden.id === id);
    if (item) {
      item.assigned = true;
      item.weaver = "Luisa Medina";
      adminCommon.setStatus(ordenesStatus, `Tejedora asignada a la orden #${id}.`);
    }
  }

  if (button.dataset.action === "edit-date") {
    const item = adminData.preAsignacion.find((orden) => orden.id === id);
    if (item) {
      item.fecha = item.fecha || "2026-04-02";
      adminCommon.setStatus(ordenesStatus, `Fecha actualizada para la orden #${id}.`);
    }
  }

  if (button.dataset.action === "message-weaver") {
    adminCommon.setStatus(ordenesStatus, `Mensaje listo: "Orden #${id} disponible, ¿puedes hacerla?"`);
  }

  if (button.dataset.action === "message-client") {
    adminCommon.setStatus(ordenesStatus, `Mensaje preparado para cliente de la orden #${id}.`);
  }

  if (button.dataset.action === "ready") {
    const item = adminData.produccion.find((orden) => orden.id === id);
    if (item) {
      item.status = "listo";
      adminCommon.setStatus(ordenesStatus, `Orden #${id} marcada como lista.`);
    }
  }

  if (button.dataset.action === "request-payment") {
    adminCommon.setStatus(ordenesStatus, `Solicitud de pago final enviada para la orden #${id}.`);
  }

  if (button.dataset.action === "approve-payment") {
    const item = adminData.pagoFinal.find((orden) => orden.id === id);
    if (item) {
      item.status = "aprobado";
      adminCommon.setStatus(ordenesStatus, `Pago final de la orden #${id} aprobado.`);
    }
  }

  if (button.dataset.action === "reject-payment") {
    const item = adminData.pagoFinal.find((orden) => orden.id === id);
    if (item) {
      item.status = "rechazado";
      adminCommon.setStatus(ordenesStatus, `Pago final de la orden #${id} rechazado.`);
    }
  }

  if (button.dataset.action === "send-transport") {
    adminCommon.setStatus(ordenesStatus, `Orden #${id} lista para pasar al modulo de transporte.`);
  }

  renderOrdenesTab();
});

function renderOrdenesTab() {
  const views = {
    fase1: renderFase1,
    fase2: renderFase2,
    fase3: renderFase3,
    fase4: renderFase4
  };

  ordenesContainer.innerHTML = views[ordenesTabActual]();
}

function renderFase1() {
  const ordenes = adminData.preAsignacion.filter((orden) => {
    const hasDate = Boolean(orden.fecha);
    const matchesDate = hasDate ? ordenesFiltros.conFecha : ordenesFiltros.sinFecha;
    const matchesAssigned = orden.assigned ? ordenesFiltros.asignado : ordenesFiltros.noAsignado;
    return matchesDate && matchesAssigned;
  });

  const markup = ordenes
    .map(
      (orden) => `
        <article class="record-card">
          <div class="record-main">
            <div class="record-title-row">
              <h4 class="record-title">Orden #${orden.id} · ${orden.producto}</h4>
              <span class="status-badge ${orden.assigned ? "aprobado" : "pendiente"}">${orden.assigned ? "asignado" : "no asignado"}</span>
            </div>
            <span class="record-meta">Cliente: ${orden.cliente} · Precio: ${orden.price}</span>
            <div class="inline-metrics">
              <span class="filter-chip">Fecha: ${orden.fecha || "Sin fecha"}</span>
              <span class="filter-chip">Tejedor: ${orden.weaver}</span>
            </div>
          </div>
          <div class="record-side">
            <div class="action-row">
              <button class="button primary" type="button" data-action="assign" data-id="${orden.id}">Asignar tejedor</button>
              <button class="button secondary" type="button" data-action="edit-date" data-id="${orden.id}">Editar fecha</button>
            </div>
          </div>
          <div class="record-actions">
            <button class="button secondary" type="button" data-action="message-weaver" data-id="${orden.id}">Escribir a tejedores</button>
            <button class="button secondary" type="button" data-action="message-client" data-id="${orden.id}">Escribir al cliente</button>
          </div>
        </article>
      `
    )
    .join("");

  return `
    <article class="section-card">
      <div class="section-topline">
        <div>
          <h4>Pre-asignacion</h4>
          <span class="mini-copy">Filtros visibles y accion directa sin salir de la pantalla.</span>
        </div>
        <div class="filter-row">
          <label class="filter-chip"><input type="checkbox" data-filter="conFecha" ${ordenesFiltros.conFecha ? "checked" : ""}> Con fecha</label>
          <label class="filter-chip"><input type="checkbox" data-filter="sinFecha" ${ordenesFiltros.sinFecha ? "checked" : ""}> Sin fecha</label>
          <label class="filter-chip"><input type="checkbox" data-filter="asignado" ${ordenesFiltros.asignado ? "checked" : ""}> Asignado</label>
          <label class="filter-chip"><input type="checkbox" data-filter="noAsignado" ${ordenesFiltros.noAsignado ? "checked" : ""}> No asignado</label>
        </div>
      </div>
      <div class="record-list">${markup}</div>
    </article>
  `;
}

function renderFase2() {
  return `
    <article class="section-card">
      <div class="section-topline">
        <div>
          <h4>Produccion</h4>
          <span class="mini-copy">Inicio, entrega y estado visibles con acciones directas.</span>
        </div>
      </div>
      <div class="record-list">
        ${adminData.produccion
          .map(
            (orden) => `
              <article class="record-card production-card">
                <div class="record-main">
                  <div class="record-title-row">
                    <h4 class="record-title">Orden #${orden.id} · ${orden.producto}</h4>
                    <span class="status-badge ${adminCommon.normalizeStatusClass(orden.status)}">${adminCommon.formatStatus(orden.status)}</span>
                  </div>
                  <span class="record-meta">Cliente: ${orden.cliente} · Tejedor: ${orden.weaver}</span>
                  <div class="production-dates">
                    <span>Inicio: ${orden.startDate}</span>
                    <span>Entrega: ${orden.deliveryDate}</span>
                  </div>
                </div>
                <div class="record-actions">
                  <button class="button primary" type="button" data-action="ready" data-id="${orden.id}">Marcar como listo</button>
                  <button class="button warning" type="button" data-action="request-payment" data-id="${orden.id}">Solicitar pago final</button>
                  <button class="button secondary" type="button" data-action="message-client" data-id="${orden.id}">Escribir al cliente</button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderFase3() {
  return `
    <article class="section-card">
      <div class="section-topline">
        <div>
          <h4>Pago final</h4>
          <span class="mini-copy">Validacion del comprobante final antes de liberar despacho.</span>
        </div>
      </div>
      <div class="record-list">
        ${adminData.pagoFinal
          .map(
            (pago) => `
              <article class="record-card">
                <div class="record-main">
                  <div class="record-title-row">
                    <h4 class="record-title">Orden #${pago.id}</h4>
                    <span class="status-badge ${adminCommon.normalizeStatusClass(pago.status)}">${adminCommon.formatStatus(pago.status)}</span>
                  </div>
                  <span class="record-meta">Cliente: ${pago.cliente} · Pago final ${pago.amount}</span>
                  <span class="muted">${pago.validated}</span>
                </div>
                <div class="record-side">
                  <div class="evidence-card">
                    <span class="evidence-label">Comprobante cliente</span>
                    <img class="evidence-image" src="${pago.proof}" alt="Comprobante pago final">
                  </div>
                </div>
                <div class="record-actions">
                  <button class="button primary" type="button" data-action="approve-payment" data-id="${pago.id}">Aprobar pago</button>
                  <button class="button danger" type="button" data-action="reject-payment" data-id="${pago.id}">Rechazar</button>
                  <button class="button secondary" type="button" data-action="message-client" data-id="${pago.id}">Escribir cliente</button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderFase4() {
  return `
    <article class="section-card">
      <div class="section-topline">
        <div>
          <h4>Cierre y despacho</h4>
          <span class="mini-copy">Ultimo control antes de pasar al modulo de transporte.</span>
        </div>
      </div>
      <div class="record-list">
        ${adminData.cierre
          .map(
            (orden) => `
              <article class="record-card">
                <div class="record-main">
                  <div class="record-title-row">
                    <h4 class="record-title">Orden #${orden.id} · ${orden.producto}</h4>
                    <span class="status-badge pendiente">${orden.estado}</span>
                  </div>
                  <span class="record-meta">Cliente: ${orden.cliente}</span>
                  <span class="muted">${orden.checklist}</span>
                </div>
                <div class="record-actions">
                  <button class="button primary" type="button" data-action="send-transport" data-id="${orden.id}">Pasar a transporte</button>
                  <button class="button secondary" type="button" data-action="message-client" data-id="${orden.id}">Escribir cliente</button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}
