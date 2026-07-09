class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class='main-footer'>
        <div class='footer-container'>
          
          <div class='footer-logo'>
            <a href='index.html' aria-label='CercaRed Inicio'>
              <img src='assets/images/logofooter.png' alt='CercaRed Logo' class='logo-image'>
            </a>
          </div>
          
          <nav class='footer-nav'>
            <a href='sources.html' target='_blank' rel='noopener' class='footer-link'>
              <span class='desktop-text'>Fuentes oficiales</span>
              <span class='mobile-text'>Fuentes</span>
            </a>
            
            <a href='terms.html' target='_blank' rel='noopener' class='footer-link'>Términos</a>
            <a href='privacy.html' target='_blank' rel='noopener' class='footer-link'>Privacidad</a>
            
            <a href='mailto:soporte@cercared.com' class='footer-link'>Contacto</a>
          </nav>
        </div>
      </footer>
    `;
  }
}

customElements.define('main-footer', AppFooter);