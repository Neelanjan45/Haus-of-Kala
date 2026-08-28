const home = document.getElementById("homeView");
const navItems = document.querySelectorAll(".nav-item");
const brandItems = document.querySelectorAll(".brand-nav-item");
const views = document.querySelectorAll(".view");

const routes = {
  home: "/",
  house: "/house",
  products: "/products",
  "starter-kit": "/starter-kit",
  cart: "/cart",
  contact: "/contact",
  "brand-selvora": "/selvora",
  "coming-soon": "/coming-soon",
};

const paths = Object.fromEntries(
  Object.entries(routes).map(([view, path]) => [path, view]),
);

function openView(name, updateUrl = true) {
  const target = document.querySelector(`[data-page="${name}"]`);
  if (!target) return;

  home.classList.add("hidden");

  views.forEach((view) => {
    view.classList.toggle("active", view === target);
  });

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === name);
  });

  brandItems.forEach((item) => {
    const brandView =
      item.dataset.brand === "coming-soon"
        ? "coming-soon"
        : `brand-${item.dataset.brand}`;
    item.classList.toggle("active", brandView === name);
  });

  if (updateUrl) {
    history.pushState({ view: name }, "", routes[name]);
  }
}

function goHome(updateUrl = true) {
  home.classList.remove("hidden");

  views.forEach((view) => view.classList.remove("active"));
  navItems.forEach((item) => item.classList.remove("active"));
  brandItems.forEach((item) => item.classList.remove("active"));

  if (updateUrl) {
    history.pushState({ view: "home" }, "", routes.home);
  }
}

function loadFromPath() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/home";
  const view = paths[path] || "home";

  if (!paths[path]) {
    history.replaceState({ view: "home" }, "", routes.home);
  }

  if (view === "home") {
    goHome(false);
  } else {
    openView(view, false);
  }
}

// function openView(name) {
//   const target = document.querySelector('[data-page="' + name + '"]');
//   if (!target) return;

//   home.classList.add("hidden");

//   views.forEach(view => {
//     view.classList.toggle("active", view === target);
//   });

//   navItems.forEach(item => {
//     item.classList.toggle("active", item.dataset.view === name);
//   });

//   brandItems.forEach(item => {
//     item.classList.toggle("active", "brand-" + item.dataset.brand === name);
//   });

//   history.replaceState(null, "", "#" + name);
// }

// function goHome() {
//   home.classList.remove("hidden");

//   views.forEach(view => view.classList.remove("active"));
//   navItems.forEach(item => item.classList.remove("active"));
//   brandItems.forEach(item => item.classList.remove("active"));

//   history.replaceState(null, "", "#home");
// }

navItems.forEach((item) => {
  item.addEventListener("click", () => openView(item.dataset.view));
});

brandItems.forEach((item) => {
  item.addEventListener("click", () => {
    const brandView =
      item.dataset.brand === "coming-soon"
        ? "coming-soon"
        : "brand-" + item.dataset.brand;
    openView(brandView);
  });
});

document.querySelectorAll('a[href^="/"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const view = paths[link.getAttribute("href")];
    if (!view) return;

    event.preventDefault();
    if (view === "home") {
      goHome();
    } else {
      openView(view);
    }
  });
});

// function loadFromHash() {
//   const hash = window.location.hash.replace("#", "");

//   if (hash && hash !== "home") {
//     openView(hash);
//   } else {
//     goHome();
//   }
// }

// window.addEventListener("hashchange", loadFromHash);
// loadFromHash();

window.addEventListener("popstate", loadFromPath);
loadFromPath();

const GOOGLE_SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwJlKyjMkLvzDksNRyDUOeb7RnYrhu6QjDh8rp4SEC8Uj_duOjJI0J5Zc6D3EnB4OKjEg/exec";
const enquiryModal = document.getElementById("enquiryModal");
const enquiryForm = document.getElementById("enquiryForm");
const formStatus = document.getElementById("formStatus");
const enquiryTrigger = document.querySelector(".contact .minimal-button");
const enquiryCloseControls = document.querySelectorAll("[data-enquiry-close]");
let lastFocusedElement;

function openEnquiryModal() {
  lastFocusedElement = document.activeElement;
  enquiryModal.classList.add("is-open");
  enquiryModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("enquiryName").focus();
}

function closeEnquiryModal() {
  enquiryModal.classList.remove("is-open");
  enquiryModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lastFocusedElement?.focus();
}

enquiryTrigger.addEventListener("click", (event) => {
  event.preventDefault();
  openEnquiryModal();
});
enquiryCloseControls.forEach((control) =>
  control.addEventListener("click", closeEnquiryModal),
);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && enquiryModal.classList.contains("is-open"))
    closeEnquiryModal();
});

enquiryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  formStatus.classList.remove("is-error");

  const submitButton = enquiryForm.querySelector('button[type="submit"]');

  const formData = new URLSearchParams(new FormData(enquiryForm));
  formData.append("submittedAt", new Date().toISOString());
  formData.append("page", window.location.href);

  submitButton.disabled = true;
  formStatus.textContent = "Sending your enquiry...";

  try {
    await fetch(GOOGLE_SHEET_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });

    enquiryForm.reset();

    formStatus.textContent = "Thank you. Your enquiry has been received.";
  } catch (error) {
    formStatus.textContent =
      "Something went wrong. Please try again or email us directly.";
    formStatus.classList.add("is-error");
  } finally {
    submitButton.disabled = false;
  }
});

const KIT_DATA_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx4aupIPrp6w62avT-3Tc7f1zFGUl8fDy0esInS7EUhLkSTldm94Tzuf3uO2Ou5FVWjKg/exec";
const kitOptions = document.getElementById("kitOptions");
const kitCards = document.querySelectorAll(".kit-card");
const cartCount = document.querySelector(".cart-count");
const cartEmpty = document.getElementById("cartEmpty");
const cartItems = document.getElementById("cartItems");
const cartEnquire = document.getElementById("cartEnquire");
const hausKitPriceEl = document.getElementById("hausKitPrice");
const customKitPriceEl = document.getElementById("customKitPrice");
const hausKitIngredientsEl = document.getElementById("hausKitIngredients");
const ingredientAccordionsEl = document.getElementById("ingredientAccordions");
const customSelectionListEl = document.getElementById("customSelectionList");
const customSelectionTotalEl = document.getElementById("customSelectionTotal");
const addCustomKitButton = document.getElementById("addCustomKitToCart");
const CART_STORAGE_KEY = "haus-of-kala-cart";

let catalog = [];
let hausKit = { price: 0, ingredients: [] };
let customSelection = {};
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");

const formatPrice = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
const isTool = (item) =>
  String(item.category || "")
    .toLowerCase()
    .includes("tool");
const itemMin = (item) => {
  const n = Number(item.minValue);
  return Number.isFinite(n) && n > 0 ? n : 1;
};
const itemPrice = (item, q) =>
  Math.max(0, Number(q || 0)) * Number(item.basePrice || 0);
const key = (item) => String(item.id);

function setActiveKit(card) {
  kitCards.forEach((x) => x.classList.toggle("is-active", x === card));
  kitOptions.classList.toggle("show-custom", card.dataset.kit === "custom");
}

kitCards.forEach((card) => {
  card.addEventListener("click", (e) => {
    if (
      !e.target.closest(
        ".add-to-cart,.ingredient-controls,.ingredient-checkbox-wrap,.ingredient-accordion",
      )
    )
      setActiveKit(card);
  });
  card.addEventListener("keydown", (e) => {
    if (
      (e.key === "Enter" || e.key === " ") &&
      !e.target.closest("button,input,summary")
    ) {
      e.preventDefault();
      setActiveKit(card);
    }
  });
});

async function loadKitData() {
  if (KIT_DATA_WEB_APP_URL.includes("PASTE_YOUR")) {
    return renderKitDataError(
      "Connect the kit data Apps Script to load ingredients and prices.",
    );
  }
  try {
    const response = await fetch(KIT_DATA_WEB_APP_URL);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Unable to load kit data.");
    catalog = Array.isArray(data.items) ? data.items : [];
    hausKit = {
      price: Number(data.hausKitPrice || 0),
      ingredients: catalog.filter((x) => x.inHausKit),
    };
    renderHausKit(hausKit);
    renderIngredientAccordions(catalog);
    renderCustomSelection();
  } catch (error) {
    console.error("Kit data error:", error);
    renderKitDataError(
      "The ingredient list could not be loaded. Please try again later.",
    );
  }
}

function renderKitDataError(message) {
  hausKitIngredientsEl.innerHTML = `<li class="kit-loading">${esc(message)}</li>`;
  ingredientAccordionsEl.innerHTML = `<div class="kit-loading">${esc(message)}</div>`;
}

function renderHausKit(hausKit) {
  hausKitPriceEl.textContent = formatPrice(hausKit.price);
  hausKitIngredientsEl.innerHTML = hausKit.ingredients.length
    ? hausKit.ingredients.map((x) => `<li>${esc(x.name)}</li>`).join("")
    : `<li class="kit-loading">The house selection is being prepared.</li>`;
}

// function renderIngredientAccordions(
//   items = catalog,
//   openCategories = []
// ) {
//   const groups = items.reduce((result, item) => {
//     const category = item.category || "Other";

//     if (!result[category]) {
//       result[category] = [];
//     }

//     result[category].push(item);

//     return result;
//   }, {});

//   const names = Object.keys(groups);

//   ingredientAccordionsEl.innerHTML = names.length
//     ? names
//         .map((category, index) => {
//           const shouldBeOpen =
//             openCategories.length
//               ? openCategories.includes(category)
//               : index === 0;

//           return `
//             <details
//               class="ingredient-accordion"
//               ${shouldBeOpen ? "open" : ""}
//             >
//               <summary>
//                 <span>${esc(category)}</span>

//                 <span class="ingredient-count">
//                   ${groups[category].length} ITEMS
//                 </span>
//               </summary>

//               <div>
//                 ${groups[category]
//                   .map(renderIngredientRow)
//                   .join("")}
//               </div>
//             </details>
//           `;
//         })
//         .join("")
//     : `
//         <div class="kit-loading">
//           No ingredients are available yet.
//         </div>
//       `;
// }

function renderIngredientAccordions(items = catalog) {
  const groups = items.reduce((a, item) => {
    const category = item.category || "Other";

    if (!a[category]) {
      a[category] = [];
    }

    a[category].push(item);

    return a;
  }, {});

  const names = Object.keys(groups);

  ingredientAccordionsEl.innerHTML = names.length
    ? names
        .map(
          (category, index) => `
            <details
              class="ingredient-accordion"
              ${index === 0 ? "open" : ""}
            >
              <summary>
                <span>${esc(category)}</span>

                <span class="ingredient-count">
                  ${groups[category].length} ITEMS
                </span>
              </summary>

              <div>
                ${groups[category]
                  .map(renderIngredientRow)
                  .join("")}
              </div>
            </details>
          `,
        )
        .join("")
    : `
        <div class="kit-loading">
          No ingredients are available yet.
        </div>
      `;
}

function renderIngredientRow(item) {
  const selected = customSelection[key(item)];

  const quantity = selected
    ? Number(selected.quantity)
    : itemMin(item);

  const min = itemMin(item);

  const unit =
    item.unit || (isTool(item) ? "pc" : "g");

  const isSelected = Boolean(selected);

  return `
    <div
      class="ingredient-row ${isSelected ? "is-selected" : ""}"
      data-item-id="${esc(item.id)}"
    >

      <div class="ingredient-name-area">

        <label class="ingredient-checkbox-wrap">
          <input
            type="checkbox"
            class="ingredient-checkbox"
            data-action="toggle"
            ${isSelected ? "checked" : ""}
            aria-label="Select ${esc(item.name)}"
          >

          <span class="ingredient-checkbox-box"></span>
        </label>

        <div>
          <div class="ingredient-name">
            ${esc(item.name)}
          </div>

          <span class="ingredient-meta">
            MIN ${min} ${esc(unit)}
            ·
            ${formatPrice(item.basePrice)}
            / ${esc(unit)}
          </span>
        </div>

      </div>

      <div class="ingredient-controls">

        <button
          type="button"
          data-action="decrease"
          aria-label="Decrease ${esc(item.name)}"
        >
          −
        </button>

        <input
          type="number"
          min="${min}"
          step="${isTool(item) ? 1 : "any"}"
          value="${quantity}"
          data-action="quantity"
          aria-label="${esc(item.name)}"
        >

        <button
          type="button"
          data-action="increase"
          aria-label="Increase ${esc(item.name)}"
        >
          +
        </button>

      </div>

      <div class="ingredient-price">
        ${isSelected
          ? formatPrice(itemPrice(item, quantity))
          : formatPrice(0)}
      </div>

    </div>
  `;
}

function updateCustomItem(item, quantity) {
  const min = itemMin(item);

  let n = Number(quantity);

  if (!Number.isFinite(n)) {
    n = min;
  }

  // Quantity cannot go below minimum.
  n = Math.max(min, n);

  // Tools must always use whole numbers.
  if (isTool(item)) {
    n = Math.round(n);
  }

  customSelection[key(item)] = {
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit || (isTool(item) ? "pc" : "g"),
    quantity: n,
    unitPrice: Number(item.basePrice || 0),
    price: itemPrice(item, n),
  };

  renderIngredientAccordions();
  renderCustomSelection();
}

function toggleCustomItem(item, checked) {
  if (checked) {

    const min = itemMin(item);

    customSelection[key(item)] = {
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit || (isTool(item) ? "pc" : "g"),
      quantity: min,
      unitPrice: Number(item.basePrice || 0),
      price: itemPrice(item, min),
    };

  } else {

    delete customSelection[key(item)];

  }

  renderIngredientAccordions();
  renderCustomSelection();
}

ingredientAccordionsEl.addEventListener("click", (event) => {
  const button = event.target.closest(
    'button[data-action="increase"], button[data-action="decrease"]'
  );

  if (!button || button.disabled) return;

  const row = button.closest(".ingredient-row");

  if (!row) return;

  const item = catalog.find(
    (x) => String(x.id) === String(row.dataset.itemId)
  );

  if (!item) return;

  // Quantity controls only work on selected items.
  if (!customSelection[key(item)]) return;

  const input = row.querySelector(
    'input[data-action="quantity"]'
  );

  const min = itemMin(item);

  const current = Math.max(
    min,
    Number(input.value || min)
  );

  const step = isTool(item)
    ? 1
    : min;

  let newQuantity;

  if (button.dataset.action === "increase") {
    newQuantity = current + step;
  } else {
    newQuantity = Math.max(
      min,
      current - step
    );
  }

  updateCustomItem(item, newQuantity);
});

ingredientAccordionsEl.addEventListener("change", (event) => {
  const checkbox = event.target.closest(
    'input[data-action="toggle"]'
  );

  if (!checkbox) return;

  const row = checkbox.closest(".ingredient-row");

  if (!row) return;

  const item = catalog.find(
    (x) => String(x.id) === String(row.dataset.itemId)
  );

  if (!item) return;

  toggleCustomItem(item, checkbox.checked);
});

ingredientAccordionsEl.addEventListener("change", (event) => {
  const input = event.target.closest(
    'input[data-action="quantity"]'
  );

  if (!input) return;

  const row = input.closest(".ingredient-row");

  if (!row) return;

  const item = catalog.find(
    (x) => String(x.id) === String(row.dataset.itemId)
  );

  if (!item) return;

  // Quantity does not select an item.
  if (!customSelection[key(item)]) return;

  updateCustomItem(
    item,
    Number(input.value)
  );
});

function customTotal() {
  return Object.values(customSelection).reduce(
    (s, x) => s + Number(x.price || 0),
    0,
  );
}

function renderCustomSelection() {
  const items = Object.values(customSelection),
    total = customTotal();
  customKitPriceEl.textContent = formatPrice(total);
  customSelectionTotalEl.textContent = formatPrice(total);
  if (!items.length) {
    customSelectionListEl.innerHTML = `<div class="selection-empty">Nothing selected yet.</div>`;
    addCustomKitButton.disabled = true;
    return;
  }
  addCustomKitButton.disabled = false;
  customSelectionListEl.innerHTML = items
    .map(
      (x) => `<div class="selected-item">
    <div><div class="selected-item-name">${esc(x.name)}</div><span class="selected-item-meta">${x.quantity} ${esc(x.unit)}</span></div>
    <div class="selected-item-price">${formatPrice(x.price)}</div></div>`,
    )
    .join("");
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function added(type) {
  return cart.some((x) => x.type === type);
}

function addHausKit() {
  const item = {
    type: "haus",
    name: "Haus of Kala Kit",
    price: hausKit.price,
    ingredients: hausKit.ingredients.map((x) => ({ name: x.name })),
  };
  const i = cart.findIndex((x) => x.type === "haus");
  i >= 0 ? (cart[i] = item) : cart.push(item);
  saveCart();
  renderCart();
}

function addCustomKit() {
  const ingredients = Object.values(customSelection);
  if (!ingredients.length) return;
  const item = {
    type: "custom",
    name: "Make your own Kit",
    price: customTotal(),
    ingredients,
  };
  const i = cart.findIndex((x) => x.type === "custom");
  i >= 0 ? (cart[i] = item) : cart.push(item);
  saveCart();
  renderCart();
}

document
  .querySelector('.add-to-cart[data-kit-name="Haus of Kala Kit"]')
  .addEventListener("click", addHausKit);
addCustomKitButton.addEventListener("click", addCustomKit);

function renderCart() {
  cartCount.textContent = cart.length;
  cartEmpty.hidden = cart.length > 0;
  cartEnquire.hidden = cart.length > 0;
  const hausButton = document.querySelector(
    '.add-to-cart[data-kit-name="Haus of Kala Kit"]',
  );
  if (hausButton)
    hausButton.textContent = added("haus") ? "Update cart" : "Add to cart";
  if (addCustomKitButton && Object.keys(customSelection).length) {
    addCustomKitButton.disabled = false;
    addCustomKitButton.textContent = added("custom")
      ? "Update cart"
      : "Add to cart";
  }
  cartItems.innerHTML = cart
    .map((item, index) => {
      const ingredients = Array.isArray(item.ingredients)
        ? item.ingredients
        : [];
      return `<article class="cart-item">
      <span class="cart-item-index">${String(index + 1).padStart(2, "0")}</span>
      <div><h3>${esc(item.name)}</h3><p>Perfumery Starter Kit</p><div class="cart-item-price">${formatPrice(item.price)}</div></div>
      <button type="button" class="cart-remove" data-cart-index="${index}">Remove</button>
      ${ingredients.length ? `<details class="cart-item-ingredients"><summary>${ingredients.length} selected ingredient${ingredients.length === 1 ? "" : "s"}</summary><ul>${ingredients.map((x) => `<li>${esc(x.name)}${x.quantity ? ` — ${x.quantity} ${esc(x.unit || "")}` : ""}</li>`).join("")}</ul></details>` : ""}
    </article>`;
    })
    .join("");
}

cartItems.addEventListener("click", (e) => {
  const b = e.target.closest(".cart-remove");
  if (!b) return;
  cart.splice(Number(b.dataset.cartIndex), 1);
  saveCart();
  renderCart();
});

renderCart();
loadKitData();
