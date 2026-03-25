const routesContainer = document.getElementById("availableRoutes");
const manifestRows = document.getElementById("manifestRows");
const paginationLabel = document.getElementById("paginationLabel");
const manifestTitle = document.getElementById("manifestTitle");
const dateInput = document.getElementById("planDate");
const feedback = document.getElementById("mapFeedback");
const routeToggle = document.getElementById("toggleRoutes");
const shipmentFilters = Array.from(document.querySelectorAll(".transport-filters input"));

let showingAllRoutes = false;

dateInput.value = new Date().toISOString().slice(0, 10);

renderRoutes();
renderShipments();

shipmentFilters.forEach((filter) => {
  filter.addEventListener("change", renderShipments);
});

routeToggle.addEventListener("click", () => {
  showingAllRoutes = !showingAllRoutes;
  routeToggle.textContent = showingAllRoutes ? "Ver menos" : "Ver mas";
  renderRoutes();
});

document.getElementById("viewMapButton").addEventListener("click", () => {
  feedback.textContent = `Mapa preparado para la fecha ${dateInput.value}.`;
});

document.getElementById("printButton").addEventListener("click", () => {
  feedback.textContent = "Vista lista para impresion de la hoja de ruta.";
});

document.getElementById("prevPage").addEventListener("click", () => {
  feedback.textContent = "Mostrando el primer bloque de ordenes priorizadas.";
});

document.getElementById("nextPage").addEventListener("click", () => {
  feedback.textContent = "No hay mas paginas en este ejemplo, pero el paginador ya quedo visible.";
});

function renderRoutes() {
  const routes = showingAllRoutes
    ? window.transportistaData.availableRoutes
    : window.transportistaData.availableRoutes.slice(0, 8);

  routesContainer.innerHTML = routes
    .map(
      (route, index) => `
        <article class="route-item">
          <span class="route-index">${index + 1}</span>
          <span>${route}</span>
        </article>
      `
    )
    .join("");
}

function renderShipments() {
  const selectedFilters = shipmentFilters.filter((item) => item.checked).map((item) => item.value);

  const filtered = window.transportistaData.shipments.filter((shipment) => {
    return selectedFilters.includes(shipment.status) || selectedFilters.includes(shipment.action);
  });

  manifestRows.innerHTML = filtered
    .map(
      (shipment) => `
        <tr>
          <td><span class="action-pill ${shipment.action}">${shipment.action}</span></td>
          <td>${shipment.name}</td>
          <td>${shipment.address}</td>
          <td>${shipment.orderId}</td>
          <td>${shipment.authorized}</td>
          <td><span class="status-pill ${shipment.status}">${shipment.status}</span></td>
        </tr>
      `
    )
    .join("");

  const visible = filtered.length;
  paginationLabel.textContent = visible ? `1 - ${visible} ordenes` : "0 ordenes";
  manifestTitle.textContent = visible
    ? "Despachos priorizados del turno manana"
    : "No hay ordenes para los filtros seleccionados";
}
