const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");

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

function updateAuthLink() {
  const currentUserStr = localStorage.getItem('cercared_currentUser');
  const navMenu = document.getElementById('nav-menu');
  if (!navMenu) return;

  const authLink = navMenu.querySelector('a[href="auth.html"], a[href="profile.html"]');
  if (!authLink) return;

  if (currentUserStr) {
    authLink.textContent = 'Mi perfil';
    authLink.href = 'profile.html';
    authLink.classList.toggle('is-active', window.location.pathname.endsWith('/profile.html'));
    if (window.location.pathname.endsWith('/profile.html')) authLink.setAttribute('aria-current', 'page');
    else authLink.removeAttribute('aria-current');
    return;
  }

  authLink.textContent = 'Acceso';
  authLink.href = 'auth.html';
  authLink.classList.toggle('is-active', window.location.pathname.endsWith('/auth.html'));
  if (window.location.pathname.endsWith('/auth.html')) authLink.setAttribute('aria-current', 'page');
  else authLink.removeAttribute('aria-current');
}

window.CercaRedNavbar = { updateAuthLink };

document.addEventListener('DOMContentLoaded', updateAuthLink);
window.addEventListener('storage', updateAuthLink);
