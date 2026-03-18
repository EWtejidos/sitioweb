const EW_CART_STORAGE_KEY = "ew-cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(EW_CART_STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(EW_CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("ew:cart-updated", { detail: cart }));
}

function getCartCount() {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  return readCart().reduce((total, item) => total + item.price * item.quantity, 0);
}

function syncCounters() {
  const count = getCartCount();
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = count;
  });
}

window.EWCart = {
  getCart() {
    return readCart();
  },

  addItem(product) {
    const cart = readCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    writeCart(cart);
    syncCounters();
  },

  removeItem(productId) {
    const cart = readCart()
      .map((item) => {
        if (item.id !== productId) {
          return item;
        }

        return { ...item, quantity: item.quantity - 1 };
      })
      .filter((item) => item.quantity > 0);

    writeCart(cart);
    syncCounters();
  },

  clearCart() {
    writeCart([]);
    syncCounters();
  },

  getCount() {
    return getCartCount();
  },

  getTotal() {
    return getCartTotal();
  },

  syncCounters
};

syncCounters();
