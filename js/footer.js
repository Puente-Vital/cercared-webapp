class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class='main-footer'>
        <div class='footer-container'>
          
          <!-- Imagen del logo reemplazando el texto anterior -->
          <div class='footer-logo'>
            <a href='#inicio' aria-label='CercaRed Inicio'>
              <img src='assets/images/logofooter.png' alt='CercaRed Logo' class='logo-image'>
            </a>
          </div>
          
          <!-- Enlaces de navegación -->
          <nav class='footer-nav'>
            <a href='#official-sources' class='footer-link'>
              <span class='desktop-text'>Fuentes oficiales</span>
              <span class='mobile-text'>Fuentes</span>
            </a>
            <a href='#terms' class='footer-link'>Términos</a>
            <a href='#privacy' class='footer-link'>Privacidad</a>
            <a href='#contact' class='footer-link'>Contacto</a>
          </nav>
        </div>
      </footer>
    `;
  }
}

customElements.define('main-footer', AppFooter);