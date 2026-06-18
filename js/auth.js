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
  const registerPhone = document.getElementById('registerPhone');
  const registerPassword = document.getElementById('registerPassword');
  const registerConfirmPassword = document.getElementById('registerConfirmPassword');
  const registerTerms = document.getElementById('registerTerms');

  const registerNameError = document.getElementById('registerNameError');
  const registerEmailError = document.getElementById('registerEmailError');
  const registerPhoneError = document.getElementById('registerPhoneError');
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
        window.CercaRedNavbar?.updateAuthLink();
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
    const phoneValue = registerPhone.value.trim();
    const phoneRegex = /^[0-9]{9}$/;

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

    if (phoneValue === "") {
      registerPhoneError.textContent = "Por favor, ingresa tu número de celular.";
      registerPhone.classList.add('input-error');
      isValid = false;
    } else if (!phoneRegex.test(phoneValue)) {
      registerPhoneError.textContent = "Ingresa un número válido de 9 dígitos.";
      registerPhone.classList.add('input-error');
      isValid = false;
    } else {
      registerPhoneError.textContent = "";
      registerPhone.classList.remove('input-error');
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
          phone: phoneValue,
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

  registerPhone.addEventListener('input', () => {
    registerPhone.value = registerPhone.value.replace(/[^0-9]/g, '');
    
    if (registerPhone.value.trim() !== "" && /^[0-9]{9}$/.test(registerPhone.value.trim())) {
      registerPhoneError.textContent = "";
      registerPhone.classList.remove('input-error');
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
  const recoveryModal = document.getElementById('recoveryModal');
  const closeModal = document.getElementById('closeModal');

  const step1 = document.getElementById('recoveryStep1');
  const step2 = document.getElementById('recoveryStep2');
  const step3 = document.getElementById('recoveryStep3');
  const step4 = document.getElementById('recoveryStep4');

  const btnStep1 = document.getElementById('btnRecoveryStep1');
  const btnStep2 = document.getElementById('btnRecoveryStep2');
  const btnStep3 = document.getElementById('btnRecoveryStep3');
  const btnFinish = document.getElementById('btnRecoveryFinish');

  const recEmail = document.getElementById('recoveryEmail');
  const recPhone = document.getElementById('recoveryPhone');
  const newPass = document.getElementById('newPassword');

  const recEmailError = document.getElementById('recoveryEmailError');
  const recPhoneError = document.getElementById('recoveryPhoneError');
  const newPassError = document.getElementById('newPasswordError');
  const maskedPhoneHint = document.getElementById('maskedPhoneHint');

  let recoveryUser = null; 

  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    recoveryModal.classList.remove('hidden');
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
    step3.classList.add('hidden');
    step4.classList.add('hidden');
    recEmail.value = '';
    recPhone.value = '';
    newPass.value = '';
    recEmail.classList.remove('input-error');
    recEmailError.textContent = '';
  });

  closeModal.addEventListener('click', () => {
    recoveryModal.classList.add('hidden');
  });

  btnStep1.addEventListener('click', () => {
    const email = recEmail.value.trim();
    if (email === '') {
      recEmailError.textContent = 'Ingresa tu correo.';
      recEmail.classList.add('input-error');
      return;
    }

    const users = getUsers();
    recoveryUser = users.find(u => u.email === email);

    if (!recoveryUser) {
      recEmailError.textContent = 'Este correo no está registrado en el sistema.';
      recEmail.classList.add('input-error');
    } else if (!recoveryUser.phone) {
      recEmailError.textContent = 'Esta cuenta no tiene celular registrado. No se puede recuperar.';
      recEmail.classList.add('input-error');
    } else {
      recEmailError.textContent = '';
      recEmail.classList.remove('input-error');
      
      const phoneStr = recoveryUser.phone;
      const lastTwo = phoneStr.slice(-2);
      maskedPhoneHint.textContent = `#######${lastTwo}`;
      
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
    }
  });

  btnStep2.addEventListener('click', () => {
    const phone = recPhone.value.trim();
    if (phone !== recoveryUser.phone) {
      recPhoneError.textContent = 'El número es incorrecto. Inténtalo de nuevo.';
      recPhone.classList.add('input-error');
    } else {
      recPhoneError.textContent = '';
      recPhone.classList.remove('input-error');
      step2.classList.add('hidden');
      step3.classList.remove('hidden');
    }
  });

  recPhone.addEventListener('input', () => {
    recPhone.value = recPhone.value.replace(/[^0-9]/g, '');
  });

  btnStep3.addEventListener('click', () => {
    const pass = newPass.value.trim();
    
    if (pass === '') {
      newPassError.textContent = 'Ingresa una nueva contraseña segura.';
      newPass.classList.add('input-error');
    } else if (pass === recoveryUser.password) {
      newPassError.textContent = 'La nueva contraseña no puede ser igual a la anterior.';
      newPass.classList.add('input-error');
    } else {
      newPassError.textContent = '';
      newPass.classList.remove('input-error');

      const users = getUsers();
      const userIndex = users.findIndex(u => u.email === recoveryUser.email);
      if (userIndex !== -1) {
        users[userIndex].password = pass;
        localStorage.setItem('cercared_users', JSON.stringify(users));
        recoveryUser.password = pass; 
      }

      step3.classList.add('hidden');
      step4.classList.remove('hidden');
    }
  });

  btnFinish.addEventListener('click', () => {
    recoveryModal.classList.add('hidden');
    document.getElementById('loginEmail').value = recoveryUser.email;
  });

  const togglePasswordIcons = document.querySelectorAll('.toggle-password');

  togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const targetId = icon.getAttribute('data-target');
      const inputField = document.getElementById(targetId);

      if (inputField.type === 'password') {
        inputField.type = 'text';
        icon.src = 'assets/images/eyes.png';
      } else {
        inputField.type = 'password';
        icon.src = 'assets/images/eyesnot.png';
      }
    });
  });

});