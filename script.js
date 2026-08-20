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
  Object.entries(routes).map(([view, path]) => [path, view])
);

function openView(name, updateUrl = true) {
  const target = document.querySelector(`[data-page="${name}"]`);
  if (!target) return;

  home.classList.add("hidden");

  views.forEach(view => {
    view.classList.toggle("active", view === target);
  });

  navItems.forEach(item => {
    item.classList.toggle("active", item.dataset.view === name);
  });

  brandItems.forEach(item => {
    const brandView = item.dataset.brand === "coming-soon" ? "coming-soon" : `brand-${item.dataset.brand}`;
    item.classList.toggle("active", brandView === name);
  });

  if (updateUrl) {
    history.pushState({ view: name }, "", routes[name]);
  }
}

function goHome(updateUrl = true) {
  home.classList.remove("hidden");

  views.forEach(view => view.classList.remove("active"));
  navItems.forEach(item => item.classList.remove("active"));
  brandItems.forEach(item => item.classList.remove("active"));

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

navItems.forEach(item => {
  item.addEventListener("click", () => openView(item.dataset.view));
});

brandItems.forEach(item => {
  item.addEventListener("click", () => {
    const brandView = item.dataset.brand === "coming-soon" ? "coming-soon" : "brand-" + item.dataset.brand;
    openView(brandView);
  });
});

document.querySelectorAll('a[href^="/"]').forEach(link => {
  link.addEventListener("click", event => {
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

const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwJlKyjMkLvzDksNRyDUOeb7RnYrhu6QjDh8rp4SEC8Uj_duOjJI0J5Zc6D3EnB4OKjEg/exec";
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

enquiryTrigger.addEventListener("click", event => { event.preventDefault(); openEnquiryModal(); });
enquiryCloseControls.forEach(control => control.addEventListener("click", closeEnquiryModal));

window.addEventListener("keydown", event => {
  if (event.key === "Escape" && enquiryModal.classList.contains("is-open")) closeEnquiryModal();
});

enquiryForm.addEventListener("submit", async event => {

  event.preventDefault();
  
  formStatus.classList.remove("is-error");

  const submitButton = enquiryForm.querySelector('button[type="submit"]');
  
  const formData = new URLSearchParams(new FormData(enquiryForm));
  formData.append("submittedAt", new Date().toISOString());
  formData.append("page", window.location.href);
  
  submitButton.disabled = true;
  formStatus.textContent = "Sending your enquiry...";
  
  try {

    await fetch(
      GOOGLE_SHEET_WEB_APP_URL, 
      { 
        method: "POST", 
        mode: "no-cors", 
        body: formData 
      }
    );
    
    enquiryForm.reset();
    
    formStatus.textContent = "Thank you. Your enquiry has been received.";
  
  } catch (error) {

    formStatus.textContent = "Something went wrong. Please try again or email us directly.";
    formStatus.classList.add("is-error");
  
  } finally {
    submitButton.disabled = false;
  }
});

const kitOptions = document.getElementById("kitOptions");
const kitCards = document.querySelectorAll(".kit-card");
const cartCount = document.querySelector(".cart-count");
const cartEmpty = document.getElementById("cartEmpty");
const cartItems = document.getElementById("cartItems");
const cartEnquire = document.getElementById("cartEnquire");
const CART_STORAGE_KEY = "haus-of-kala-cart";
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");

function setActiveKit(card) {
  kitCards.forEach(item => item.classList.toggle("is-active", item === card));
  kitOptions.classList.toggle("show-custom", card.dataset.kit === "custom");
}

kitCards.forEach(card => {
  card.addEventListener("click", event => {
    if (!event.target.closest(".add-to-cart")) setActiveKit(card);
  });
  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveKit(card);
    }
  });
});

function renderCart() {
  cartCount.textContent = cart.length;
  cartEmpty.hidden = cart.length > 0;
  cartEnquire.hidden = cart.length > 0;
  document.querySelectorAll(".add-to-cart").forEach(button => {
    const isAdded = cart.some(item => item.name === button.dataset.kitName);
    button.disabled = isAdded;
    button.textContent = isAdded ? "Added to cart" : "Add to cart";
  });
  cartItems.innerHTML = cart.map((item, index) => `
    <article class="cart-item">
      <span class="cart-item-index">0${index + 1}</span>
      <div><h3>${item.name}</h3><p>Perfumery Starter Kit</p></div>
      <button type="button" class="cart-remove" data-cart-index="${index}">Remove</button>
    </article>
  `).join("");
}

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.kitName;
    if (!cart.some(item => item.name === name)) {
      cart.push({ name });
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
    renderCart();
  });
});

cartItems.addEventListener("click", event => {
  const removeButton = event.target.closest(".cart-remove");
  if (!removeButton) return;
  cart.splice(Number(removeButton.dataset.cartIndex), 1);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  renderCart();
});

renderCart();
