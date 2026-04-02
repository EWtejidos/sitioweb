const basesContainer = document.getElementById("moduleContent");
const basesStatus = document.getElementById("statusBadge");
const basesTabs = document.querySelectorAll("[data-tab]");

let basesTabActual = "clientes";
let customers = [];

renderBasesTab();
loadCustomers();

basesTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    basesTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    basesTabActual = tab.dataset.tab;
    
    // Si es la pestaña de productos, llamar a la función del módulo de productos
    if (basesTabActual === "productos" && typeof loadAndRenderProductos === "function") {
      loadAndRenderProductos();
    } else {
      renderBasesTab();
    }
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
    clientes: customers.length ? customers : adminData.clientes,
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

async function loadCustomers() {
  try {
    const response = await fetch("/api/admin/customers", {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    customers = await response.json();
    if (basesTabActual === "clientes") {
      renderBasesTab();
    }
    adminCommon.setStatus(basesStatus, `${customers.length} clientes cargados desde la base de datos.`);
  } catch (error) {
    console.error("No fue posible cargar la base de clientes", error);
    adminCommon.setStatus(basesStatus, "Mostrando base mock mientras se conecta la base real de clientes.");
  }
}
