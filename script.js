const home = document.getElementById("homeView");
const navItems = document.querySelectorAll(".nav-item");
const brandItems = document.querySelectorAll(".brand-nav-item");
const views = document.querySelectorAll(".view");

const routes = {
  home: "/home",
  house: "/house",
  products: "/products",
  contact: "/contact",
  "brand-selvora": "/selvora",
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
    item.classList.toggle("active", `brand-${item.dataset.brand}` === name);
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
  item.addEventListener("click", () => openView("brand-" + item.dataset.brand));
});

document.querySelectorAll('a[href="/home"]').forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    goHome();
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