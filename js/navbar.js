const userThemePrefs = JSON.parse(localStorage.getItem('cercared_currentUser'));
if (userThemePrefs && userThemePrefs.preferences && userThemePrefs.preferences.fontSize === 'large') {
  document.body.classList.add('font-large');
}

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const brandLink = document.querySelector(".brand");

if (brandLink) {
  brandLink.href = "https://cercared.netlify.app/";
}

function closeMenu() {
  if (!navMenu || !navToggle) return;
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Abrir menú");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    closeMenu();
  }
});

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('cercared_currentUser') || 'null');
  } catch {
    return null;
  }
}

function isAdminUser() {
  return getCurrentUser()?.role === 'admin';
}

function syncAdminLink() {
  const navMenuElement = document.getElementById('nav-menu');
  if (!navMenuElement) return;

  let adminLink = navMenuElement.querySelector('a[href="admin.html"]');

  if (!isAdminUser()) {
    adminLink?.remove();
    return;
  }

  if (!adminLink) {
    adminLink = document.createElement('a');
    adminLink.href = 'admin.html';
    adminLink.textContent = 'Admin';
    adminLink.addEventListener("click", closeMenu);
    navMenuElement.insertBefore(adminLink, navMenuElement.lastElementChild);
  }

  const isAdminPage = window.location.pathname.endsWith('/admin.html');
  adminLink.classList.toggle('is-active', isAdminPage);
  if (isAdminPage) adminLink.setAttribute('aria-current', 'page');
  else adminLink.removeAttribute('aria-current');
}

// 🚀 LA FUNCIÓN ORIGINAL CORREGIDA: Sincroniza al instante usando localStorage
function updateAuthLink() {
  const currentUserStr = localStorage.getItem('cercared_currentUser');
  const navMenuElement = document.getElementById('nav-menu');
  if (!navMenuElement) return;

  const authLink = navMenuElement.querySelector('a[href="auth.html"], a[href="profile.html"]');
  if (!authLink) return;

  if (currentUserStr) {
    authLink.textContent = 'Mi perfil';
    authLink.href = 'profile.html';
    authLink.classList.toggle('is-active', window.location.pathname.endsWith('/profile.html'));
    if (window.location.pathname.endsWith('/profile.html')) authLink.setAttribute('aria-current', 'page');
    else authLink.removeAttribute('aria-current');
    syncAdminLink();
    return;
  }

  authLink.textContent = 'Acceso';
  authLink.href = 'auth.html';
  authLink.classList.toggle('is-active', window.location.pathname.endsWith('/auth.html'));
  if (window.location.pathname.endsWith('/auth.html')) authLink.setAttribute('aria-current', 'page');
  else authLink.removeAttribute('aria-current');
  syncAdminLink();
}

// 🚀 AQUÍ ESTÁ LA CLAVE: Hacerla global explícitamente para que auth.js la encuentre
window.CercaRedNavbar = { updateAuthLink };

// Ejecutar inmediatamente al cargar el documento
document.addEventListener('DOMContentLoaded', updateAuthLink);
window.addEventListener('storage', updateAuthLink);
