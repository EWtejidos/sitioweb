const contabilidadContainer = document.getElementById("moduleContent");
const contabilidadStatus = document.getElementById("statusBadge");
const contabilidadTabs = document.querySelectorAll("[data-tab]");

let contabilidadTabActual = "libros";

renderContabilidadTab();

contabilidadTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    contabilidadTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    contabilidadTabActual = tab.dataset.tab;
    renderContabilidadTab();
  });
});

contabilidadContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  if (button.dataset.action === "export-report") {
    adminCommon.setStatus(contabilidadStatus, `Exportacion mock del reporte ${button.dataset.report}.`);
  }
});

function renderContabilidadTab() {
  const views = {
    libros: renderLibroCards(adminData.librosContables, "Libros contables", "export-libros"),
    estado: `
      <div class="admin-grid accounting-grid">
        ${adminData.estadoFinanciero
          .map(
            (item) => `
              <article class="accounting-card">
                <strong>${item.nombre}</strong>
                <p class="money">${item.valor}</p>
                <span class="database-meta">${item.detalle}</span>
                <button class="button secondary" type="button" data-action="export-report" data-report="${item.nombre}">Exportar reporte</button>
              </article>
            `
          )
          .join("")}
      </div>
    `,
    auxiliares: renderLibroCards(adminData.librosAuxiliares, "Libros auxiliares", "export-auxiliares")
  };

  contabilidadContainer.innerHTML = views[contabilidadTabActual];
}

function renderLibroCards(items, title, reportName) {
  return `
    <article class="section-card">
      <div class="section-topline">
        <div>
          <h4>${title}</h4>
          <span class="mini-copy">Revision financiera sin salir del modulo.</span>
        </div>
        <button class="button secondary" type="button" data-action="export-report" data-report="${reportName}">Exportar</button>
      </div>
      <div class="admin-grid accounting-grid">
        ${items
          .map(
            (item) => `
              <article class="accounting-card">
                <strong>${item.nombre}</strong>
                <span class="status-badge ${adminCommon.normalizeStatusClass(item.estado || "aprobado")}">${adminCommon.formatStatus(item.estado || "aprobado")}</span>
                <span class="database-meta">${item.detalle}</span>
              </article>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}
