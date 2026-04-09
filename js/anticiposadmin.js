// ================= PROCESO 1: CONFIGURACION Y ESTADO =================
const anticiposContainer = document.getElementById("moduleContent");
const anticiposStatus = document.getElementById("statusBadge");
const pendingBadge = document.getElementById("pendingBadge");
const referenceUploadBanner = document.getElementById("referenceUploadBanner");
const anticiposTableBody = document.getElementById("anticiposTableBody");
const modalHost = document.getElementById("anticiposModalHost");

const templates = {
  row: document.getElementById("anticipoRowTemplate"),
  reference: document.getElementById("referenceCellTemplate"),
  empty: document.getElementById("emptyAnticiposRowTemplate"),
  preview: document.getElementById("imagePreviewModalTemplate"),
  reject: document.getElementById("rejectModalTemplate"),
  edit: document.getElementById("editModalTemplate")
};

const ANTICIPO_REJECT_TEMPLATE = "Estimado cliente el anticipo no concuerda con lo recibido. Si desea subirlo nuevamente escriba anticipo+{orderId}.";

const AppState = {
  data: {
    anticipos: [],
    uploadingReferenceIds: new Set()
  },
  ui: {
    showBulkUploadHelp: false,
    activeModal: null,
    activePreview: null,
    rejectModalOrderId: null,
    editModalOrder: null
  }
};

// ================= PROCESO 2: CARGA DE DATOS (COMUNICACION API) =================
// ================= FUNCION ASINCRONA (como async en Python) =================
async function loadAnticipos() {
  adminCommon.setStatus(anticiposStatus, "Cargando anticipos reales...");

  try {
    // Hace una peticion HTTP (similar a requests.get en Python)
    const response = await fetch("/api/admin/orders", { headers: { Accept: "application/json" } });
    if (!response.ok) throw await buildRequestError(response);

    // Convierte la respuesta a JSON (como response.json() en Python)
    const payload = await response.json();
    const orders = Array.isArray(payload) ? payload : (payload.orders || []);

    AppState.data.anticipos = orders
      .filter((order) => Boolean(order.payment_proof) || ["comprado", "anticipo_pendiente", "rechazado"].includes(order.status))
      .map(mapAnticipoForView);

    renderAnticipos();
    adminCommon.setStatus(anticiposStatus, `${AppState.data.anticipos.length} anticipos cargados desde la base de datos.`);
  } catch (error) {
    console.error("No fue posible cargar los anticipos", error);
    AppState.data.anticipos = [];
    renderAnticipos();
    adminCommon.setStatus(anticiposStatus, "No fue posible cargar los anticipos desde el backend.");
  }
}

// ================= TRANSFORMA DATOS PARA LA VISTA =================
function mapAnticipoForView(order) {
  const referenceImage = normalizeImagePath(order.reference_image, "");
  const isApproved = order.status === "comprado";
  const isRejected = order.status === "rechazado";
  const status = isApproved ? "aprobado" : (isRejected ? "rechazado" : "pendiente");

  // Retorna un objeto nuevo (como crear un dict en Python)
  return {
    id: order.id,
    businessOrderId: order.id_orden || `#${order.id}`,
    orderCode: order.id_orden || `#${order.id}`,
    waId: order.wa_id || "",
    cliente: order.cliente || order.full_name || "Cliente sin nombre",
    whatsappProof: normalizeImagePath(order.payment_proof),
    referenceImage,
    similarity: isApproved ? 100 : 0,
    status,
    total: formatCurrency(order.anticipo),
    referencia: order.producto || order.product_name || "Pedido personalizado",
    anticipo: order.anticipo,
    product_image: normalizeImagePath(order.product_image, ""),
    advance_payment: order.advance_payment,
    id_orden: order.id_orden,
    product_type: order.product_type,
    product_name: order.product_name,
    colors: order.colors,
    length_cm: order.length_cm,
    width_cm: order.width_cm,
    description: order.description,
    full_name: order.full_name,
    delivery: order.delivery,
    date: order.date,
    deadline: order.deadline,
    quote_min: order.quote_min,
    quote_max: order.quote_max
  };
}

// ================= PROCESO 3: RENDERIZADO (DIBUJO EN PANTALLA) =================
function renderAnticipos() {
  const pendingCount = AppState.data.anticipos.filter((item) => item.status === "pendiente").length;
  pendingBadge.textContent = `Pendientes: ${pendingCount}`;
  referenceUploadBanner.hidden = !AppState.ui.showBulkUploadHelp;
  anticiposTableBody.replaceChildren();

  if (!AppState.data.anticipos.length) {
    anticiposTableBody.appendChild(cloneTemplate(templates.empty));
    renderFloatingModals();
    return;
  }

  // Recorre el array como un for/list comprehension en Python
  AppState.data.anticipos.forEach((anticipo) => anticiposTableBody.appendChild(renderAnticipoRow(anticipo)));
  renderFloatingModals();
}

function renderAnticipoRow(anticipo) {
  const row = cloneTemplate(templates.row);
  row.querySelector(".row-select").dataset.id = anticipo.id;
  row.querySelector("[data-role='order-code']").textContent = anticipo.orderCode;
  row.querySelector("[data-role='cliente']").textContent = anticipo.cliente;

  const proofImage = row.querySelector("[data-role='proof-image']");
  proofImage.src = anticipo.whatsappProof;
  proofImage.alt = `Comprobante cliente ${anticipo.orderCode}`;
  proofImage.dataset.previewImage = anticipo.whatsappProof;

  row.querySelector("[data-role='reference-cell']").replaceChildren(renderReferenceCell(anticipo));
  row.querySelector("[data-role='similarity']").textContent = `${anticipo.similarity}%`;

  const statusBadge = row.querySelector("[data-role='status-badge']");
  statusBadge.className = `status-badge ${adminCommon.normalizeStatusClass(anticipo.status)}`;
  statusBadge.textContent = adminCommon.formatStatus(anticipo.status);

  row.querySelectorAll("[data-action]").forEach((button) => { button.dataset.id = anticipo.id; });
  return row;
}

function renderReferenceCell(anticipo) {
  const cell = cloneTemplate(templates.reference);
  const previewHost = cell.querySelector("[data-role='reference-preview']");
  const input = cell.querySelector("[data-reference-input]");
  const uploadButton = cell.querySelector("[data-action='upload-reference']");
  const deleteButton = cell.querySelector("[data-action='delete-reference']");
  const isUploading = AppState.data.uploadingReferenceIds.has(String(anticipo.id));

  input.id = `reference-input-${anticipo.id}`;
  input.dataset.id = anticipo.id;
  uploadButton.dataset.id = anticipo.id;
  deleteButton.dataset.id = anticipo.id;

  if (isUploading) {
    previewHost.textContent = "Subiendo referencia...";
    uploadButton.disabled = true;
    deleteButton.disabled = true;
    return cell;
  }

  if (anticipo.referenceImage) {
    const image = document.createElement("img");
    image.className = "verification-proof is-clickable";
    image.src = anticipo.referenceImage;
    image.alt = `Referencia ${anticipo.orderCode}`;
    image.dataset.previewImage = anticipo.referenceImage;
    previewHost.appendChild(image);
    deleteButton.disabled = false;
  } else {
    previewHost.textContent = "Sin referencia";
    deleteButton.disabled = true;
  }

  return cell;
}

function renderFloatingModals() {
  modalHost.replaceChildren();
  [renderImagePreviewModal(), renderRejectModal(), renderEditModal()].filter(Boolean).forEach((modal) => modalHost.appendChild(modal));
}

// ================= MODAL DE VISTA PREVIA DE IMAGEN =================
function renderImagePreviewModal() {
  if (!AppState.ui.activePreview) return null;
  const modal = cloneTemplate(templates.preview);
  const image = modal.querySelector("[data-role='preview-image']");
  image.src = AppState.ui.activePreview.src;
  image.alt = AppState.ui.activePreview.alt;
  return modal;
}

// ================= MODAL DE RECHAZO =================
function renderRejectModal() {
  if (!AppState.ui.rejectModalOrderId) return null;
  const anticipo = getAnticipoById(AppState.ui.rejectModalOrderId);
  if (!anticipo) return null;

  const modal = cloneTemplate(templates.reject);
  const message = ANTICIPO_REJECT_TEMPLATE.replace("{orderId}", anticipo.businessOrderId);
  modal.querySelector("[data-role='cliente']").textContent = anticipo.cliente;
  modal.querySelector("[data-role='wa-id']").textContent = anticipo.waId || "Sin numero registrado";
  modal.querySelector("[data-role='reject-message']").textContent = message;
  return modal;
}

// ================= MODAL DE EDICION =================
function renderEditModal() {
  if (!AppState.ui.editModalOrder) return null;
  const anticipo = AppState.ui.editModalOrder;
  const modal = cloneTemplate(templates.edit);
  const form = modal.querySelector("#editOrderForm");

  modal.querySelector("[data-role='edit-title']").textContent = `Editar Orden ${anticipo.orderCode}`;
  form.elements.id_orden.value = anticipo.id_orden || "";
  form.elements.product_type.value = anticipo.product_type || "";
  form.elements.product_name.value = anticipo.product_name || "";
  form.elements.colors.value = anticipo.colors || "";
  form.elements.length_cm.value = anticipo.length_cm || "";
  form.elements.width_cm.value = anticipo.width_cm || "";
  form.elements.description.value = anticipo.description || "";
  form.elements.full_name.value = anticipo.full_name || "";
  form.elements.delivery.value = anticipo.delivery || "";
  form.elements.date.value = anticipo.date || "";
  form.elements.deadline.value = anticipo.deadline || "";
  form.elements.quote_min.value = anticipo.quote_min || "";
  form.elements.quote_max.value = anticipo.quote_max || "";
  return modal;
}

// ================= PROCESO 4: MANEJADORES DE EVENTOS (INTERACCION) =================
function bindEventListeners() {
  anticiposContainer.addEventListener("change", handleContainerChange);
  anticiposContainer.addEventListener("click", handleContainerClick);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("submit", handleDocumentSubmit);
}

// Se queda esperando a que selecciones un archivo, como un listener en Python/GUI
function handleContainerChange(event) {
  const input = event.target.closest("[data-reference-input]");
  if (!input || !input.files || !input.files.length) return;

  // closest se asegura de que sea el input correcto
  handleSingleReferenceUpload(input.dataset.id, input.files[0]);
  input.value = "";
}

function handleContainerClick(event) {
  const previewImage = event.target.closest("[data-preview-image]");
  if (previewImage) {
    openImagePreview(previewImage.dataset.previewImage, previewImage.alt || "Vista previa");
    return;
  }

  const rowButton = event.target.closest("[data-action]");
  if (rowButton) {
    const item = getAnticipoById(rowButton.dataset.id);
    if (!item) {
      adminCommon.setStatus(anticiposStatus, "No se encontro la orden seleccionada.");
      return;
    }

    if (rowButton.dataset.action === "upload-reference") {
      const input = document.getElementById(`reference-input-${item.id}`);
      if (input) input.click();
      return;
    }
    if (rowButton.dataset.action === "approve") return void handleApprove(item);
    if (rowButton.dataset.action === "edit") return void openEditModal(item);
    if (rowButton.dataset.action === "reject") return void openRejectModal(item);
    if (rowButton.dataset.action === "delete-reference") return void handleDeleteReference(item);
  }

  const globalButton = event.target.closest("[data-global-action]");
  if (globalButton) {
    if (globalButton.dataset.globalAction === "delete-selected") handleDeleteSelected();
    if (globalButton.dataset.globalAction === "export-csv") handleExportCSV();
    return;
  }

  const selectAll = event.target.closest("#select-all");
  if (selectAll) {
    anticiposContainer.querySelectorAll(".row-select").forEach((checkbox) => { checkbox.checked = selectAll.checked; });
  }
}

function handleDocumentClick(event) {
  const headerButton = event.target.closest("[data-header-action]");
  if (event.target.closest("[data-preview-close]") || event.target.classList.contains("image-preview-overlay")) return void closeImagePreview();
  if (event.target.closest("[data-reject-close]") || event.target.classList.contains("reject-modal-overlay")) return void closeRejectModal();
  if (event.target.closest("[data-reject-copy]")) return void handleRejectCopy();
  if (event.target.closest("[data-edit-close]") || event.target.classList.contains("edit-modal-overlay")) return void closeEditModal();
  if (!headerButton) return;

  if (headerButton.dataset.headerAction === "auto-check") {
    adminCommon.setStatus(anticiposStatus, "Verificacion automatica lista para conectarse con tu flujo bancario.");
  }
  if (headerButton.dataset.headerAction === "upload-proof") {
    AppState.ui.showBulkUploadHelp = true;
    renderAnticipos();
    adminCommon.setStatus(anticiposStatus, "Usa el boton Subir de cada fila en la columna Referencia para escoger una imagen desde tu PC.");
  }
}

function handleDocumentSubmit(event) {
  const editForm = event.target.closest("#editOrderForm");
  if (!editForm) return;
  event.preventDefault();
  handleEditSave();
}

// ================= PROCESO 5: ACCIONES LOGICAS (EL TRABAJO PESADO) =================
// Funcion async/await equivalente a una corrutina o requests en Python
async function handleSingleReferenceUpload(orderId, file) {
  const anticipo = getAnticipoById(orderId);
  if (!anticipo) {
    adminCommon.setStatus(anticiposStatus, "No se encontro la fila para cargar la referencia.");
    return;
  }

  AppState.data.uploadingReferenceIds.add(String(orderId));
  renderAnticipos();

  try {
    const formData = new FormData();
    formData.append("foto", file);
    const response = await fetch(`/api/upload-reference/${orderId}`, { method: "POST", body: formData });
    if (!response.ok) throw await buildRequestError(response);
    adminCommon.setStatus(anticiposStatus, `Referencia cargada para la orden ${anticipo.orderCode}. Recargando datos...`);
    await loadAnticipos();
  } catch (error) {
    console.error("No fue posible subir la referencia", error);
    adminCommon.setStatus(anticiposStatus, `No fue posible subir la referencia para la orden ${anticipo.orderCode}: ${error.message}`);
  } finally {
    AppState.data.uploadingReferenceIds.delete(String(orderId));
    renderAnticipos();
  }
}

// ================= APROBAR ANTICIPO =================
async function handleApprove(anticipo) {
  try {
    const response = await fetch(`/api/admin/orders/${anticipo.id}/approve-anticipo`, { method: "POST", headers: { Accept: "application/json" } });
    if (!response.ok) throw await buildRequestError(response);
    adminCommon.setStatus(anticiposStatus, `Anticipo de la orden ${anticipo.orderCode} aprobado con 100% de validacion.`);
    await loadAnticipos();
  } catch (error) {
    console.error("No fue posible aprobar el anticipo", error);
    adminCommon.setStatus(anticiposStatus, `No fue posible aprobar la orden ${anticipo.orderCode}: ${error.message}`);
  }
}

// ================= ELIMINAR REFERENCIA =================
async function handleDeleteReference(anticipo) {
  try {
    const response = await fetch(`/api/admin/orders/${anticipo.id}/reference-image`, { method: "DELETE", headers: { Accept: "application/json" } });
    if (!response.ok) throw await buildRequestError(response);
    adminCommon.setStatus(anticiposStatus, `Referencia eliminada para la orden ${anticipo.orderCode}.`);
    await loadAnticipos();
  } catch (error) {
    console.error("No fue posible eliminar la referencia", error);
    adminCommon.setStatus(anticiposStatus, `No fue posible eliminar la referencia de la orden ${anticipo.orderCode}: ${error.message}`);
  }
}

// ================= COPIAR MENSAJE Y RECHAZAR ANTICIPO =================
async function handleRejectCopy() {
  const anticipo = getAnticipoById(AppState.ui.rejectModalOrderId);
  if (!anticipo) return void closeRejectModal();

  const message = ANTICIPO_REJECT_TEMPLATE.replace("{orderId}", anticipo.businessOrderId);
  try {
    await copyToClipboard(message);
    const response = await fetch(`/api/admin/orders/${anticipo.id}/reject-anticipo`, { method: "POST", headers: { Accept: "application/json" } });
    if (!response.ok) throw await buildRequestError(response);
    closeRejectModal();
    adminCommon.setStatus(anticiposStatus, `Mensaje copiado y anticipo rechazado para la orden ${anticipo.orderCode}.`);
    await loadAnticipos();
  } catch (error) {
    console.error("No fue posible rechazar el anticipo", error);
    adminCommon.setStatus(anticiposStatus, `No fue posible copiar o rechazar la orden ${anticipo.orderCode}: ${error.message}`);
  }
}

// ================= ELIMINAR ORDENES SELECCIONADAS =================
async function handleDeleteSelected() {
  const selected = anticiposContainer.querySelectorAll(".row-select:checked");
  if (!selected.length) {
    adminCommon.setStatus(anticiposStatus, "Selecciona al menos una orden para eliminar.");
    return;
  }

  const ids = Array.from(selected).map((checkbox) => checkbox.dataset.id);
  if (!confirm(`¿Estas seguro de eliminar ${ids.length} orden(es)?`)) return;

  try {
    for (const id of ids) {
      const response = await fetch(`/api/admin/orders/${id}`, { method: "DELETE", headers: { Accept: "application/json" } });
      if (!response.ok) throw await buildRequestError(response);
    }
    adminCommon.setStatus(anticiposStatus, `${ids.length} orden(es) eliminada(s).`);
    await loadAnticipos();
  } catch (error) {
    console.error("Error eliminando ordenes", error);
    adminCommon.setStatus(anticiposStatus, `Error eliminando ordenes: ${error.message}`);
  }
}

// ================= EXPORTAR CSV COMPLETO =================
function handleExportCSV() {
  if (!AppState.data.anticipos.length) {
    adminCommon.setStatus(anticiposStatus, "No hay anticipos para exportar.");
    return;
  }

  const csvContent = [["full_name", "product_type", "product_name", "product_image", "colors", "length_cm", "width_cm", "description", "delivery", "date", "deadline", "wa_id", "payment_proof", "status", "quote_min", "quote_max", "advance_payment", "id_orden"],
    ...AppState.data.anticipos.map((a) => [a.full_name || "", a.product_type || "", a.product_name || "", a.product_image || "", a.colors || "", a.length_cm || "", a.width_cm || "", a.description || "", a.delivery || "", a.date || "", a.deadline || "", a.waId || "", a.whatsappProof || "", a.status || "", a.quote_min || "", a.quote_max || "", a.advance_payment || a.anticipo || "", a.id_orden || ""])]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `anticipos_export_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  adminCommon.setStatus(anticiposStatus, `${AppState.data.anticipos.length} anticipos exportados a CSV.`);
}

// ================= ABRIR/CERRAR MODALES =================
function openImagePreview(src, alt) {
  AppState.ui.activeModal = "preview";
  AppState.ui.activePreview = { src, alt };
  renderFloatingModals();
}

function closeImagePreview() {
  if (!AppState.ui.activePreview) return;
  AppState.ui.activeModal = null;
  AppState.ui.activePreview = null;
  renderFloatingModals();
}

function openRejectModal(anticipo) {
  AppState.ui.activeModal = "reject";
  AppState.ui.rejectModalOrderId = anticipo.id;
  renderFloatingModals();
}

function closeRejectModal() {
  if (!AppState.ui.rejectModalOrderId) return;
  AppState.ui.activeModal = null;
  AppState.ui.rejectModalOrderId = null;
  renderFloatingModals();
}

function openEditModal(anticipo) {
  AppState.ui.activeModal = "edit";
  AppState.ui.editModalOrder = { ...anticipo };
  renderFloatingModals();
}

function closeEditModal() {
  if (!AppState.ui.editModalOrder) return;
  AppState.ui.activeModal = null;
  AppState.ui.editModalOrder = null;
  renderFloatingModals();
}

// ================= GUARDAR EDICION DE LA ORDEN =================
async function handleEditSave() {
  const form = document.getElementById("editOrderForm");
  if (!form || !AppState.ui.editModalOrder) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const orderId = AppState.ui.editModalOrder.id;
  adminCommon.setStatus(anticiposStatus, "Guardando cambios...");

  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw await buildRequestError(response);
    adminCommon.setStatus(anticiposStatus, "Orden actualizada con exito.");
    closeEditModal();
    await loadAnticipos();
  } catch (error) {
    console.error("No fue posible guardar la orden", error);
    adminCommon.setStatus(anticiposStatus, `Error: No se pudo guardar en la base de datos. ${error.message}`);
  }
}

// ================= PROCESO 6: UTILIDADES =================
function getAnticipoById(id) {
  return AppState.data.anticipos.find((anticipo) => String(anticipo.id) === String(id));
}

function cloneTemplate(template) {
  return template.content.firstElementChild.cloneNode(true);
}

async function buildRequestError(response) {
  let message = `HTTP ${response.status}`;
  try {
    const payload = await response.json();
    if (payload.error) message = payload.error;
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

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

function escapeCsvCell(value) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

// ================= NORMALIZA RUTAS DE IMAGENES =================
function normalizeImagePath(path, fallback = "images/products/top.jpg") {
  if (!path) return fallback;
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

// ================= FORMATEA VALORES MONETARIOS =================
function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "Sin valor";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(value));
}

bindEventListeners();
renderAnticipos();
loadAnticipos();
