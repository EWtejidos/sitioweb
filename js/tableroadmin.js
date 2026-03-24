const overviewSummary = document.getElementById("summaryCards");
const overviewWorkflow = document.getElementById("workflowStrip");
const overviewStatus = document.getElementById("statusBadge");
const overviewTable = document.getElementById("overviewTable");
const overviewTabs = document.querySelectorAll("[data-filter]");

let overviewFilter = "pendientes";

const recentOrders = [
  { id: 1050, cliente: "Ana Martinez", fecha: "Hoy", estado: "pendiente", accion: "Asignar", actionStyle: "primary" },
  { id: 1048, cliente: "Carlos Lopez", fecha: "15/04/2024", estado: "en-proceso", accion: "Gestionar", actionStyle: "warning" },
  { id: 1045, cliente: "Laura Gomez", fecha: "10/04/2024", estado: "completada", accion: "Verificar pago", actionStyle: "secondary" }
];

adminCommon.renderSummaryCards(overviewSummary);
adminCommon.renderWorkflow(overviewWorkflow);
renderOverviewTable();

overviewTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    overviewTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    overviewFilter = tab.dataset.filter;
    renderOverviewTable();
  });
});

overviewTable.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-id]");
  if (!button) {
    return;
  }

  adminCommon.setStatus(overviewStatus, `Accion preparada para la orden #${button.dataset.orderId}.`);
});

function renderOverviewTable() {
  const filteredOrders = recentOrders.filter((order) => {
    if (overviewFilter === "pendientes") {
      return order.estado === "pendiente";
    }

    if (overviewFilter === "proceso") {
      return order.estado === "en-proceso";
    }

    return order.estado === "completada";
  });

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
              <th>Orden</th>
              <th>Cliente</th>
              <th>Fecha solicitud</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders
              .map(
                (order) => `
                  <tr>
                    <td class="overview-id">#${order.id}</td>
                    <td>${order.cliente}</td>
                    <td>${order.fecha}</td>
                    <td><span class="status-badge ${adminCommon.normalizeStatusClass(order.estado)}">${adminCommon.formatStatus(order.estado)}</span></td>
                    <td>
                      <button class="button ${order.actionStyle}" type="button" data-order-id="${order.id}">
                        ${order.accion}
                      </button>
                    </td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
