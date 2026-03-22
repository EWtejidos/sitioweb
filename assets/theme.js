(function () {
  function formatCurrency(value) {
    var body = document.body;
    var locale = body.dataset.moneyLocale || "es-CO";
    var currency = body.dataset.moneyCurrency || "COP";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(value / 100);
  }

  function normalizeText(value) {
    return (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function requestJson(url, options) {
    return fetch(url, Object.assign({
      headers: { Accept: "application/json" }
    }, options || {})).then(function (response) {
      if (!response.ok) throw new Error("Shopify request failed");
      return response.json();
    });
  }

  function renderCart(cart) {
    document.querySelectorAll("[data-cart-count]").forEach(function (node) {
      node.textContent = cart.item_count;
    });

    var heroCartTotal = document.getElementById("heroCartTotal");
    if (heroCartTotal) heroCartTotal.textContent = formatCurrency(cart.total_price);

    var cartItemsContainer = document.getElementById("cartItems");
    var cartTotalElement = document.getElementById("cartTotal");
    var cartEmptyState = document.getElementById("cartEmpty");
    if (!cartItemsContainer || !cartTotalElement || !cartEmptyState) return;

    cartItemsContainer.innerHTML = "";
    cartEmptyState.hidden = cart.items.length > 0;

    cart.items.forEach(function (item, index) {
      var row = document.createElement("article");
      row.className = "cart-item";
      var safeTitle = (item.product_title || "").replace(/"/g, "&quot;");
      var imageMarkup = item.image ? '<img src="' + item.image + '" alt="' + safeTitle + '">' : "";

      row.innerHTML =
        imageMarkup +
        '<div class="cart-item-copy">' +
        '<span class="cart-item-title">' + item.product_title + '</span>' +
        '<span class="cart-item-meta">Cantidad: ' + item.quantity + '</span>' +
        "</div>" +
        '<span class="cart-item-price">' + formatCurrency(item.final_line_price) + "</span>" +
        '<button class="cart-item-remove" type="button" data-line="' + (index + 1) + '">Quitar</button>';

      cartItemsContainer.appendChild(row);
    });

    cartTotalElement.textContent = formatCurrency(cart.total_price);
  }

  function refreshCart() {
    return requestJson("/cart.js").then(function (cart) {
      renderCart(cart);
      return cart;
    });
  }

  function addToCart(form) {
    return requestJson("/cart/add.js", {
      method: "POST",
      body: new FormData(form)
    }).then(refreshCart);
  }

  function removeFromCart(line) {
    return requestJson("/cart/change.js", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ line: Number(line), quantity: 0 })
    }).then(function (cart) {
      renderCart(cart);
      return cart;
    });
  }

  function clearCart() {
    return requestJson("/cart/clear.js", { method: "POST" }).then(function (cart) {
      renderCart(cart);
      return cart;
    });
  }

  function bindCartUi() {
    document.querySelectorAll("[data-product-form]").forEach(function (form) {
      if (form.dataset.ewBound === "true") return;
      form.dataset.ewBound = "true";
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        addToCart(form).then(function () {
          var cartSection = document.getElementById("carrito");
          if (cartSection) cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }).catch(function () {
          window.location.href = "/cart";
        });
      });
    });

    document.addEventListener("click", function (event) {
      var removeButton = event.target.closest("[data-line]");
      if (removeButton) {
        removeFromCart(removeButton.dataset.line).catch(function () {
          window.location.href = "/cart";
        });
      }
    });

    var clearCartButton = document.getElementById("clearCart");
    if (clearCartButton) {
      clearCartButton.addEventListener("click", function () {
        clearCart().catch(function () {
          window.location.href = "/cart";
        });
      });
    }

    var buyButton = document.getElementById("buyButton");
    if (buyButton) {
      buyButton.addEventListener("click", function () {
        refreshCart().then(function (cart) {
          if (!cart.item_count) {
            window.alert("Agrega productos antes de comprar.");
            return;
          }
          window.location.href = "/checkout";
        });
      });
    }

    ["viewCartButton", "siteCartToggle"].forEach(function (id) {
      var button = document.getElementById(id);
      if (!button) return;
      button.addEventListener("click", function () {
        var cartSection = document.getElementById("carrito");
        if (cartSection) {
          cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.href = "/cart";
        }
      });
    });
  }

  function bindSearchUi() {
    var searchInput = document.getElementById("productSearch");
    var searchResults = document.getElementById("searchResults");
    var productCards = Array.prototype.slice.call(document.querySelectorAll(".card[data-product-name]"));
    if (!searchInput || !searchResults || !productCards.length) return;

    var selectedSearchIndex = -1;

    function getMatchingCards(term) {
      var normalizedTerm = normalizeText(term.trim());
      if (!normalizedTerm) return productCards;
      return productCards.filter(function (card) {
        return normalizeText(card.dataset.productName).indexOf(normalizedTerm) !== -1;
      });
    }

    function focusCard(card) {
      productCards.forEach(function (item) {
        item.classList.remove("active", "is-focus");
      });
      card.classList.add("active", "is-focus");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(function () {
        card.classList.remove("is-focus");
      }, 2200);
    }

    function hideSearchResults() {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
      selectedSearchIndex = -1;
    }

    function renderSearchResults(matches) {
      if (!searchInput.value.trim()) {
        hideSearchResults();
        return;
      }

      searchResults.hidden = false;
      searchResults.innerHTML = "";

      if (!matches.length) {
        var emptyState = document.createElement("div");
        emptyState.className = "search-empty";
        emptyState.textContent = "No encontramos productos con ese nombre.";
        searchResults.appendChild(emptyState);
        return;
      }

      matches.forEach(function (card, index) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";
        button.textContent = card.dataset.productName;
        button.addEventListener("click", function () {
          searchInput.value = card.dataset.productName;
          focusCard(card);
          hideSearchResults();
        });
        if (index === selectedSearchIndex) button.classList.add("is-selected");
        searchResults.appendChild(button);
      });
    }

    function filterProducts() {
      var matches = getMatchingCards(searchInput.value);
      var visibleCards = new Set(matches);
      productCards.forEach(function (card) {
        card.classList.toggle("is-hidden", !visibleCards.has(card));
      });
      renderSearchResults(matches);
    }

    searchInput.addEventListener("input", function () {
      selectedSearchIndex = -1;
      filterProducts();
    });

    searchInput.addEventListener("keydown", function (event) {
      var matches = getMatchingCards(searchInput.value);
      if (event.key === "ArrowDown" && matches.length) {
        event.preventDefault();
        selectedSearchIndex = Math.min(selectedSearchIndex + 1, matches.length - 1);
        renderSearchResults(matches);
      }
      if (event.key === "ArrowUp" && matches.length) {
        event.preventDefault();
        selectedSearchIndex = Math.max(selectedSearchIndex - 1, 0);
        renderSearchResults(matches);
      }
      if (event.key === "Enter" && selectedSearchIndex >= 0 && matches[selectedSearchIndex]) {
        event.preventDefault();
        searchInput.value = matches[selectedSearchIndex].dataset.productName;
        focusCard(matches[selectedSearchIndex]);
        hideSearchResults();
      }
      if (event.key === "Escape") hideSearchResults();
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".search-block")) hideSearchResults();
    });

    productCards.forEach(function (card) {
      card.addEventListener("click", function () {
        productCards.forEach(function (item) {
          item.classList.remove("active");
        });
        card.classList.add("active");
      });
    });
  }

  function bindAnimations() {
    var heroLogo = document.querySelector(".logo");
    var heroTitle = document.querySelector(".hero-content h1");
    var heroDescription = document.querySelector(".hero-content > p");
    var heroSearch = document.querySelector(".search");
    var heroButtons = document.querySelectorAll(".cta a, .cta button");

    if (heroLogo && heroTitle && heroDescription && heroSearch) {
      heroLogo.style.opacity = "0";
      heroLogo.style.transform = "scale(0.6)";
      heroTitle.style.opacity = "0";
      heroTitle.style.transform = "translateY(60px)";
      heroSearch.style.opacity = "0";
      heroSearch.style.transform = "translateY(40px)";
      heroDescription.style.opacity = "0";
      heroDescription.style.transform = "translateY(25px)";

      window.setTimeout(function () {
        heroLogo.style.transition = "all 1.4s cubic-bezier(.17,.67,.83,.67)";
        heroLogo.style.opacity = "1";
        heroLogo.style.transform = "scale(1)";
      }, 200);
      window.setTimeout(function () {
        heroTitle.style.transition = "all 1.4s ease";
        heroTitle.style.opacity = "1";
        heroTitle.style.transform = "translateY(0)";
      }, 550);
      window.setTimeout(function () {
        heroSearch.style.transition = "all 1s ease";
        heroSearch.style.opacity = "1";
        heroSearch.style.transform = "translateY(0)";
      }, 800);
      window.setTimeout(function () {
        heroDescription.style.transition = "all 1s ease";
        heroDescription.style.opacity = "1";
        heroDescription.style.transform = "translateY(0)";
      }, 980);

      heroButtons.forEach(function (button, index) {
        button.style.opacity = "0";
        button.style.transform = "translateY(30px)";
        window.setTimeout(function () {
          button.style.transition = "all 0.8s ease";
          button.style.opacity = "1";
          button.style.transform = "translateY(0)";
        }, 1120 + index * 180);
      });
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("animate-in");
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

      document.querySelectorAll(".card, .about-card, .policy-container").forEach(function (element) {
        observer.observe(element);
      });
    }

    document.querySelectorAll(".primary, .secondary").forEach(function (button) {
      button.addEventListener("click", function () {
        button.style.transform = "scale(0.95)";
        window.setTimeout(function () { button.style.transform = ""; }, 150);
      });
    });

    if (heroLogo) {
      heroLogo.addEventListener("mouseenter", function () {
        heroLogo.style.filter = "drop-shadow(0 0 20px rgba(139, 214, 111, 0.8))";
      });
      heroLogo.addEventListener("mouseleave", function () {
        heroLogo.style.filter = "drop-shadow(0 0 47px rgba(56, 228, 93, 0.75))";
      });
    }

    document.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("focus", function () {
        if (input.parentElement) input.parentElement.style.boxShadow = "0 0 10px rgba(139, 214, 111, 0.5)";
      });
      input.addEventListener("blur", function () {
        if (input.parentElement) input.parentElement.style.boxShadow = "";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindCartUi();
    bindSearchUi();
    bindAnimations();
    refreshCart().catch(function () {});
  });
})();
