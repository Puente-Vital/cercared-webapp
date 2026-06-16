const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");

function closeMenu() {
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Abrir menú");
}

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    closeMenu();
  }
});

//para cambiar el acceso por Mi perfil en todas las ventanas que el navbar si te logeas
document.addEventListener('DOMContentLoaded', () => {
  const currentUserStr = localStorage.getItem('cercared_currentUser');
  if (currentUserStr) {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
      const authLink = navMenu.querySelector('a[href="auth.html"]');
      //se cambiará solo si esque hay un usuario logeado
      if (authLink) {
        authLink.textContent = 'Mi perfil';
        authLink.href = 'profile.html';
      }
    }
  }
});