const overviewSummary = document.getElementById("summaryCards");
const overviewWorkflow = document.getElementById("workflowStrip");
const overviewStatus = document.getElementById("statusBadge");
const overviewTable = document.getElementById("overviewTable");
const overviewTabs = document.querySelectorAll("[data-filter]");

// Estado actual de la vista (pestaña activa y ordenes cargadas desde backend).
let overviewFilter = "pendientes";
let recentOrders = [];

// Render inicial del resumen y primera carga de datos.
adminCommon.renderSummaryCards(overviewSummary);
adminCommon.renderWorkflow(overviewWorkflow);
renderOverviewTable();
loadRecentOrders();

// Cambia el filtro visual entre pendientes, en proceso y completadas.
overviewTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    overviewTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    overviewFilter = tab.dataset.filter;
    renderOverviewTable();
  });
});

// Captura clicks sobre botones de accion dentro de la tabla.
overviewTable.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-id]");
  if (!button) {
    return;
  }

  const order = recentOrders.find((item) => String(item.id) === button.dataset.orderId);
  if (!order) {
    adminCommon.setStatus(overviewStatus, "No se encontro la orden seleccionada.");
    return;
  }

  if (button.textContent.trim() === "Aprobar") {
    handleApprove(order);
  } else {
    const actionLabel = getOrderAction(order).label.toLowerCase();
    adminCommon.setStatus(overviewStatus, `Orden ${order.orderCode}: ${actionLabel} para ${order.cliente}.`);
  }
});

async function handleApprove(order) {
  try {
    const response = await fetch(`/api/admin/orders/${order.id}/approve-anticipo`, {
      method: "POST",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw await buildRequestError(response);
    }

    adminCommon.setStatus(overviewStatus, `Anticipo aprobado.`);
    await loadRecentOrders();
  } catch (error) {
    console.error("No fue posible aprobar el anticipo", error);
    adminCommon.setStatus(overviewStatus, `No fue posible aprobar: ${error.message}`);
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

function renderOverviewTable() {
  // Filtra segun la pestaña activa.
  const pendingStatuses = ["cotizacion", "anticipo_pendiente", "rechazado", "pendiente"];
  const inProgressStatuses = ["comprado"];
  const completedStatuses = ["terminado", "completado", "entregado"];

  const filteredOrders = recentOrders.filter((order) => {
    if (overviewFilter === "pendientes") {
      return pendingStatuses.includes(order.rawStatus);
    }

    if (overviewFilter === "proceso") {
      return inProgressStatuses.includes(order.rawStatus);
    }

    if (overviewFilter === "completadas") {
      return completedStatuses.includes(order.rawStatus);
    }

    return false;
  });

  // Renderiza la tabla principal con datos mapeados del backend.
  overviewTable.innerHTML = `
    <div class="overview-card">
      <div class="overview-head">
        <h4>Ordenes recientes</h4>
        <span class="overview-meta">${filteredOrders.length} visibles en esta vista</span>
      </div>
      <div class="overview-table-wrap">
        <table class="overview-table">
          <thead>
            <tr>
              <th>ID Orden</th>
              <th>Producto</th>
              <th>Imagen</th>
              ${overviewFilter === "pendientes" ? "<th>Anticipo</th><th>Acciones</th>" : "<th>Precio</th><th>Fase</th>"}
            </tr>
          </thead>
          <tbody>
            ${filteredOrders
              .map(
                (order) => {
                  if (overviewFilter === "pendientes") {
                    return `
                      <tr>
                        <td class="overview-id">${order.idOrden}</td>
                        <td>${order.producto || "Sin nombre"}</td>
                        <td>
                          ${order.productImage ? `<img src="${order.productImage}" alt="Producto" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'; this.parentElement.innerHTML='Sin imagen';">` : 'Sin imagen'}
                        </td>
                        <td>${order.anticipo}</td>
                        <td>
                          <button class="button primary" type="button" data-order-id="${order.id}">Aprobar</button>
                        </td>
                      </tr>`;
                  } else {
                    return `
                      <tr>
                        <td class="overview-id">${order.idOrden}</td>
                        <td>${order.producto || "Sin nombre"}</td>
                        <td>
                          ${order.productImage ? `<img src="${order.productImage}" alt="Producto" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'; this.parentElement.innerHTML='Sin imagen';">` : 'Sin imagen'}
                        </td>
                        <td>${order.cotizacionMax}</td>
                        <td>${getFase(order)}</td>
                      </tr>`;
                  }
                }
              )
              .join("") || `
                <tr>
                  <td colspan="5">No hay ordenes en esta vista todavia.</td>
                </tr>
              `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadRecentOrders() {
  // Trae las ordenes recientes reales desde Flask.
  adminCommon.setStatus(overviewStatus, "Cargando ordenes recientes del bot...");

  try {
    const response = await fetch("/api/admin/recent-orders", {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const orders = await response.json();
    // Normaliza estructura para que el frontend siempre trabaje igual.
    recentOrders = orders.map(mapOrderForView);
    renderOverviewTable();
    adminCommon.setStatus(overviewStatus, `${recentOrders.length} ordenes sincronizadas desde la base de datos.`);
  } catch (error) {
    console.error("No fue posible cargar las ordenes recientes", error);
    recentOrders = [];
    renderOverviewTable();
    adminCommon.setStatus(overviewStatus, "No fue posible cargar las ordenes recientes desde el backend.");
  }
}

function mapOrderForView(order) {
  // Convierte el estado de negocio a estado de UI del tablero.
  const estado = normalizeDashboardStatus(order.status);

  return {
    id: order.id,
    idOrden: order.id_orden || "Sin ID",
    orderCode: order.id_orden || `#${order.id}`,
    cliente: order.cliente || "Cliente sin nombre",
    fecha: order.fecha || "Sin fecha",
    estado,
    rawStatus: order.status,
    producto: order.product_name || order.producto || order.product_type || "Producto personalizado",
    product_name: order.product_name,
    productImage: normalizeImagePath(order.product_image || order.reference_image),
    anticipo: order.anticipo,
    cotizacionMin: order.cotizacion_min,
    cotizacionMax: order.cotizacion_max
  };
}

function normalizeImagePath(path) {
  if (!path) return '';
  
  let normalized = String(path).trim().replace(/\\/g, '/');
  
  // Quitar prefijos relativos como ./ o ../
  normalized = normalized.replace(/^\.\//, '');
  normalized = normalized.replace(/^\.\.(\/)?/, '');
  
  const originalPath = normalized;
  
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  
  if (normalized.startsWith('/')) {
    return normalized;
  }
  
  if (normalized.startsWith('static/')) {
    return `/${normalized}`;
  }
  
  if (normalized.startsWith('img/')) {
    return `/${normalized}`;
  }
  
  if (normalized.startsWith('productos/')) {
    return `/${normalized}`;
  }
  
  if (normalized.startsWith('comprobante/')) {
    return `/${normalized}`;
  }
  
  if (normalized.startsWith('ordenes/')) {
    return `/${normalized}`;
  }
  
  if (normalized.startsWith('img/referencias/')) {
    return `/${normalized}`;
  }
  
  return `/${normalized}`;
}

function normalizeDashboardStatus(status) {
  // Reglas de traduccion de estado de backend a categorias visuales del tablero.
  if (status === "comprado") {
    return "en-proceso";
  }

  if (["terminado", "completado", "entregado"].includes(status)) {
    return "completada";
  }

  return "pendiente";
}

function getOrderAction(order) {
  // Define el CTA segun estado actual de la orden.
  if (order.rawStatus === "comprado") {
    return { label: "Validar anticipo", style: "primary" };
  }

  if (order.estado === "completada") {
    return { label: "Ver detalle", style: "secondary" };
  }

  return { label: "Revisar cotizacion", style: "warning" };
}

function getFase(order) {
  // Lógica para determinar fase según ordenesadmin
  // Por ahora, simplificar
  return "1";
}
