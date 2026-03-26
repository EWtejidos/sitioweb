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

  const actionLabel = getOrderAction(order).label.toLowerCase();
  adminCommon.setStatus(overviewStatus, `Orden ${order.orderCode}: ${actionLabel} para ${order.cliente}.`);
});

function renderOverviewTable() {
  // Filtra segun la pestaña activa.
  const filteredOrders = recentOrders.filter((order) => {
    if (overviewFilter === "pendientes") {
      return order.estado === "pendiente";
    }

    if (overviewFilter === "proceso") {
      return order.estado === "en-proceso";
    }

    return order.estado === "completada";
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
              <th>ID_orden</th>
              <th>Orden</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Imagen</th>
              <th>Fecha solicitud</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders
              .map(
                (order) => {
                  const action = getOrderAction(order);
                  return `
                  <tr>
                    <td class="overview-id">${order.idOrden}</td>
                    <td class="overview-id">${order.orderCode}</td>
                    <td>${order.cliente}</td>
                    <td>${order.producto}</td>
                    <td>
                      <img class="overview-thumb" src="${order.productImage}" alt="Producto ${order.orderCode}">
                    </td>
                    <td>${order.fecha}</td>
                    <td><span class="status-badge ${adminCommon.normalizeStatusClass(order.estado)}">${adminCommon.formatStatus(order.estado)}</span></td>
                    <td>
                      <button class="button ${action.style}" type="button" data-order-id="${order.id}">
                        ${action.label}
                      </button>
                    </td>
                  </tr>
                `;
                }
              )
              .join("") || `
                <tr>
                  <td colspan="8">No hay ordenes en esta vista todavia.</td>
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
    orderCode: order.order_code || `#${order.id}`,
    cliente: order.cliente || "Cliente sin nombre",
    fecha: order.fecha || "Sin fecha",
    estado,
    rawStatus: order.status,
    producto: order.producto || "Producto personalizado",
    productImage: normalizeImagePath(order.product_image),
    anticipo: order.anticipo,
    cotizacionMin: order.cotizacion_min,
    cotizacionMax: order.cotizacion_max
  };
}

function normalizeImagePath(path) {
  // Si no hay imagen en BD, usa placeholder local.
  if (!path) {
    return "images/products/top.jpg";
  }

  return path.replace(/\\/g, "/").replace(/^\.\//, "");
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
