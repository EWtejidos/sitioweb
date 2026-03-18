const pedidos = [
  {
    id: 1,
    productName: "Conejo floral",
    productType: "Amigurumi",
    description: "Flor azul con tallo verde y acabado suave.",
    customerName: "Kelly Cervantes",
    image: "images/products/flor.jpg",
    status: "disponible"
  },
  {
    id: 2,
    productName: "Gatito tejido",
    productType: "Peluche",
    description: "Modelo con bufanda y paleta de tonos tierra.",
    customerName: "Laura Gomez",
    image: "images/products/top.jpg",
    status: "proceso"
  },
  {
    id: 3,
    productName: "Tortuga marina",
    productType: "Amigurumi",
    description: "Version multicolor para entrega final.",
    customerName: "Andrea Perez",
    image: "images/products/tortuga.jpg",
    status: "terminado"
  }
];

const contenedorPedidos = document.getElementById("listaPedidos");
const tabs = document.querySelectorAll(".tab");

let estadoActual = "disponibles";

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    estadoActual = tab.dataset.tab;
    renderPedidos();
  });
});

function getActionButton(status) {
  if (status === "disponible") {
    return '<button class="button primary" type="button">Aceptar</button>';
  }

  if (status === "proceso") {
    return '<button class="button secondary" type="button">Marcar terminado</button>';
  }

  return "";
}

function renderPedidos() {
  contenedorPedidos.innerHTML = "";

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (estadoActual === "disponibles") {
      return pedido.status === "disponible";
    }

    if (estadoActual === "mios") {
      return pedido.status === "proceso";
    }

    return pedido.status === "terminado";
  });

  pedidosFiltrados.forEach((pedido) => {
    const card = document.createElement("article");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-main">
        <img class="order-image" src="${pedido.image}" alt="${pedido.productName}">
        <div class="order-copy">
          <h3 class="order-title">${pedido.productType} / ${pedido.productName}</h3>
          <span class="order-meta">Cliente: ${pedido.customerName}</span>
          <span class="order-description">${pedido.description}</span>
        </div>
      </div>
      <div class="order-side">
        <span class="status-badge ${pedido.status}">${pedido.status}</span>
        <div class="order-actions">
          ${getActionButton(pedido.status)}
        </div>
      </div>
    `;

    contenedorPedidos.appendChild(card);
  });
}

renderPedidos();
