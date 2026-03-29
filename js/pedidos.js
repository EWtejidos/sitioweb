const contenedorPedidos = document.getElementById("listaPedidos");
const tabs = document.querySelectorAll(".tab");
const modalHost = createModalHost();

let estadoActual = "disponibles";
let pedidos = [];
let currentUsername = "";
let pendingAcceptOrderId = null;

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    estadoActual = tab.dataset.tab;
    renderPedidos();
  });
});

contenedorPedidos.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const pedido = pedidos.find((item) => String(item.id) === button.dataset.id);
  if (!pedido) {
    return;
  }

  if (button.dataset.action === "accept") {
    if (pedido.deadline) {
      acceptPedidoWithDeadline(pedido.id, pedido.deadline);
    } else {
      openAcceptModal(pedido);
    }
    return;
  }

  if (button.dataset.action === "complete") {
    return;
  }
});

document.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-accept-close]");
  const confirmButton = event.target.closest("[data-accept-confirm]");

  if (closeButton || event.target.classList.contains("deadline-modal-overlay")) {
    closeAcceptModal();
    return;
  }

  if (confirmButton) {
    handleAcceptPedido();
  }
});

loadPedidos();

async function loadPedidos() {
  try {
    const response = await fetch("/api/pedidos/aprobados", {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    currentUsername = payload.current_user || "";
    pedidos = (payload.orders || []).map(mapPedidoForView);
    renderPedidos();
  } catch (error) {
    console.error("No fue posible cargar los pedidos", error);
    contenedorPedidos.innerHTML = `<article class="order-card"><div class="order-copy"><h3 class="order-title">No fue posible cargar los pedidos.</h3></div></article>`;
  }
}

function mapPedidoForView(order) {
  const assignedToCurrentUser = Boolean(order.assigned_to) && order.assigned_to === currentUsername;
  const isFinished = ["terminado", "completado", "entregado"].includes(order.status);
  let status = "oculto";

  if (order.status === "comprado" && !order.assigned_to) {
    status = "disponible";
  } else if ((order.status === "comprado" && assignedToCurrentUser) || (assignedToCurrentUser && !isFinished)) {
    status = "proceso";
  } else if (assignedToCurrentUser && isFinished) {
    status = "terminado";
  }

  return {
    id: order.id,
    orderCode: order.order_code || `#${order.id}`,
    productName: order.producto || "Producto personalizado",
    productType: order.producto || "Pedido aprobado",
    description: order.description || "Sin descripcion",
    customerName: order.cliente || "Cliente sin nombre",
    image: normalizeImagePath(order.product_image),
    status,
    lengthCm: order.length_cm || "Sin dato",
    widthCm: order.width_cm || "Sin dato",
    date: order.fecha || "Sin fecha",
    deadline: order.deadline || "",
    weaver: order.weaver || order.assigned_to || "Sin asignar",
    assignedTo: order.assigned_to || "",
    rawStatus: order.status
  };
}

function getActionButton(pedido) {
  if (pedido.status === "disponible") {
    return `<button class="button primary" type="button" data-action="accept" data-id="${pedido.id}">Aceptar pedido</button>`;
  }

  if (pedido.status === "proceso") {
    return `<button class="button secondary" type="button" data-action="complete" data-id="${pedido.id}">Marcar terminado</button>`;
  }

  return "";
}

function renderPedidos() {
  contenedorPedidos.innerHTML = "";

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (pedido.status === "oculto") {
      return false;
    }

    if (estadoActual === "disponibles") {
      return pedido.status === "disponible";
    }

    if (estadoActual === "mios") {
      return pedido.status === "proceso";
    }

    return pedido.status === "terminado";
  });

  if (!pedidosFiltrados.length) {
    contenedorPedidos.innerHTML = `<article class="order-card"><div class="order-copy"><h3 class="order-title">No hay pedidos para esta vista todavia.</h3></div></article>`;
    renderAcceptModal();
    return;
  }

  pedidosFiltrados.forEach((pedido) => {
    const card = document.createElement("article");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-main">
        <img class="order-image" src="${pedido.image}" alt="${pedido.productName}">
        <div class="order-copy">
          <h3 class="order-title">${pedido.productName}</h3>
          <span class="order-meta">Orden: ${pedido.orderCode} · Cliente: ${pedido.customerName}</span>
          <span class="order-meta">Largo: ${pedido.lengthCm} · Ancho: ${pedido.widthCm}</span>
          <span class="order-meta">Fecha: ${pedido.date}</span>
          <span class="order-meta">Deadline: ${pedido.deadline || "Pendiente por definir"}</span>
          <span class="order-meta">Tejedor: ${pedido.weaver}</span>
          <span class="order-description">${pedido.description}</span>
        </div>
      </div>
      <div class="order-side">
        <span class="status-badge ${pedido.status}">${formatPedidoStatus(pedido.status)}</span>
        <div class="order-actions">
          ${getActionButton(pedido)}
        </div>
      </div>
    `;

    contenedorPedidos.appendChild(card);
  });

  renderAcceptModal();
}

function normalizeImagePath(path) {
  if (!path) {
    return "images/products/top.jpg";
  }

  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

function formatPedidoStatus(status) {
  if (status === "disponible") {
    return "disponible";
  }

  if (status === "proceso") {
    return "asignado";
  }

  if (status === "terminado") {
    return "terminado";
  }

  return status;
}

function openAcceptModal(pedido) {
  pendingAcceptOrderId = pedido.id;
  renderAcceptModal();
}

function closeAcceptModal() {
  pendingAcceptOrderId = null;
  renderAcceptModal();
}

function renderAcceptModal() {
  const pedido = pedidos.find((item) => String(item.id) === String(pendingAcceptOrderId));
  if (!pedido) {
    modalHost.innerHTML = "";
    return;
  }

  modalHost.innerHTML = `
    <div class="deadline-modal-overlay">
      <div class="deadline-modal-card" role="dialog" aria-modal="true" aria-label="Definir fecha limite del pedido">
        <button class="deadline-close-button" type="button" data-accept-close aria-label="Cerrar ventana">×</button>
        <h3>Definir fecha de entrega</h3>
        <p>¿Cuanto te demoraras con este pedido?</p>
        <div class="deadline-order-summary">
          <span>Orden: ${pedido.orderCode}</span>
          <span>Producto: ${pedido.productName}</span>
          <span>Cliente: ${pedido.customerName}</span>
        </div>
        <label class="deadline-field">
          <span>Selecciona la fecha limite</span>
          <input id="deadlineInput" type="date" value="${pedido.deadline || ""}">
        </label>
        <div class="deadline-modal-actions">
          <button class="button primary" type="button" data-accept-confirm>Aceptar pedido</button>
        </div>
      </div>
    </div>
  `;
}

async function handleAcceptPedido() {
  const pedido = pedidos.find((item) => String(item.id) === String(pendingAcceptOrderId));
  const deadlineInput = document.getElementById("deadlineInput");

  if (!pedido || !deadlineInput) {
    closeAcceptModal();
    return;
  }

  const deadline = deadlineInput.value;
  if (!deadline) {
    deadlineInput.focus();
    return;
  }

  try {
    await acceptPedidoWithDeadline(pedido.id, deadline);
    closeAcceptModal();
  } catch (error) {
    console.error("No fue posible aceptar el pedido", error);
  }
}

function createModalHost() {
  const existingHost = document.getElementById("pedidosModalHost");
  if (existingHost) {
    return existingHost;
  }

  const host = document.createElement("div");
  host.id = "pedidosModalHost";
  document.body.appendChild(host);
  return host;
}

async function acceptPedidoWithDeadline(orderId, deadline) {
  const response = await fetch(`/api/pedidos/${orderId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ deadline })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  await loadPedidos();
}
