import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore, doc, setDoc, getDocs, collection, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

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

  // Manejo de vistas interactivas (Toggle entre Login y Registro)
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

// ==========================================
  // LOGIN MANUAL CON FIREBASE (NATIVO)
  // ==========================================
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
      signInWithEmailAndPassword(auth, emailValue, passwordValue)
        .then((result) => {
          const user = result.user;
          const currentUserData = {
            name: user.displayName || "Usuario",
            email: user.email,
            source: 'manual'
          };
          
          localStorage.setItem('cercared_currentUser', JSON.stringify(currentUserData));
          window.CercaRedNavbar?.updateAuthLink();
          loginForm.reset();
          
          const successMsg = document.getElementById('successMessage');
          successMsg.textContent = `¡Bienvenido/a, ${currentUserData.name}!`;
          successMsg.classList.remove('hidden');

          setTimeout(() => {
              successMsg.classList.add('hidden');
              window.location.href = 'index.html';
          }, 800);
        })
        .catch((error) => {
          console.error("Error en Login:", error.code);
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            loginEmail.classList.add('input-error');
            loginEmailError.textContent = "El correo electrónico o la contraseña son incorrectos.";
          } else {
            loginEmailError.textContent = "Error al iniciar sesión. Inténtalo más tarde.";
          }
        });
    }
  });
// ==========================================
  // REGISTRO MANUAL CON FIREBASE (LIMPIO)
  // ==========================================
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isRegisterValid = true;
    const nameValue = registerName.value.trim();
    const emailValue = registerEmail.value.trim();
    const passwordValue = registerPassword.value.trim();
    const confirmPasswordValue = registerConfirmPassword.value.trim();
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; 
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

    registerPasswordError.textContent = "";
    registerPassword.classList.remove('input-error');
    registerConfirmPasswordError.textContent = "";
    registerConfirmPassword.classList.remove('input-error');

if (nameValue === "") {
      registerNameError.textContent = "Por favor, ingresa tu nombre completo.";
      registerName.classList.add('input-error');
      isRegisterValid = false;
    } else if (!regexNombre.test(nameValue)) {
      registerNameError.textContent = "El nombre no debe contener números ni caracteres especiales.";
      registerName.classList.add('input-error');
      isRegisterValid = false;
    } else {
      registerNameError.textContent = "";
      registerName.classList.remove('input-error');
    }


    if (emailValue === "" || !emailRegex.test(emailValue)) {
      registerEmailError.textContent = "Correo inválido.";
      registerEmail.classList.add('input-error');
      isRegisterValid = false;
    } else {
      registerEmailError.textContent = "";
      registerEmail.classList.remove('input-error');
    }

    if (passwordValue === "") {
      registerPasswordError.textContent = "Por favor, ingresa tu contraseña.";
      registerPassword.classList.add('input-error');
      isRegisterValid = false;
    } else if (!passwordRegex.test(passwordValue)) {
      registerPasswordError.textContent = "Debe tener más de 8 caracteres, incluir al menos un número y un símbolo (@$!%*?&.).";
      registerPassword.classList.add('input-error');
      isRegisterValid = false;
    }

    if (confirmPasswordValue === "") {
      registerConfirmPasswordError.textContent = "Por favor, confirma tu contraseña.";
      registerConfirmPassword.classList.add('input-error');
      isRegisterValid = false;
    } else if (passwordValue !== confirmPasswordValue) {
      registerConfirmPasswordError.textContent = "Las contraseñas no coinciden.";
      registerConfirmPassword.classList.add('input-error');
      isRegisterValid = false;
    }

    if (!registerTerms.checked) {
      registerTermsError.textContent = "Debes aceptar términos.";
      isRegisterValid = false; 
    } else {
      registerTermsError.textContent = "";
    }

    if (isRegisterValid) {
      createUserWithEmailAndPassword(auth, emailValue, passwordValue)
        .then(async (result) => {
          const user = result.user;
          
          try {
            // Guardamos solo los datos necesarios en Firestore (Sin teléfono)
            await setDoc(doc(db, "users", user.uid), {
              name: nameValue,
              email: emailValue,
              createdAt: new Date()
            });

            await updateProfile(user, {
              displayName: nameValue
            });

            // Enviar correo de verificación nativo
            await sendEmailVerification(user);
            console.log("Correo de verificación enviado.");

            const currentUserData = {
              name: nameValue,
              email: emailValue,
              source: 'manual'
            };
            localStorage.setItem('cercared_currentUser', JSON.stringify(currentUserData));
            window.CercaRedNavbar?.updateAuthLink();

            const successMsg = document.getElementById('registerSuccessMessage');
            if (successMsg) {
              successMsg.textContent = `¡Cuenta creada exitosamente, bienvenido/a ${nameValue}!`;
              successMsg.classList.remove('hidden');
            }

            setTimeout(() => {
              if (successMsg) successMsg.classList.add('hidden');
              registerForm.reset();
              window.location.href = 'index.html'; 
            }, 1200);

          } catch (dbError) {
            console.error("Error al guardar en Firestore:", dbError);
            alert("Cuenta creada, pero hubo un problema al guardar los datos adicionales.");
          }
        })
        .catch((error) => {
          console.error("Error en Registro:", error.code);
          if (error.code === 'auth/email-already-in-use') {
            registerEmail.classList.add('input-error');
            registerEmailError.textContent = "Este correo electrónico ya está registrado.";
          } else {
            registerEmailError.textContent = "Error al registrar usuario. Inténtalo de nuevo.";
          }
        });
    }
  });


// Variables para la modal de recuperación simplificada por Email Real
  const forgotPasswordLink = document.getElementById('forgotPassword');
  const recoveryModal = document.getElementById('recoveryModal');
  const closeModal = document.getElementById('closeModal');
  const step1 = document.getElementById('recoveryStep1');
  const step2 = document.getElementById('recoveryStep2'); // Mantener variables si existen en el HTML para evitar errores
  const step3 = document.getElementById('recoveryStep3'); // Mantener variables si existen en el HTML para evitar errores
  const step4 = document.getElementById('recoveryStep4');
  const btnStep1 = document.getElementById('btnRecoveryStep1');
  const btnFinish = document.getElementById('btnRecoveryFinish');
  const recEmail = document.getElementById('recoveryEmail');
  const recEmailError = document.getElementById('recoveryEmailError');

  // 1. ABRIR Y CERRAR MODAL
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      recoveryModal.classList.remove('hidden');
      
      // Mostrar paso 1 y asegurar que los demás estén ocultos
      step1.classList.remove('hidden');
      if (step2) step2.classList.add('hidden');
      if (step3) step3.classList.add('hidden');
      if (step4) step4.classList.add('hidden');
      
      recEmail.value = "";
      recEmailError.textContent = "";
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      recoveryModal.classList.add('hidden');
    });
  }

  // PROCESO: Validar correo, enviar enlace real y saltar directo al Paso 4 (Éxito)
  if (btnStep1) {
    btnStep1.addEventListener('click', async () => {
      const emailValue = recEmail.value.trim();
      recEmailError.textContent = "";

      if (emailValue === "") {
        recEmailError.textContent = "Ingresa tu correo electrónico.";
        return;
      } else if (!emailRegex.test(emailValue)) {
        recEmailError.textContent = "Ingresa un correo electrónico válido.";
        return;
      }

      try {
        // Enviar el enlace oficial de restablecimiento nativo de Firebase Auth
        await sendPasswordResetEmail(auth, emailValue);
        console.log("Correo de restablecimiento enviado con éxito.");

        // Saltamos directo al Paso 4 (Mensaje de éxito / Instrucciones)
        step1.classList.add('hidden');
        if (step4) step4.classList.remove('hidden');
      } catch (error) {
        console.error("Error al enviar el correo de recuperación:", error.code);
        if (error.code === 'auth/user-not-found') {
          recEmailError.textContent = "Este correo no está registrado.";
        } else {
          recEmailError.textContent = "No se pudo enviar el correo. Inténtalo de nuevo.";
        }
      }
    });
  }

  // PASO 4: Finalizar, cerrar la modal y rellenar el correo en el login
  if (btnFinish) {
    btnFinish.addEventListener('click', () => {
      recoveryModal.classList.add('hidden');
      loginEmail.value = recEmail.value; // Le deja el correo listo en la vista de login
      loginPassword.value = "";
    });
  }

  // Interactividad de Mostrar/Ocultar contraseñas
  const togglePasswordIcons = document.querySelectorAll('.toggle-password');
  togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const inputField = document.getElementById(icon.getAttribute('data-target'));
      if (inputField) {
        inputField.type = inputField.type === 'password' ? 'text' : 'password';
        icon.src = inputField.type === 'text' ? 'assets/images/eyes.png' : 'assets/images/eyesnot.png';
      }
    });
  });

  // ==========================================
  // FLUJO DE GOOGLE AUTHENTICATION
  // ==========================================
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
        }, 1200);
      })
      .catch((error) => {
        console.error("Error en autenticación:", error.code, error.message);
      });
  };

  // Botones de Google vinculados correctamente
  const btnGoogleLogin = document.getElementById('btnGoogleLogin');
  const btnGoogleRegister = document.getElementById('btnGoogleLogin2');

  if (btnGoogleLogin) btnGoogleLogin.addEventListener('click', iniciarFlujoFirebaseGoogle);
  if (btnGoogleRegister) btnGoogleRegister.addEventListener('click', iniciarFlujoFirebaseGoogle);
});