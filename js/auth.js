import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKV8X6ZDw12oFHyKYSNsnX_HiGRWlbaAQ",
  authDomain: "cercared-auth.firebaseapp.com",
  projectId: "cercared-auth",
  storageBucket: "cercared-auth.firebasestorage.app",
  messagingSenderId: "303320791334",
  appId: "1:303320791334:web:4b32a407f6cb0748ae69e7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1741999303593859', 
    cookie     : true, 
    xfbml      : true,      
    version    : 'v18.0'
  });
};

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/es_LA/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

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

    if (emailValue === "" || !emailRegex.test(emailValue)) {
      registerEmailError.textContent = "Correo inválido.";
      registerEmail.classList.add('input-error');
      isValid = false;
    } else {
      registerEmailError.textContent = "";
      registerEmail.classList.remove('input-error');
    }

    if (phoneValue === "" || !phoneRegex.test(phoneValue)) {
      registerPhoneError.textContent = "Ingresa 9 dígitos válidos.";
      registerPhone.classList.add('input-error');
      isValid = false;
    } else {
      registerPhoneError.textContent = "";
      registerPhone.classList.remove('input-error');
    }

    if (passwordValue === "" || passwordValue !== confirmPasswordValue) {
      registerConfirmPasswordError.textContent = "Las contraseñas no coinciden.";
      registerConfirmPassword.classList.add('input-error');
      isValid = false;
    } else {
      registerConfirmPasswordError.textContent = "";
      registerConfirmPassword.classList.remove('input-error');
    }

    if (!registerTerms.checked) {
      registerTermsError.textContent = "Debes aceptar términos.";
      isValid = false;
    } else {
      registerTermsError.textContent = "";
    }

    if (isValid) {
      const users = getUsers();
      if (users.some(u => u.email === emailValue)) {
        registerEmailError.textContent = "Correo ya registrado.";
      } else {
        saveUser({ name: nameValue, email: emailValue, phone: phoneValue, password: passwordValue });
        alert("¡Cuenta creada!");
        registerForm.reset();
        cancelRegister.click();
      }
    }
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

  const btnFacebookLogin = document.getElementById('btnFacebookLogin');
  const btnFacebookRegister = document.getElementById('btnFacebookLogin2');

  const iniciarFlujoFacebook = (e) => {
    e.preventDefault();
    FB.login(function(response) {
      if (response.authResponse) {
        FB.api('/me', { fields: 'name, email' }, function(userInfo) {
          const facebookUser = { name: userInfo.name, email: userInfo.email || `${userInfo.id}@facebook.com`, source: 'facebook' };
          localStorage.setItem('cercared_currentUser', JSON.stringify(facebookUser));
          window.CercaRedNavbar?.updateAuthLink();
          alert(`¡Bienvenido/a, ${facebookUser.name}!`);
          window.location.href = 'index.html';
        });
      }
    }, { scope: 'email' });
  };

  if (btnFacebookLogin) btnFacebookLogin.addEventListener('click', iniciarFlujoFacebook);
  if (btnFacebookRegister) btnFacebookRegister.addEventListener('click', iniciarFlujoFacebook);

  let recoveryUser = null; 

  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    recoveryModal.classList.remove('hidden');
    step1.classList.remove('hidden');
  });

  closeModal.addEventListener('click', () => recoveryModal.classList.add('hidden'));

  btnStep1.addEventListener('click', () => {
    const email = recEmail.value.trim();
    const users = getUsers();
    recoveryUser = users.find(u => u.email === email);
    if (!recoveryUser) {
      recEmailError.textContent = 'Correo no registrado.';
    } else {
      maskedPhoneHint.textContent = `#######${recoveryUser.phone.slice(-2)}`;
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
    }
  });

  btnStep2.addEventListener('click', () => {
    if (recPhone.value.trim() !== recoveryUser.phone) {
      recPhoneError.textContent = 'Número incorrecto.';
    } else {
      step2.classList.add('hidden');
      step3.classList.remove('hidden');
    }
  });

  btnStep3.addEventListener('click', () => {
    if (newPass.value.trim() === '') {
      newPassError.textContent = 'Ingresa una nueva contraseña.';
    } else {
      const users = getUsers();
      const userIndex = users.findIndex(u => u.email === recoveryUser.email);
      users[userIndex].password = newPass.value.trim();
      localStorage.setItem('cercared_users', JSON.stringify(users));
      step3.classList.add('hidden');
      step4.classList.remove('hidden');
    }
  });

  btnFinish.addEventListener('click', () => {
    recoveryModal.classList.add('hidden');
    loginEmail.value = recoveryUser.email;
  });

  const togglePasswordIcons = document.querySelectorAll('.toggle-password');
  togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const inputField = document.getElementById(icon.getAttribute('data-target'));
      inputField.type = inputField.type === 'password' ? 'text' : 'password';
      icon.src = inputField.type === 'text' ? 'assets/images/eyes.png' : 'assets/images/eyesnot.png';
    });
  });

  // --- NUEVA LÓGICA DE GOOGLE CON FIREBASE ---
  const btnGoogleLogin = document.getElementById('btnGoogleLogin');
  const btnGoogleRegister = document.getElementById('btnGoogleLogin2');

  const iniciarFlujoFirebaseGoogle = (e) => {
    e.preventDefault();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const googleUser = { name: user.displayName, email: user.email, source: 'google' };
        localStorage.setItem('cercared_currentUser', JSON.stringify(googleUser));
        window.CercaRedNavbar?.updateAuthLink();

        const successMsg = document.getElementById('successMessage');
        successMsg.textContent = `¡Bienvenido/a, ${googleUser.name}!`;
        successMsg.classList.remove('hidden');

        setTimeout(() => {
            successMsg.classList.add('hidden');
            window.location.href = 'index.html';
        }, 3000);
      })
      .catch((error) => {
        console.error("Error en autenticación:", error.code, error.message);
      });
  };

  if (btnGoogleLogin) btnGoogleLogin.addEventListener('click', iniciarFlujoFirebaseGoogle);
  if (btnGoogleRegister) btnGoogleRegister.addEventListener('click', iniciarFlujoFirebaseGoogle);
});