const anticiposContainer = document.getElementById("moduleContent");
const anticiposStatus = document.getElementById("statusBadge");

let anticipos = [];

renderAnticipos();
loadAnticipos();

anticiposContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const item = anticipos.find((anticipo) => String(anticipo.id) === id);
  if (!item) {
    adminCommon.setStatus(anticiposStatus, "No se encontro la orden seleccionada.");
    return;
  }

  if (button.dataset.action === "approve") {
    adminCommon.setStatus(anticiposStatus, `Anticipo de la orden ${item.orderCode} listo para validacion operativa.`);
  }

  if (button.dataset.action === "reject") {
    adminCommon.setStatus(anticiposStatus, `Anticipo de la orden ${item.orderCode} marcado para revision manual.`);
  }

  if (button.dataset.action === "delete") {
    adminCommon.setStatus(anticiposStatus, `Orden ${item.orderCode} marcada para depuracion administrativa.`);
  }

  if (button.dataset.action === "message-client") {
    adminCommon.setStatus(anticiposStatus, `Mensaje preparado para ${item.cliente} sobre la orden ${item.orderCode}.`);
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-header-action]");
  if (!button) {
    return;
  }

  if (button.dataset.headerAction === "auto-check") {
    adminCommon.setStatus(anticiposStatus, "Verificacion automatica lista para conectarse con tu flujo bancario.");
  }

  if (button.dataset.headerAction === "upload-proof") {
    adminCommon.setStatus(anticiposStatus, "Carga manual lista para una siguiente integracion.");
  }
});

async function loadAnticipos() {
  adminCommon.setStatus(anticiposStatus, "Cargando anticipos reales...");

  try {
    const response = await fetch("/api/admin/orders", {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const orders = await response.json();
    anticipos = orders
      .filter((order) => Boolean(order.payment_proof) || order.status === "comprado")
      .map(mapAnticipoForView);

    renderAnticipos();
    adminCommon.setStatus(anticiposStatus, `${anticipos.length} anticipos cargados desde la base de datos.`);
  } catch (error) {
    console.error("No fue posible cargar los anticipos", error);
    anticipos = [];
    renderAnticipos();
    adminCommon.setStatus(anticiposStatus, "No fue posible cargar los anticipos desde el backend.");
  }
}

function mapAnticipoForView(order) {
  return {
    id: order.id,
    orderCode: order.order_code || `#${order.id}`,
    cliente: order.cliente || "Cliente sin nombre",
    whatsappProof: normalizeImagePath(order.payment_proof),
    bankProof: "images/products/flor.jpg",
    similarity: order.status === "comprado" ? 100 : 0,
    status: order.status === "comprado" ? "pendiente" : "sin-comprobante",
    total: formatCurrency(order.anticipo),
    referencia: order.producto || "Pedido personalizado"
  };
}

function normalizeImagePath(path) {
  if (!path) {
    return "images/products/top.jpg";
  }

  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Sin valor";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function renderAnticipos() {
  const rowsMarkup = anticipos
    .map(
      (anticipo) => `
        <tr>
          <td class="verification-order-id">${anticipo.orderCode}</td>
          <td>${anticipo.cliente}</td>
          <td>
            <img class="verification-proof" src="${anticipo.whatsappProof}" alt="Comprobante cliente ${anticipo.orderCode}">
          </td>
          <td>
            <img class="verification-proof" src="${anticipo.bankProof}" alt="Referencia visual ${anticipo.orderCode}">
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
              <button class="button secondary" type="button" data-action="delete" data-id="${anticipo.id}">Marcar</button>
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
          <span class="block-copy">Comprobantes del bot y datos de la orden reunidos en una sola vista.</span>
        </div>
        <span class="section-badge">Pendientes: ${anticipos.filter((item) => item.status === "pendiente").length}</span>
      </div>
      <div class="verification-table-wrap">
        <table class="verification-table">
          <thead>
            <tr>
              <th>ID orden</th>
              <th>Cliente</th>
              <th>Comprobante cliente</th>
              <th>Referencia</th>
              <th>Similitud</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rowsMarkup || `
              <tr>
                <td colspan="7">No hay anticipos registrados todavia.</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </article>
  `;
}
