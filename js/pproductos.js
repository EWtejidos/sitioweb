const contenedorProductos = document.getElementById("listaProductos");
const nuevoProductoButton = document.getElementById("btnNuevoProducto");
const fabButton = document.getElementById("fab");
const modalHost = createModalHost();

let productos = [];
let categorias = [];
let editingProductId = null;
let isCreatingProduct = false;

nuevoProductoButton.addEventListener("click", () => openProductModal());
fabButton.addEventListener("click", () => openProductModal());

contenedorProductos.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const producto = productos.find((item) => String(item.id) === button.dataset.id);
  if (!producto) {
    return;
  }

  if (button.dataset.action === "edit") {
    openProductModal(producto);
    return;
  }

  if (button.dataset.action === "toggle") {
    handleToggleProduct(producto.id);
  }
});

document.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-product-close]");
  const saveButton = event.target.closest("[data-product-save]");

  if (closeButton || event.target.classList.contains("product-modal-overlay")) {
    closeProductModal();
    return;
  }

  if (saveButton) {
    handleSaveProduct();
  }
});

loadProducts();

async function loadProducts() {
  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch("/api/product-categories", { headers: { Accept: "application/json" } }),
      fetch("/api/productos", { headers: { Accept: "application/json" } })
    ]);

    if (!categoriesResponse.ok || !productsResponse.ok) {
      throw new Error("No fue posible cargar el catalogo.");
    }

    categorias = await categoriesResponse.json();
    productos = await productsResponse.json();
    renderProductos();
  } catch (error) {
    console.error("No fue posible cargar los productos", error);
    contenedorProductos.innerHTML = `<article class="product-card"><div class="product-copy"><h3 class="product-name">No fue posible cargar los productos.</h3></div></article>`;
  }
}

function renderProductos() {
  contenedorProductos.innerHTML = "";

  if (!productos.length) {
    contenedorProductos.innerHTML = `<article class="product-card"><div class="product-copy"><h3 class="product-name">Todavia no has subido productos.</h3><span class="product-meta">Usa el boton Nuevo producto para publicar tu primer tejido.</span></div></article>`;
    renderProductModal();
    return;
  }

  productos.forEach((producto) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img class="product-image" src="${normalizeImagePath(producto.image_path)}" alt="${producto.name}">
      <div class="product-copy">
        <h3 class="product-name">${producto.name}</h3>
        <span class="product-price">${formatCurrency(producto.price)}</span>
        <span class="product-meta">${producto.category}</span>
        <span class="product-meta">${producto.is_active ? "Visible en la tienda" : "Desactivado en la tienda"}</span>
      </div>
      <div class="product-actions">
        <button class="button secondary" type="button" data-action="edit" data-id="${producto.id}">Editar</button>
        <button class="button primary" type="button" data-action="toggle" data-id="${producto.id}">${producto.is_active ? "Desactivar" : "Activar"}</button>
      </div>
    `;

    contenedorProductos.appendChild(card);
  });

  renderProductModal();
}

function openProductModal(producto = null) {
  isCreatingProduct = !producto;
  editingProductId = producto ? producto.id : null;
  renderProductModal(producto);
}

function closeProductModal() {
  editingProductId = null;
  isCreatingProduct = false;
  renderProductModal();
}

function renderProductModal(producto = null) {
  const selectedProduct = producto || productos.find((item) => String(item.id) === String(editingProductId));
  if (!selectedProduct && !isCreatingProduct) {
    modalHost.innerHTML = "";
    return;
  }

  const categoryOptions = categorias
    .map((category) => `<option value="${category}" ${selectedProduct?.category === category ? "selected" : ""}>${category}</option>`)
    .join("");

  modalHost.innerHTML = `
    <div class="product-modal-overlay">
      <div class="product-modal-card" role="dialog" aria-modal="true" aria-label="Formulario de producto">
        <button class="product-close-button" type="button" data-product-close aria-label="Cerrar ventana">×</button>
        <h3>${selectedProduct ? "Editar producto" : "Nuevo producto"}</h3>
        <div class="product-form-grid">
          <label class="product-field">
            <span>Nombre del producto</span>
            <input id="productNameInput" type="text" value="${selectedProduct?.name || ""}">
          </label>
          <label class="product-field">
            <span>Categoria</span>
            <select id="productCategoryInput">
              <option value="">Selecciona una categoria</option>
              ${categoryOptions}
            </select>
          </label>
          <label class="product-field">
            <span>Precio</span>
            <input id="productPriceInput" type="number" min="0" step="1" value="${selectedProduct?.price || ""}">
          </label>
          <label class="product-field">
            <span>Foto del tejido</span>
            <input id="productImageInput" type="file" accept="image/*">
          </label>
          ${selectedProduct ? `
            <label class="product-checkbox">
              <input id="removeProductImageInput" type="checkbox">
              <span>Quitar foto actual</span>
            </label>
          ` : ""}
        </div>
        <div class="deadline-modal-actions">
          <button class="button primary" type="button" data-product-save>${selectedProduct ? "Guardar cambios" : "Subir producto nuevo"}</button>
        </div>
      </div>
    </div>
  `;
}

async function handleSaveProduct() {
  const nameInput = document.getElementById("productNameInput");
  const categoryInput = document.getElementById("productCategoryInput");
  const priceInput = document.getElementById("productPriceInput");
  const imageInput = document.getElementById("productImageInput");
  const removeImageInput = document.getElementById("removeProductImageInput");

  if (!nameInput || !categoryInput || !priceInput) {
    return;
  }

  const formData = new FormData();
  formData.append("name", nameInput.value.trim());
  formData.append("category", categoryInput.value);
  formData.append("price", priceInput.value);

  if (imageInput?.files?.[0]) {
    formData.append("image", imageInput.files[0]);
  }

  if (removeImageInput?.checked) {
    formData.append("remove_image", "true");
  }

  try {
    const url = editingProductId ? `/api/productos/${editingProductId}` : "/api/productos";
    const method = editingProductId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    closeProductModal();
    await loadProducts();
  } catch (error) {
    console.error("No fue posible guardar el producto", error);
  }
}

async function handleToggleProduct(productId) {
  try {
    const response = await fetch(`/api/productos/${productId}/toggle`, {
      method: "POST",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    await loadProducts();
  } catch (error) {
    console.error("No fue posible cambiar el estado del producto", error);
  }
}

function normalizeImagePath(path) {
  if (!path) {
    return "images/products/top.jpg";
  }

  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function createModalHost() {
  const existingHost = document.getElementById("productosModalHost");
  if (existingHost) {
    return existingHost;
  }

  const host = document.createElement("div");
  host.id = "productosModalHost";
  document.body.appendChild(host);
  return host;
}
