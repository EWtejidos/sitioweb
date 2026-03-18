const productos = [
  {
    nombre: "Bikini tejido",
    precio: 89900,
    categoria: "Verano artesanal",
    imagen: "images/products/bikini.jpg"
  },
  {
    nombre: "Top floral",
    precio: 99900,
    categoria: "Coleccion botanica",
    imagen: "images/products/flor.jpg"
  },
  {
    nombre: "Top esmeralda",
    precio: 69900,
    categoria: "Linea esencial",
    imagen: "images/products/top.jpg"
  },
  {
    nombre: "Tortuga amigurumi",
    precio: 75900,
    categoria: "Piezas personalizadas",
    imagen: "images/products/tortuga.jpg"
  }
];

const contenedorProductos = document.getElementById("listaProductos");

productos.forEach((producto) => {
  const card = document.createElement("article");
  card.className = "product-card";

  card.innerHTML = `
    <img class="product-image" src="${producto.imagen}" alt="${producto.nombre}">
    <div class="product-copy">
      <h3 class="product-name">${producto.nombre}</h3>
      <span class="product-price">$${producto.precio.toLocaleString("es-CO")}</span>
      <span class="product-meta">${producto.categoria}</span>
    </div>
    <div class="product-actions">
      <button class="button secondary" type="button">Editar</button>
      <button class="button primary" type="button">Eliminar</button>
    </div>
  `;

  contenedorProductos.appendChild(card);
});

const irANuevoProducto = () => {
  alert("Aqui se conectara el flujo para crear un producto.");
};

document.getElementById("btnNuevoProducto").addEventListener("click", irANuevoProducto);
document.getElementById("fab").addEventListener("click", irANuevoProducto);
