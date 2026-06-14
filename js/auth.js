document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('loginView');
  const registerView = document.getElementById('registerView');
  const authSidebar = document.getElementById('authSidebar');
  
  const loginSidebar = document.getElementById('loginSidebar');
  const registerSidebar = document.getElementById('registerSidebar');

  const toRegister = document.getElementById('toRegister');
  const toLogin = document.getElementById('toLogin');
  const cancelRegister = document.getElementById('cancelRegister');

  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginEmailError = document.getElementById('loginEmailError');
  const loginPasswordError = document.getElementById('loginPasswordError');

  const registerForm = document.getElementById('registerForm');
  const registerName = document.getElementById('registerName');
  const registerEmail = document.getElementById('registerEmail');
  const registerPassword = document.getElementById('registerPassword');
  const registerConfirmPassword = document.getElementById('registerConfirmPassword');
  const registerTerms = document.getElementById('registerTerms');

  const registerNameError = document.getElementById('registerNameError');
  const registerEmailError = document.getElementById('registerEmailError');
  const registerPasswordError = document.getElementById('registerPasswordError');
  const registerConfirmPasswordError = document.getElementById('registerConfirmPasswordError');
  const registerTermsError = document.getElementById('registerTermsError');

  toRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.add('hidden');
    loginSidebar.classList.add('hidden');
    
    registerView.classList.remove('hidden');
    registerSidebar.classList.remove('hidden');
    authSidebar.classList.add('register-mode');
  });

  const showLogin = (e) => {
    e.preventDefault();
    registerView.classList.add('hidden');
    registerSidebar.classList.add('hidden');
    
    loginView.classList.remove('hidden');
    loginSidebar.classList.remove('hidden');
    authSidebar.classList.remove('register-mode');
  };

  toLogin.addEventListener('click', showLogin);
  cancelRegister.addEventListener('click', showLogin);

  loginForm.addEventListener('submit', (e) => {
    let isValid = true;

    if (loginEmail.value.trim() === "") {
      e.preventDefault();
      loginEmailError.textContent = "Por favor, ingresa tu correo electrónico.";
      loginEmail.classList.add('input-error');
      isValid = false;
    } else {
      loginEmailError.textContent = "";
      loginEmail.classList.remove('input-error');
    }

    if (loginPassword.value.trim() === "") {
      e.preventDefault();
      loginPassword.classList.add('input-error');
      loginPasswordError.textContent = "Por favor, ingresa tu contraseña.";
      isValid = false;
    } else {
      loginPasswordError.textContent = "";
      loginPassword.classList.remove('input-error');
    }
  });

  loginEmail.addEventListener('input', () => {
    if (loginEmail.value.trim() !== "") {
      loginEmailError.textContent = "";
      loginEmail.classList.remove('input-error');
    }
  });

  loginPassword.addEventListener('input', () => {
    if (loginPassword.value.trim() !== "") {
      loginPasswordError.textContent = "";
      loginPassword.classList.remove('input-error');
    }
  });

  registerForm.addEventListener('submit', (e) => {
    let isValid = true;

    if (registerName.value.trim() === "") {
      e.preventDefault();
      registerNameError.textContent = "Por favor, ingresa tu nombre completo.";
      registerName.classList.add('input-error');
      isValid = false;
    } else {
      registerNameError.textContent = "";
      registerName.classList.remove('input-error');
    }

    if (registerEmail.value.trim() === "") {
      e.preventDefault();
      registerEmailError.textContent = "Por favor, ingresa tu correo electrónico.";
      registerEmail.classList.add('input-error');
      isValid = false;
    } else {
      registerEmailError.textContent = "";
      registerEmail.classList.remove('input-error');
    }

    if (registerPassword.value.trim() === "") {
      e.preventDefault();
      registerPasswordError.textContent = "Por favor, crea una contraseña.";
      registerPassword.classList.add('input-error');
      isValid = false;
    } else {
      registerPasswordError.textContent = "";
      registerPassword.classList.remove('input-error');
    }

    if (registerConfirmPassword.value.trim() === "") {
      e.preventDefault();
      registerConfirmPasswordError.textContent = "Por favor, confirma tu contraseña.";
      registerConfirmPassword.classList.add('input-error');
      isValid = false;
    } else if (registerPassword.value !== registerConfirmPassword.value) {
      e.preventDefault();
      registerConfirmPasswordError.textContent = "Las contraseñas no coinciden.";
      registerConfirmPassword.classList.add('input-error');
      isValid = false;
    } else {
      registerConfirmPasswordError.textContent = "";
      registerConfirmPassword.classList.remove('input-error');
    }

    if (!registerTerms.checked) {
      e.preventDefault();
      registerTermsError.textContent = "Debes aceptar los términos y condiciones para continuar.";
      isValid = false;
    } else {
      registerTermsError.textContent = "";
    }
  });

  registerName.addEventListener('input', () => {
    if (registerName.value.trim() !== "") {
      registerNameError.textContent = "";
      registerName.classList.remove('input-error');
    }
  });

  registerEmail.addEventListener('input', () => {
    if (registerEmail.value.trim() !== "") {
      registerEmailError.textContent = "";
      registerEmail.classList.remove('input-error');
    }
  });

  registerPassword.addEventListener('input', () => {
    if (registerPassword.value.trim() !== "") {
      registerPasswordError.textContent = "";
      registerPassword.classList.remove('input-error');
    }
  });

  registerConfirmPassword.addEventListener('input', () => {
    if (registerConfirmPassword.value.trim() !== "") {
      registerConfirmPasswordError.textContent = "";
      registerConfirmPassword.classList.remove('input-error');
    }
  });

  registerTerms.addEventListener('change', () => {
    if (registerTerms.checked) {
      registerTermsError.textContent = "";
    }
  });
});