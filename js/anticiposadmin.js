const anticiposContainer = document.getElementById("moduleContent");
const anticiposStatus = document.getElementById("statusBadge");

let anticipos = [];
let showBulkUploadHelp = false;
const uploadingReferenceIds = new Set();
const ANTICIPO_REJECT_TEMPLATE = "Estimado cliente el anticipo no concuerda con lo recibido. Si desea subirlo nuevamente escriba anticipo+{orderId}.";
let activePreview = null;
let rejectModalOrderId = null;

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
  const previewImage = event.target.closest("[data-preview-image]");

  if (previewImage) {
    openImagePreview(previewImage.dataset.previewImage, previewImage.alt || "Vista previa");
    return;
  }

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
    handleApprove(item);
  }

  if (button.dataset.action === "reject") {
    openRejectModal(item);
  }

  if (button.dataset.action === "delete-reference") {
    handleDeleteReference(item);
  }
});

document.addEventListener("click", (event) => {
  const previewClose = event.target.closest("[data-preview-close]");
  const rejectClose = event.target.closest("[data-reject-close]");
  const rejectCopy = event.target.closest("[data-reject-copy]");

  if (previewClose || event.target.classList.contains("image-preview-overlay")) {
    closeImagePreview();
    return;
  }

  if (rejectClose || event.target.classList.contains("reject-modal-overlay")) {
    closeRejectModal();
    return;
  }

  if (rejectCopy) {
    handleRejectCopy();
    return;
  }

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
      .filter((order) => Boolean(order.payment_proof) || ["comprado", "anticipo_pendiente", "rechazado"].includes(order.status))
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
  const isApproved = order.status === "comprado";
  const isRejected = order.status === "rechazado";
  const similarity = isApproved ? 100 : 0;
  const status = isApproved ? "aprobado" : (isRejected ? "rechazado" : "pendiente");

  return {
    id: order.id,
    businessOrderId: order.id_orden || order.order_code || `#${order.id}`,
    orderCode: order.order_code || `#${order.id}`,
    waId: order.wa_id || "",
    cliente: order.cliente || "Cliente sin nombre",
    whatsappProof: normalizeImagePath(order.payment_proof),
    referenceImage,
    similarity,
    status,
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
            <img class="verification-proof is-clickable" src="${anticipo.whatsappProof}" alt="Comprobante cliente ${anticipo.orderCode}" data-preview-image="${anticipo.whatsappProof}">
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
  ` + renderImagePreviewModal() + renderRejectModal();
}

function renderReferenceCell(anticipo) {
  if (anticipo.referenceImage) {
    return `
      <div class="reference-slot has-image" title="${anticipo.referencia}">
        <img class="verification-proof is-clickable" src="${anticipo.referenceImage}" alt="Referencia visual ${anticipo.orderCode}" data-preview-image="${anticipo.referenceImage}">
        <button class="reference-delete-button" type="button" data-action="delete-reference" data-id="${anticipo.id}" aria-label="Eliminar referencia">🗑</button>
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
    // Envia una sola imagen al endpoint explicito del pedido y la persiste en BD.
    const formData = new FormData();
    formData.append("foto", file);

    const response = await fetch(`/api/upload-reference/${orderId}`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const payload = await response.json();
        if (payload.error) {
          message = payload.error;
        }
      } catch (parseError) {
        console.error("No fue posible leer el error de subida", parseError);
      }
      throw new Error(message);
    }

    adminCommon.setStatus(anticiposStatus, `Referencia cargada para la orden ${anticipo.orderCode}. Recargando datos...`);
    await loadAnticipos();
  } catch (error) {
    console.error("No fue posible subir la referencia", error);
    adminCommon.setStatus(anticiposStatus, `No fue posible subir la referencia para la orden ${anticipo.orderCode}: ${error.message}`);
  } finally {
    uploadingReferenceIds.delete(String(orderId));
    renderAnticipos();
  }
}

function renderImagePreviewModal() {
  if (!activePreview) {
    return "";
  }

  return `
    <div class="image-preview-overlay">
      <div class="image-preview-dialog" role="dialog" aria-modal="true" aria-label="Vista ampliada de imagen">
        <button class="preview-close-button" type="button" data-preview-close aria-label="Cerrar vista previa">×</button>
        <img class="image-preview-full" src="${activePreview.src}" alt="${activePreview.alt}">
      </div>
    </div>
  `;
}

function renderRejectModal() {
  if (!rejectModalOrderId) {
    return "";
  }

  const anticipo = anticipos.find((item) => String(item.id) === String(rejectModalOrderId));
  if (!anticipo) {
    return "";
  }

  const message = ANTICIPO_REJECT_TEMPLATE.replace("{orderId}", anticipo.businessOrderId);

  return `
    <div class="reject-modal-overlay">
      <div class="reject-modal-card" role="dialog" aria-modal="true" aria-label="Mensaje de rechazo de anticipo">
        <button class="preview-close-button" type="button" data-reject-close aria-label="Cerrar mensaje">×</button>
        <h4>Rechazo de anticipo</h4>
        <p><strong>Cliente:</strong> ${anticipo.cliente}</p>
        <p><strong>Numero:</strong> ${anticipo.waId || "Sin numero registrado"}</p>
        <p>${message}</p>
        <div class="reject-modal-actions">
          <button class="button primary" type="button" data-reject-copy>Copiar</button>
        </div>
      </div>
    </div>
  `;
}

function openImagePreview(src, alt) {
  activePreview = { src, alt };
  renderAnticipos();
}

function closeImagePreview() {
  if (!activePreview) {
    return;
  }

  activePreview = null;
  renderAnticipos();
}

function openRejectModal(anticipo) {
  rejectModalOrderId = anticipo.id;
  renderAnticipos();
}

function closeRejectModal() {
  if (!rejectModalOrderId) {
    return;
  }

  rejectModalOrderId = null;
  renderAnticipos();
}

async function handleApprove(anticipo) {
  if (!anticipo.referenceImage) {
    adminCommon.setStatus(anticiposStatus, `Debes subir una referencia para la orden ${anticipo.orderCode} antes de aprobarla.`);
    return;
  }

  try {
    const response = await fetch(`/api/admin/orders/${anticipo.id}/approve-anticipo`, {
      method: "POST",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw await buildRequestError(response);
    }

    adminCommon.setStatus(anticiposStatus, `Anticipo de la orden ${anticipo.orderCode} aprobado con 100% de validacion.`);
    await loadAnticipos();
  } catch (error) {
    console.error("No fue posible aprobar el anticipo", error);
    adminCommon.setStatus(anticiposStatus, `No fue posible aprobar la orden ${anticipo.orderCode}: ${error.message}`);
  }
}

async function handleDeleteReference(anticipo) {
  try {
    const response = await fetch(`/api/admin/orders/${anticipo.id}/reference-image`, {
      method: "DELETE",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw await buildRequestError(response);
    }

    adminCommon.setStatus(anticiposStatus, `Referencia eliminada para la orden ${anticipo.orderCode}.`);
    await loadAnticipos();
  } catch (error) {
    console.error("No fue posible eliminar la referencia", error);
    adminCommon.setStatus(anticiposStatus, `No fue posible eliminar la referencia de la orden ${anticipo.orderCode}: ${error.message}`);
  }
}

async function handleRejectCopy() {
  const anticipo = anticipos.find((item) => String(item.id) === String(rejectModalOrderId));
  if (!anticipo) {
    closeRejectModal();
    return;
  }

  const message = ANTICIPO_REJECT_TEMPLATE.replace("{orderId}", anticipo.businessOrderId);

  try {
    await copyToClipboard(message);

    const response = await fetch(`/api/admin/orders/${anticipo.id}/reject-anticipo`, {
      method: "POST",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw await buildRequestError(response);
    }

    closeRejectModal();
    adminCommon.setStatus(anticiposStatus, `Mensaje copiado y anticipo rechazado para la orden ${anticipo.orderCode}.`);
    await loadAnticipos();
  } catch (error) {
    console.error("No fue posible rechazar el anticipo", error);
    adminCommon.setStatus(anticiposStatus, `No fue posible copiar o rechazar la orden ${anticipo.orderCode}: ${error.message}`);
  }
}

async function buildRequestError(response) {
  let message = `HTTP ${response.status}`;

  try {
    const payload = await response.json();
    if (payload.error) {
      message = payload.error;
    }
  } catch (error) {
    console.error("No fue posible leer la respuesta del servidor", error);
  }

  return new Error(message);
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  tempTextArea.setAttribute("readonly", "");
  tempTextArea.style.position = "absolute";
  tempTextArea.style.left = "-9999px";
  document.body.appendChild(tempTextArea);
  tempTextArea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(tempTextArea);

  if (!copied) {
    throw new Error("No se pudo copiar el mensaje.");
  }
}
