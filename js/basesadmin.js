const basesContainer = document.getElementById("moduleContent");
const basesStatus = document.getElementById("statusBadge");
const basesTabs = document.querySelectorAll("[data-tab]");

let basesTabActual = "clientes";

renderBasesTab();

basesTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    basesTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    basesTabActual = tab.dataset.tab;
    renderBasesTab();
  });
});

basesContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  adminCommon.setStatus(basesStatus, `Base ${button.dataset.db} lista para conectar con backend.`);
});

function renderBasesTab() {
  const map = {
    clientes: adminData.clientes,
    tejedores: adminData.tejedores,
    transportistas: adminData.baseTransportistas
  };

  basesContainer.innerHTML = `
    <article class="section-card">
      <div class="section-topline">
        <div>
          <h4>${adminCommon.formatStatus(basesTabActual)}</h4>
          <span class="mini-copy">Informacion central del modulo actual.</span>
        </div>
      </div>
      <div class="admin-grid database-grid">
        ${map[basesTabActual]
          .map(
            (item) => `
              <article class="database-card">
                <strong>${item.nombre}</strong>
                <span class="status-badge ${adminCommon.normalizeStatusClass(item.estado)}">${adminCommon.formatStatus(item.estado)}</span>
                <span class="database-meta">${item.detalle}</span>
                <button class="button secondary" type="button" data-action="open-db" data-db="${basesTabActual}">Abrir base</button>
              </article>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}
