const anticiposContainer = document.getElementById("moduleContent");
const anticiposStatus = document.getElementById("statusBadge");

let anticipos = [];
let showBulkUploadHelp = false;
const uploadingReferenceIds = new Set();

renderAnticipos();
loadAnticipos();

anticiposContainer.addEventListener("change", (event) => {
  const input = event.target.closest("[data-reference-input]");
  if (!input || !input.files || !input.files.length) {
    return;
  }

  handleSingleReferenceUpload(input.dataset.id, input.files[0]);
  input.value = "";
});

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

  if (button.dataset.action === "upload-reference") {
    const input = document.getElementById(`reference-input-${item.id}`);
    if (input) {
      input.click();
    }
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
    showBulkUploadHelp = true;
    renderAnticipos();
    adminCommon.setStatus(anticiposStatus, "Usa el boton Subir de cada fila en la columna Referencia para escoger una imagen desde tu PC.");
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
  // Esta referencia es manual y exclusiva del panel admin.
  const referenceImage = normalizeImagePath(order.reference_image, "");

  return {
    id: order.id,
    orderCode: order.order_code || `#${order.id}`,
    cliente: order.cliente || "Cliente sin nombre",
    whatsappProof: normalizeImagePath(order.payment_proof),
    referenceImage,
    similarity: referenceImage ? 100 : 0,
    status: referenceImage ? "aprobado" : "pendiente",
    total: formatCurrency(order.anticipo),
    referencia: order.producto || "Pedido personalizado"
  };
}

function normalizeImagePath(path, fallback = "images/products/top.jpg") {
  if (!path) {
    return fallback;
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
            ${renderReferenceCell(anticipo)}
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
      ${showBulkUploadHelp ? `
        <div class="reference-upload-banner">
          <strong>Subida de referencias desde PC</strong>
          <p>Cada fila tiene su propio boton Subir. Haz clic en ese boton dentro de la columna Referencia, elige una imagen desde tu PC y la vista previa aparecera en esa misma celda.</p>
        </div>
      ` : ""}
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

function renderReferenceCell(anticipo) {
  if (anticipo.referenceImage) {
    return `
      <div class="reference-slot has-image" title="${anticipo.referencia}">
        <img class="verification-proof" src="${anticipo.referenceImage}" alt="Referencia visual ${anticipo.orderCode}">
      </div>
    `;
  }

  const isUploading = uploadingReferenceIds.has(String(anticipo.id));
  return `
    <div class="reference-slot is-empty">
      <button class="button secondary reference-upload-button" type="button" data-action="upload-reference" data-id="${anticipo.id}" ${isUploading ? "disabled" : ""}>${isUploading ? "Subiendo..." : "Subir"}</button>
      <input class="reference-file-input" id="reference-input-${anticipo.id}" type="file" accept="image/*" data-reference-input data-id="${anticipo.id}" hidden>
      <span class="reference-placeholder">Esperando imagen</span>
    </div>
  `;
}

async function handleSingleReferenceUpload(orderId, file) {
  const anticipo = anticipos.find((item) => String(item.id) === String(orderId));
  if (!anticipo) {
    adminCommon.setStatus(anticiposStatus, "No se encontro la fila para cargar la referencia.");
    return;
  }

  uploadingReferenceIds.add(String(orderId));
  renderAnticipos();

  try {
    // Envia una sola imagen y la amarra a la orden seleccionada.
    const formData = new FormData();
    formData.append("order_id", String(orderId));
    formData.append("reference_image", file);

    const response = await fetch("/api/admin/orders/reference-image", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const updatedOrder = await response.json();
    updateAnticipoFromOrder(updatedOrder);
    adminCommon.setStatus(anticiposStatus, `Referencia cargada para la orden ${anticipo.orderCode}.`);
  } catch (error) {
    console.error("No fue posible subir la referencia", error);
    adminCommon.setStatus(anticiposStatus, `No fue posible subir la referencia para la orden ${anticipo.orderCode}.`);
  } finally {
    uploadingReferenceIds.delete(String(orderId));
    renderAnticipos();
  }
}

function updateAnticipoFromOrder(order) {
  // Reemplaza la fila actual con la respuesta mas reciente del backend.
  const updatedAnticipo = mapAnticipoForView(order);
  anticipos = anticipos.map((item) => (String(item.id) === String(order.id) ? updatedAnticipo : item));
}
