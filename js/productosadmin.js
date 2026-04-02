/* ============================================================
   PRODUCTOS ADMIN - Lógica principal
   ============================================================ */

// Estado global
const productosState = {
  allProducts: [],
  filteredProducts: [],
  containerRef: null,
  statusRef: null,
  currentPage: 1,
  itemsPerPage: 10,
  currentModalType: null,
  selectedProduct: null,
  filters: {
    searchQuery: '',
    category: '',
    priceMin: '',
    priceMax: '',
    source: '' // 'cliente' | 'tejedor' | ''
  }
};

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'bases') return;
  
  const basesTabs = document.querySelectorAll('[data-tab]');
  const moduleContent = document.getElementById('moduleContent');
  const statusBadge = document.getElementById('statusBadge');
  
  productosState.containerRef = moduleContent;
  productosState.statusRef = statusBadge;
  
  // Agregar listener a la pestaña de productos
  basesTabs.forEach(tab => {
    if (tab.dataset.tab === 'productos') {
      tab.addEventListener('click', () => {
        loadAndRenderProductos();
      });
    }
  });
  
  // Escuchar cambios en tabs
  basesTabs.forEach(tab => {
    const originalHandler = tab.onclick;
    tab.addEventListener('click', () => {
      if (tab.dataset.tab === 'productos') {
        setTimeout(() => loadAndRenderProductos(), 100);
      }
    });
  });
});

// ============================================================
// CARGA DE DATOS
// ============================================================

async function loadAndRenderProductos() {
  try {
    updateStatus('Cargando productos...');
    
    // Cargar datos de ambas fuentes en paralelo
    const [clientOrders, weaverProducts] = await Promise.all([
      loadClientOrders(),
      loadWeaverProducts()
    ]);
    
    // Combinar datos
    productosState.allProducts = combineProductData(clientOrders, weaverProducts);
    productosState.filteredProducts = [...productosState.allProducts];
    
    renderTableAndFilters();
    updateStatus(`${productosState.allProducts.length} productos cargados (${clientOrders.length} pedidos + ${weaverProducts.length} creaciones)`);
  } catch (error) {
    console.error('Error cargando productos:', error);
    updateStatus('Error al cargar productos');
    renderEmptyState('No fue posible cargar los productos');
  }
}

async function loadClientOrders() {
  try {
    const response = await fetch('/api/orders', {
      headers: { Accept: 'application/json' }
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    if (response.status === 404) return [];
    
    const orders = await response.json();
    if (!Array.isArray(orders)) return [];
    
    // Filtrar solo órdenes que tienen información de producto
    return orders.filter(order => order.product_name || order.product_image);
  } catch (error) {
    console.error('Error cargando órdenes de clientes:', error);
    return [];
  }
}

async function loadWeaverProducts() {
  try {
    const response = await fetch('/api/productos', {
      headers: { Accept: 'application/json' }
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    if (response.status === 404) return [];
    
    const products = await response.json();
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('Error cargando productos de tejedores:', error);
    return [];
  }
}

function combineProductData(clientOrders, weaverProducts) {
  const combined = [];
  
  // Agregar órdenes de clientes como productos
  clientOrders.forEach(order => {
    // Mapear campos del servidor (que usa to_admin_dict())
    // quote_min → cotizacion_min, quote_max → cotizacion_max, etc.
    const mappedOrder = {
      ...order,
      // Mapear nombres renombrados por to_admin_dict() de vuelta a nombres esperados
      quote_min: order.cotizacion_min || order.quote_min,
      quote_max: order.cotizacion_max || order.quote_max,
      advance_payment: order.anticipo || order.advance_payment,
      assigned_to: order.weaver || order.assigned_to,
      order_code: order.order_code || '',
      created_at: order.fecha_hora ? new Date(order.fecha_hora).toISOString() : new Date().toISOString()
    };
    
    combined.push({
      id: mappedOrder.id_orden || mappedOrder.id,
      productId: mappedOrder.id_orden,
      name: mappedOrder.product_name || 'Producto sin nombre',
      category: mappedOrder.producto?.split(' / ')[0] || mappedOrder.product_type || 'Personalizado',
      price: mappedOrder.quote_max || mappedOrder.quote_min || 0,
      priceMin: mappedOrder.quote_min || 0,
      priceMax: mappedOrder.quote_max || 0,
      image: mappedOrder.product_image,
      images: mappedOrder.product_image ? [mappedOrder.product_image] : [],
      source: 'cliente',
      colors: mappedOrder.colors || '',
      measurements: `${mappedOrder.length_cm || '?'} x ${mappedOrder.width_cm || '?'} cm`,
      description: mappedOrder.description || '',
      orders: mappedOrder.order_code ? [mappedOrder.order_code] : [],
      fullData: mappedOrder,
      created: mappedOrder.created_at || new Date().toISOString()
    });
  });
  
  // Agregar productos de tejedores
  weaverProducts.forEach(product => {
    combined.push({
      id: `P-${String(product.id).padStart(5, '0')}`,
      productId: product.id,
      name: product.name || 'Producto sin nombre',
      category: product.category || 'General',
      price: product.price || 0,
      priceMin: product.price || 0,
      priceMax: product.price || 0,
      image: product.image_path,
      images: product.image_path ? [product.image_path] : [],
      source: 'tejedor',
      colors: '',
      measurements: '',
      description: '',
      orders: [],
      fullData: product,
      created: product.created_at || new Date().toISOString()
    });
  });
  
  return combined;
}

// ============================================================
// RENDERIZADO PRINCIPAL
// ============================================================

function renderTableAndFilters() {
  if (!productosState.containerRef) return;
  
  const html = `
    <article class="section-card">
      <div class="section-topline">
        <div>
          <h4>Catálogo de productos</h4>
          <span class="mini-copy">Gestiona productos de clientes y tejedores desde un único panel.</span>
        </div>
      </div>

      <div class="productos-container">
        <!-- Filtros -->
        <div class="productos-filters">
          <div class="filters-row">
            <div class="filter-group">
              <label for="searchProducts">Búsqueda</label>
              <input type="text" id="searchProducts" placeholder="ID, nombre..." />
            </div>
            <div class="filter-group">
              <label for="filterCategory">Categoría</label>
              <select id="filterCategory">
                <option value="">Todas</option>
                ${getUniqueCategories().map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>
            <div class="filter-group">
              <label for="filterSource">Procedencia</label>
              <select id="filterSource">
                <option value="">Todas</option>
                <option value="cliente">Pedidos de clientes</option>
                <option value="tejedor">Creaciones de tejedores</option>
              </select>
            </div>
          </div>

          <div class="filters-row">
            <div class="filter-group">
              <label for="filterPriceMin">Precio mínimo</label>
              <input type="number" id="filterPriceMin" placeholder="0" />
            </div>
            <div class="filter-group">
              <label for="filterPriceMax">Precio máximo</label>
              <input type="number" id="filterPriceMax" placeholder="999999" />
            </div>
          </div>

          <div class="filters-actions">
            <button class="button primary" id="btnApplyFilters">Aplicar filtros</button>
            <button class="button secondary" id="btnClearFilters">Limpiar</button>
            <button class="button secondary" id="btnExportCSV">📥 Exportar CSV</button>
          </div>
        </div>

        <!-- Tabla -->
        <div id="productosTableContainer"></div>

        <!-- Paginación -->
        <div id="paginationContainer"></div>
      </div>
    </article>
  `;
  
  productosState.containerRef.innerHTML = html;
  
  // Agregar event listeners
  setupFilterListeners();
  renderTable();
}

function setupFilterListeners() {
  const searchInput = document.getElementById('searchProducts');
  const categoryFilter = document.getElementById('filterCategory');
  const sourceFilter = document.getElementById('filterSource');
  const priceMinInput = document.getElementById('filterPriceMin');
  const priceMaxInput = document.getElementById('filterPriceMax');
  const applyButton = document.getElementById('btnApplyFilters');
  const clearButton = document.getElementById('btnClearFilters');
  const exportButton = document.getElementById('btnExportCSV');
  
  // Buscar mientras escribe
  searchInput?.addEventListener('input', debounce(() => applyFilters(), 300));
  
  // Filtros se aplican al hacer click
  applyButton?.addEventListener('click', applyFilters);
  clearButton?.addEventListener('click', clearFilters);
  exportButton?.addEventListener('click', exportToCSV);
  
  // Enter para buscar
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyFilters();
  });
}

function applyFilters() {
  const searchQuery = (document.getElementById('searchProducts')?.value || '').toLowerCase();
  const category = document.getElementById('filterCategory')?.value || '';
  const source = document.getElementById('filterSource')?.value || '';
  const priceMin = parseFloat(document.getElementById('filterPriceMin')?.value) || 0;
  const priceMax = parseFloat(document.getElementById('filterPriceMax')?.value) || Infinity;
  
  productosState.filters = { searchQuery, category, source, priceMin, priceMax };
  productosState.currentPage = 1;
  
  productosState.filteredProducts = productosState.allProducts.filter(product => {
    // Búsqueda por ID y nombre
    const matchesSearch = 
      product.id.toLowerCase().includes(searchQuery) ||
      product.name.toLowerCase().includes(searchQuery);
    
    // Filtro por categoría
    const matchesCategory = !category || product.category === category;
    
    // Filtro por procedencia
    const matchesSource = !source || product.source === source;
    
    // Filtro por precio
    const matchesPrice = product.price >= priceMin && product.price <= priceMax;
    
    return matchesSearch && matchesCategory && matchesSource && matchesPrice;
  });
  
  renderTable();
}

function clearFilters() {
  document.getElementById('searchProducts').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterSource').value = '';
  document.getElementById('filterPriceMin').value = '';
  document.getElementById('filterPriceMax').value = '';
  
  productosState.filters = {
    searchQuery: '',
    category: '',
    priceMin: '',
    priceMax: '',
    source: ''
  };
  productosState.currentPage = 1;
  productosState.filteredProducts = [...productosState.allProducts];
  
  renderTable();
}

function renderTable() {
  const container = document.getElementById('productosTableContainer');
  if (!container) return;
  
  // Calcular paginación
  const total = productosState.filteredProducts.length;
  const totalPages = Math.ceil(total / productosState.itemsPerPage);
  const start = (productosState.currentPage - 1) * productosState.itemsPerPage;
  const end = start + productosState.itemsPerPage;
  const paginatedProducts = productosState.filteredProducts.slice(start, end);
  
  if (total === 0) {
    renderEmptyState('No hay productos que coincidan con tu búsqueda');
    return;
  }
  
  const tableHtml = `
    <div class="productos-table-container">
      <table class="productos-table">
        <thead>
          <tr>
            <th style="width: 12%;">ID</th>
            <th style="width: 15%;">Producto</th>
            <th style="width: 12%;">P. Cliente</th>
            <th style="width: 12%;">P. Tejedor (25%)</th>
            <th style="width: 10%;">Imagen</th>
            <th style="width: 8%;">Compras</th>
            <th style="width: 12%;">Proviene</th>
            <th style="width: 19%;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${paginatedProducts.map(product => `
            <tr>
              <td>
                <span class="table-id" data-product-id="${product.id}" title="Ver detalles">
                  ${product.id}
                </span>
              </td>
              <td><strong>${escapeHtml(product.name)}</strong></td>
              <td class="table-price">$${formatNumber(product.price)}</td>
              <td class="table-price">$${formatNumber(Math.round(product.price * 0.25))}</td>
              <td>
                ${product.image ? `
                  <div class="table-image-cell">
                    <img src="${normalizeImagePath(product.image)}" 
                         alt="${escapeHtml(product.name)}"
                         data-product-id="${product.id}"
                         class="gallery-trigger" />
                  </div>
                ` : `
                  <div class="table-image-cell no-image">📷</div>
                `}
              </td>
              <td>${product.orders.length}</td>
              <td>
                <span class="table-source ${product.source}">
                  ${product.source === 'cliente' ? '👤 Cliente' : '🧵 Tejedor'}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="button secondary" data-action="view" data-product-id="${product.id}">Ver</button>
                  <button class="button secondary" data-action="edit" data-product-id="${product.id}">Editar</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = tableHtml;
  
  // Renderizar paginación
  renderPagination(totalPages, total);
  
  // Agregar event listeners a la tabla
  setupTableListeners();
}

function renderPagination(totalPages, total) {
  const container = document.getElementById('paginationContainer');
  if (!container || totalPages <= 1) return;
  
  let html = '<div class="pagination">';
  
  // Botón anterior
  if (productosState.currentPage > 1) {
    html += `
      <button type="button" data-page="prev" title="Página anterior">←</button>
    `;
  }
  
  // Números de página
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= productosState.currentPage - 2 && i <= productosState.currentPage + 2)) {
      if (i === productosState.currentPage) {
        html += `<span class="active">${i}</span>`;
      } else {
        html += `<button type="button" data-page="${i}">${i}</button>`;
      }
    } else if (i === productosState.currentPage - 3 || i === productosState.currentPage + 3) {
      html += `<span>...</span>`;
    }
  }
  
  // Botón siguiente
  if (productosState.currentPage < totalPages) {
    html += `
      <button type="button" data-page="next" title="Página siguiente">→</button>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
  
  // Event listeners para paginación
  document.querySelectorAll('.pagination button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = e.target.dataset.page;
      if (page === 'prev') {
        productosState.currentPage = Math.max(1, productosState.currentPage - 1);
      } else if (page === 'next') {
        productosState.currentPage++;
      } else {
        productosState.currentPage = parseInt(page);
      }
      renderTable();
    });
  });
}

function setupTableListeners() {
  // ID para ver detalles
  document.querySelectorAll('.table-id').forEach(el => {
    el.addEventListener('click', (e) => {
      const productId = e.target.dataset.productId;
      showProductDetails(productId);
    });
  });
  
  // Imagen para ver galería
  document.querySelectorAll('.gallery-trigger').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = e.target.dataset.productId;
      showProductGallery(productId);
    });
  });
  
  // Botones de acción
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const productId = e.target.dataset.productId;
      
      if (action === 'view') {
        showProductDetails(productId);
      } else if (action === 'edit') {
        showProductEditModal(productId);
      }
    });
  });
}

function renderEmptyState(message = 'No hay productos') {
  const container = document.getElementById('productosTableContainer');
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3 class="empty-state-title">${message}</h3>
        <p class="empty-state-text">Intenta ajustar tus filtros o carga nuevos productos.</p>
      </div>
    `;
  }
}

// ============================================================
// MODALES
// ============================================================

function showProductDetails(productId) {
  const product = productosState.allProducts.find(p => p.id === productId);
  if (!product) return;
  
  productosState.selectedProduct = product;
  productosState.currentModalType = 'details';
  
  const modal = createDetailModal(product);
  document.body.appendChild(modal);
  setupModalListeners();
}

function showProductGallery(productId) {
  const product = productosState.allProducts.find(p => p.id === productId);
  if (!product || !product.images.length) return;
  
  productosState.selectedProduct = product;
  productosState.currentModalType = 'gallery';
  
  const modal = createGalleryModal(product);
  document.body.appendChild(modal);
  setupModalListeners();
}

function showProductEditModal(productId) {
  const product = productosState.allProducts.find(p => p.id === productId);
  if (!product) return;
  
  productosState.selectedProduct = product;
  productosState.currentModalType = 'edit';
  
  const modal = createEditModal(product);
  document.body.appendChild(modal);
  setupModalListeners();
}

function createDetailModal(product) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.dataset.modalClose = 'true';
  
  const card = document.createElement('div');
  card.className = 'modal-card';
  
  const ordersText = product.orders.length > 0 
    ? `(${product.orders.join(', ')})` 
    : '(Sin órdenes asociadas)';
  
  card.innerHTML = `
    <button class="modal-close" data-modal-close="true" type="button">✕</button>
    
    <div class="modal-header">
      <h2>${escapeHtml(product.name)}</h2>
      <p>ID: ${product.id} • ${product.source === 'cliente' ? '👤 Pedido' : '🧵 Creación'}</p>
    </div>

    <div class="modal-content">
      ${product.image ? `
        <div class="modal-section">
          <div class="modal-section-title">Imagen</div>
          <div style="text-align: center;">
            <img src="${normalizeImagePath(product.image)}" 
                 alt="${escapeHtml(product.name)}"
                 style="max-width: 100%; height: auto; border-radius: 12px; max-height: 400px;" />
          </div>
        </div>
      ` : ''}

      <div class="modal-section">
        <div class="modal-section-title">Información principal</div>
        <div class="modal-details-grid">
          <div class="detail-item">
            <span class="detail-label">Nombre</span>
            <span class="detail-value">${escapeHtml(product.name)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Categoría</span>
            <span class="detail-value">${escapeHtml(product.category)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Precio</span>
            <span class="detail-value">$${formatNumber(product.price)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tejedor (25%)</span>
            <span class="detail-value">$${formatNumber(Math.round(product.price * 0.25))}</span>
          </div>
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Detalles adicionales</div>
        <div class="modal-details-grid">
          ${product.colors ? `
            <div class="detail-item">
              <span class="detail-label">Colores</span>
              <span class="detail-value">${escapeHtml(product.colors)}</span>
            </div>
          ` : ''}
          ${product.measurements ? `
            <div class="detail-item">
              <span class="detail-label">Medidas</span>
              <span class="detail-value">${escapeHtml(product.measurements)}</span>
            </div>
          ` : ''}
          <div class="detail-item">
            <span class="detail-label">Procedencia</span>
            <span class="detail-value">${product.source === 'cliente' ? '👤 Pedido de cliente' : '🧵 Creación de tejedor'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Órdenes asociadas</span>
            <span class="detail-value">${ordersText}</span>
          </div>
        </div>
      </div>

      ${product.description ? `
        <div class="modal-section">
          <div class="modal-section-title">Descripción</div>
          <div style="padding: 1rem; background: rgba(20, 76, 54, 0.04); border-radius: 12px;">
            <p style="margin: 0; color: var(--text-main);">${escapeHtml(product.description)}</p>
          </div>
        </div>
      ` : ''}
    </div>

    <div class="form-actions">
      <button class="button secondary" data-modal-close="true" type="button">Cerrar</button>
      <button class="button primary" data-action="edit-from-modal" type="button">Editar producto</button>
    </div>
  `;
  
  overlay.appendChild(card);
  return overlay;
}

function createGalleryModal(product) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.dataset.modalClose = 'true';
  
  const card = document.createElement('div');
  card.className = 'modal-card';
  
  const images = product.images.filter(img => img);
  
  card.innerHTML = `
    <button class="modal-close" data-modal-close="true" type="button">✕</button>
    
    <div class="modal-header">
      <h2>Galería - ${escapeHtml(product.name)}</h2>
    </div>

    <div class="modal-content">
      <div class="modal-gallery">
        <div class="gallery-main">
          ${images[0] ? `
            <img src="${normalizeImagePath(images[0])}" 
                 alt="${escapeHtml(product.name)}"
                 id="galleryMainImage" />
          ` : '<span style="font-size: 3rem;">📷</span>'}
        </div>
        
        ${images.length > 1 ? `
          <div class="gallery-nav">
            <button type="button" data-gallery-nav="prev" ${images.length <= 1 ? 'disabled' : ''}>‹</button>
            <span class="gallery-counter">
              <span id="currentImageIndex">1</span> / <span id="totalImages">${images.length}</span>
            </span>
            <button type="button" data-gallery-nav="next" ${images.length <= 1 ? 'disabled' : ''}>›</button>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="form-actions">
      <button class="button primary" data-modal-close="true" type="button">Cerrar</button>
    </div>
  `;
  
  overlay.appendChild(card);
  
  // Setup galería
  const galleryModal = {
    images: images,
    currentIndex: 0
  };
  
  const navButtons = card.querySelectorAll('[data-gallery-nav]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const direction = e.target.dataset.galleryNav;
      if (direction === 'prev') {
        galleryModal.currentIndex = (galleryModal.currentIndex - 1 + images.length) % images.length;
      } else {
        galleryModal.currentIndex = (galleryModal.currentIndex + 1) % images.length;
      }
      
      const mainImg = document.getElementById('galleryMainImage');
      if (mainImg && galleryModal.images[galleryModal.currentIndex]) {
        mainImg.src = normalizeImagePath(galleryModal.images[galleryModal.currentIndex]);
      }
      document.getElementById('currentImageIndex').textContent = galleryModal.currentIndex + 1;
    });
  });
  
  return overlay;
}

function createEditModal(product) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.dataset.modalClose = 'true';
  
  const card = document.createElement('div');
  card.className = 'modal-card';
  
  card.innerHTML = `
    <button class="modal-close" data-modal-close="true" type="button">✕</button>
    
    <div class="modal-header">
      <h2>Editar producto</h2>
      <p>ID: ${product.id}</p>
    </div>

    <form class="modal-form" id="editProductForm">
      <div class="form-group">
        <label for="editName">Nombre del producto</label>
        <input type="text" id="editName" value="${escapeHtml(product.name)}" required />
      </div>

      <div class="form-group">
        <label for="editCategory">Categoría</label>
        <input type="text" id="editCategory" value="${escapeHtml(product.category)}" />
      </div>

      <div class="form-group">
        <label for="editPrice">Precio</label>
        <input type="number" id="editPrice" value="${product.price}" min="0" />
      </div>

      ${product.source === 'cliente' ? `
        <div class="form-group">
          <label for="editColors">Colores</label>
          <input type="text" id="editColors" value="${escapeHtml(product.colors)}" placeholder="Ej: rojo, azul, amarillo" />
        </div>

        <div class="form-group">
          <label for="editMeasurements">Medidas</label>
          <input type="text" id="editMeasurements" value="${escapeHtml(product.measurements)}" placeholder="Ej: 50 x 30 cm" />
        </div>

        <div class="form-group">
          <label for="editDescription">Descripción</label>
          <textarea id="editDescription">${escapeHtml(product.description)}</textarea>
        </div>
      ` : ''}

      <div class="form-actions">
        <button type="button" class="button secondary" data-modal-close="true">Cancelar</button>
        <button type="submit" class="button primary">Guardar cambios</button>
      </div>
    </form>
  `;
  
  overlay.appendChild(card);
  
  // Event listener para guardar
  const form = card.querySelector('#editProductForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveProductChanges(
      product.id,
      document.getElementById('editName').value,
      document.getElementById('editCategory').value,
      parseInt(document.getElementById('editPrice').value) || 0,
      document.getElementById('editColors')?.value || '',
      document.getElementById('editMeasurements')?.value || '',
      document.getElementById('editDescription')?.value || ''
    );
  });
  
  return overlay;
}

function setupModalListeners() {
  // Cerrar modal
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal();
    });
  });
  
  // Cerrar modal al hacer click fuera
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  });
  
  // Editar desde detalles
  document.querySelectorAll('[data-action="edit-from-modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (productosState.selectedProduct) {
        closeModal();
        setTimeout(() => {
          showProductEditModal(productosState.selectedProduct.id);
        }, 100);
      }
    });
  });
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
  }
  productosState.currentModalType = null;
  productosState.selectedProduct = null;
}

// ============================================================
// GUARDADO DE CAMBIOS
// ============================================================

function handleSaveProductChanges(productId, name, category, price, colors, measurements, description) {
  // Actualizar en estado local
  const product = productosState.allProducts.find(p => p.id === productId);
  if (!product) return;
  
  product.name = name;
  product.category = category;
  product.price = price;
  if (product.source === 'cliente') {
    product.colors = colors;
    product.measurements = measurements;
    product.description = description;
  }
  
  // Aquí iría el llamado a una API para guardar en el backend
  // Por ahora, solo mostramos que se guardó
  updateStatus(`✅ Producto "${name}" actualizado localmente`);
  
  closeModal();
  applyFilters();
}

// ============================================================
// EXPORTACIÓN A CSV
// ============================================================

function exportToCSV() {
  const products = productosState.filteredProducts.length > 0 
    ? productosState.filteredProducts 
    : productosState.allProducts;
  
  if (products.length === 0) {
    alert('No hay productos para exportar');
    return;
  }
  
  // Headers del CSV
  const headers = [
    'ID_P',
    'Producto',
    'Categoría',
    'Precio Cliente',
    'Precio Tejedor (25%)',
    'Colores',
    'Medidas',
    'Descripción',
    'Órdenes Asociadas',
    'Procedencia',
    'Compras'
  ];
  
  // Datos
  const rows = products.map(p => [
    p.id,
    p.name,
    p.category,
    p.price,
    Math.round(p.price * 0.25),
    p.colors || '-',
    p.measurements || '-',
    (p.description || '-').replace(/"/g, '""'),
    p.orders.length > 0 ? p.orders.join('; ') : '-',
    p.source === 'cliente' ? 'Pedido de cliente' : 'Creación de tejedor',
    p.orders.length
  ]);
  
  // Construir CSV con BOM UTF-8 para compatibilidad con Excel
  // BOM (Byte Order Mark) es necesario para que Excel reconozca el encoding correcto
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Agregar BOM UTF-8: \uFEFF es el carácter BOM en Unicode
  const csvWithBOM = '\uFEFF' + csvContent;
  
  // Descargar
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `productos_export_${formatDate(new Date())}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  updateStatus(`✅ ${products.length} productos exportados a CSV`);
}

// ============================================================
// UTILIDADES
// ============================================================

function getUniqueCategories() {
  const categories = new Set();
  productosState.allProducts.forEach(p => {
    if (p.category) categories.add(p.category);
  });
  return Array.from(categories).sort();
}

function updateStatus(message) {
  if (productosState.statusRef) {
    productosState.statusRef.textContent = message;
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function normalizeImagePath(path) {
  if (!path) return '';
  
  // Si ya es una URL válida absoluta, devolverla como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si es ruta absoluta con /, devolverla como está
  if (path.startsWith('/')) {
    return path;
  }
  
  // Para rutas relativas como "img/..." o "products/...", intentar cargar desde /static/ primero
  // Si la imagen viene de whatsapp_utils, debe estar en /static/img/
  // Si viene de productos de tejedores, puede estar en /static/products/ o similar
  
  // Caso especial: si empieza con "img/", es de whatsapp_utils
  if (path.startsWith('img/')) {
    return `/static/${path}`;
  }
  
  // Caso especial: si empieza con "productos/", es del catalogo de tejedores
  if (path.startsWith('productos/') || path.startsWith('comprobante/') || path.startsWith('ordenes/')) {
    return `/static/${path}`;
  }
  
  // Por defecto, agregar /static/ si no comienza con /
  if (!path.startsWith('/')) {
    return `/static/${path}`;
  }
  
  return path;
}

function formatNumber(num) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}
