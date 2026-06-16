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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getUsers = () => {
    const users = localStorage.getItem('cercared_users');
    return users ? JSON.parse(users) : [];
  };

  const saveUser = (user) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('cercared_users', JSON.stringify(users));
  };

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
    e.preventDefault();
    let isValid = true;
    const emailValue = loginEmail.value.trim();
    const passwordValue = loginPassword.value.trim();

    if (emailValue === "") {
      loginEmailError.textContent = "Por favor, ingresa tu correo electrónico.";
      loginEmail.classList.add('input-error');
      isValid = false;
    } else if (!emailRegex.test(emailValue)) {
      loginEmailError.textContent = "Por favor, ingresa un correo electrónico válido.";
      loginEmail.classList.add('input-error');
      isValid = false;
    } else {
      loginEmailError.textContent = "";
      loginEmail.classList.remove('input-error');
    }

    if (passwordValue === "") {
      loginPassword.classList.add('input-error');
      loginPasswordError.textContent = "Por favor, ingresa tu contraseña.";
      isValid = false;
    } else {
      loginPasswordError.textContent = "";
      loginPassword.classList.remove('input-error');
    }

    if (isValid) {
      const users = getUsers();
      const existingUser = users.find(u => u.email === emailValue);

    if (!existingUser) {
            loginEmail.classList.add('input-error');
            loginEmailError.textContent = "Este correo no está registrado.";
          } else if (existingUser.password !== passwordValue) {
            loginPassword.classList.add('input-error');
            loginPasswordError.textContent = "Contraseña incorrecta.";
          } else {
                  localStorage.setItem('cercared_currentUser', JSON.stringify(existingUser));                 
                  loginForm.reset();                
                  window.location.href = 'index.html';
                }
    }
  });

  loginEmail.addEventListener('input', () => {
    if (loginEmail.value.trim() !== "" && emailRegex.test(loginEmail.value.trim())) {
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
    e.preventDefault();
    let isValid = true;

    const nameValue = registerName.value.trim();
    const emailValue = registerEmail.value.trim();
    const passwordValue = registerPassword.value.trim();
    const confirmPasswordValue = registerConfirmPassword.value.trim();

    if (nameValue === "") {
      registerNameError.textContent = "Por favor, ingresa tu nombre completo.";
      registerName.classList.add('input-error');
      isValid = false;
    } else {
      registerNameError.textContent = "";
      registerName.classList.remove('input-error');
    }

    if (emailValue === "") {
      registerEmailError.textContent = "Por favor, ingresa tu correo electrónico.";
      registerEmail.classList.add('input-error');
      isValid = false;
    } else if (!emailRegex.test(emailValue)) {
      registerEmailError.textContent = "Por favor, ingresa un correo electrónico válido.";
      registerEmail.classList.add('input-error');
      isValid = false;
    } else {
      registerEmailError.textContent = "";
      registerEmail.classList.remove('input-error');
    }

    if (passwordValue === "") {
      registerPasswordError.textContent = "Por favor, crea una contraseña.";
      registerPassword.classList.add('input-error');
      isValid = false;
    } else {
      registerPasswordError.textContent = "";
      registerPassword.classList.remove('input-error');
    }

    if (confirmPasswordValue === "") {
      registerConfirmPasswordError.textContent = "Por favor, confirma tu contraseña.";
      registerConfirmPassword.classList.add('input-error');
      isValid = false;
    } else if (passwordValue !== confirmPasswordValue) {
      registerConfirmPasswordError.textContent = "Las contraseñas no coinciden.";
      registerConfirmPassword.classList.add('input-error');
      isValid = false;
    } else {
      registerConfirmPasswordError.textContent = "";
      registerConfirmPassword.classList.remove('input-error');
    }

    if (!registerTerms.checked) {
      registerTermsError.textContent = "Debes aceptar los términos y condiciones para continuar.";
      isValid = false;
    } else {
      registerTermsError.textContent = "";
    }

    if (isValid) {
      const users = getUsers();
      const emailExists = users.some(u => u.email === emailValue);

      if (emailExists) {
        registerEmail.classList.add('input-error');
        registerEmailError.textContent = "Este correo electrónico ya está registrado.";
      } else {
        saveUser({
          name: nameValue,
          email: emailValue,
          password: passwordValue
        });
        
        alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
        registerForm.reset();
        cancelRegister.click();
      }
    }
  });

  registerName.addEventListener('input', () => {
    if (registerName.value.trim() !== "") {
      registerNameError.textContent = "";
      registerName.classList.remove('input-error');
    }
  });

  registerEmail.addEventListener('input', () => {
    if (registerEmail.value.trim() !== "" && emailRegex.test(registerEmail.value.trim())) {
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
  const socialButtons = document.querySelectorAll('.btn-social');
  
  socialButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      alert("El inicio de sesión con redes sociales estará disponible en la próxima versión.");
    });
  });

  const forgotPasswordLink = document.getElementById('forgotPassword');
  
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    const emailPrompt = prompt("Por favor, ingresa tu correo electrónico para restablecer tu contraseña:");
    
    if (emailPrompt === null) {
      return;
    }
    
    if (emailPrompt.trim() === "") {
      alert("Debes ingresar un correo electrónico válido.");
    } else {
      alert(`Se ha enviado un enlace de restablecimiento al correo: ${emailPrompt}. (Simulación de sistema)`);
    }
  });

});