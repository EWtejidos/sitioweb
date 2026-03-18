const productos = [
  { nombre: "Bolso tejido", estado: "Activo", detalle: "Coleccion principal" },
  { nombre: "Bufanda", estado: "Inactivo", detalle: "Pendiente de reposicion" }
];

const pedidos = [
  { descripcion: "Sombrero personalizado", estado: "Nuevo" },
  { descripcion: "Mochila artesanal", estado: "En produccion" }
];

document.getElementById("productosActivos").innerText = productos.filter(
  (producto) => producto.estado.toLowerCase() === "activo"
).length;
document.getElementById("pedidosPendientes").innerText = pedidos.length;

const listaProductos = document.getElementById("listaProductos");
productos.forEach((producto) => {
  const item = document.createElement("li");
  item.className = "activity-item";
  item.innerHTML = `
    <div class="activity-copy">
      <span class="activity-title">${producto.nombre}</span>
      <span class="activity-description">${producto.detalle}</span>
    </div>
    <span class="status-pill">${producto.estado}</span>
  `;
  listaProductos.appendChild(item);
});

const listaPedidos = document.getElementById("listaPedidos");
pedidos.forEach((pedido) => {
  const item = document.createElement("li");
  item.className = "activity-item";
  item.innerHTML = `
    <div class="activity-copy">
      <span class="activity-title">${pedido.descripcion}</span>
      <span class="activity-description">Seguimiento centralizado desde el panel</span>
    </div>
    <span class="status-pill">${pedido.estado}</span>
  `;
  listaPedidos.appendChild(item);
});

document.getElementById("btnSubir").addEventListener("click", () => {
  window.location.href = "panel_productos.html";
});

document.getElementById("btnPedidos").addEventListener("click", () => {
  window.location.href = "pedidos.html";
});
