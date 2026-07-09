import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
  let currentUser = {};

  const profileViewMode = document.getElementById('profileViewMode');
  const profileEditMode = document.getElementById('profileEditMode');
  const btnEditProfile = document.getElementById('btnEditProfile');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const editNameInput = document.getElementById('editName');
  const avatarUpload = document.getElementById('avatarUpload');
  const districtInput = document.getElementById('district');
  const categoryInput = document.getElementById('category');
  const preferencesForm = document.getElementById('preferencesForm');

  let tempAvatarBase64 = null;
  const cachedUser = JSON.parse(localStorage.getItem('cercared_currentUser'));
  
  if (cachedUser) {
    currentUser = {
      name: cachedUser.name || "Usuario de CercaRed",
      email: cachedUser.email || "",
      avatar: cachedUser.avatar || null,
      role: cachedUser.role || "user",
      preferences: cachedUser.preferences || { district: "", category: "", viewMode: "normal" }
    };
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    const userAvatarEl = document.getElementById('userAvatar');
    if (userAvatarEl) {
      if (currentUser.avatar) {
        userAvatarEl.innerHTML = `<img src="${currentUser.avatar}" alt="Avatar">`;
      } else {
        const nameParts = currentUser.name.trim().split(' ');
        let initials = nameParts.length >= 2 ? nameParts[0].charAt(0) + nameParts[1].charAt(0) : nameParts[0].substring(0, 2);
        userAvatarEl.innerHTML = initials.toUpperCase();
      }
    }
    
    if (districtInput) districtInput.value = currentUser.preferences.district || "";
    if (categoryInput) categoryInput.value = currentUser.preferences.category || "";
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      localStorage.removeItem('cercared_has_session');
      localStorage.removeItem('cercared_currentUser');
      if (window.CercaRedNavbar) window.CercaRedNavbar.updateAuthLink();
      window.location.href = 'auth.html';
      return;
    }

    const isManualUser = user.providerData.some(p => p.providerId === 'password');
    if (isManualUser && !user.emailVerified) {
      const profileContent = document.querySelector('.profile-content');
      if (profileContent) {
        profileContent.innerHTML = `
          <div class="profile-card" style="text-align: center; padding: var(--space-4);">
            <h2 style="color: var(--color-error, #d32f2f); margin-bottom: var(--space-2);">Verificación requerida</h2>
            <p style="color: var(--color-text); margin-bottom: var(--space-3);">
              Hemos enviado un enlace de confirmación a tu correo <strong>${user.email}</strong>. 
              Por favor, revisa tu bandeja de entrada o la carpeta de spam y haz clic en el enlace para activar tu cuenta.
            </p>
            <button type="button" class="btn-primary" onclick="window.location.reload();" style="width: auto; padding: 10px 24px;">
              Ya verifiqué mi correo (Recargar página)
            </button>
          </div>
        `;
      }
      localStorage.setItem('cercared_has_session', 'true');
      if (window.CercaRedNavbar) window.CercaRedNavbar.updateAuthLink(true);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        currentUser = {
          uid: user.uid,
          name: firestoreData.name || user.displayName || "Usuario de CercaRed",
          email: user.email,
          role: firestoreData.role || "user",
          avatar: firestoreData.avatar || null,
          preferences: firestoreData.preferences || { district: "", category: "", viewMode: "normal" }
        };
      } else {
        currentUser = {
          uid: user.uid,
          name: user.displayName || "Usuario de CercaRed",
          email: user.email,
          role: "user",
          avatar: null,
          preferences: { district: "", category: "", viewMode: "normal" }
        };
      }

      renderProfileView();
      localStorage.setItem('cercared_currentUser', JSON.stringify(currentUser));
      renderSavedStats();
      sincronizarPreferenciasEnPantalla();
      aplicarModoVistaGlobal(currentUser.preferences.viewMode);
      configurarSeccionContrasena(user);
    } catch (error) {
      console.error(error);
    }

    localStorage.setItem('cercared_has_session', 'true');
    if (window.CercaRedNavbar) window.CercaRedNavbar.updateAuthLink(true);
  });

  const updateAvatarDisplay = (elementId, userObj) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (userObj.avatar) {
      el.innerHTML = `<img src="${userObj.avatar}" alt="Avatar">`;
    } else {
      const nameParts = (userObj.name || "Usuario").trim().split(' ');
      let initials = nameParts.length >= 2 ? nameParts[0].charAt(0) + nameParts[1].charAt(0) : nameParts[0].substring(0, 2);
      el.innerHTML = initials.toUpperCase();
    }
  };

  const renderProfileView = () => {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    updateAvatarDisplay('userAvatar', currentUser);
  };

  const getSavedServices = () => JSON.parse(localStorage.getItem('cercared_saved') || '[]');
  const renderSavedStats = () => {
    const statsNum = document.querySelector('.stats-number');
    if (statsNum) statsNum.textContent = String(getSavedServices().length);
  };

const sincronizarPreferenciasEnPantalla = () => {
    const userPrefs = currentUser.preferences;
    
    if (districtInput) {
      districtInput.value = userPrefs.district || "";
      districtInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
    
    if (categoryInput) {
      categoryInput.value = userPrefs.category || "";
      categoryInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    setToggleActive('viewModeToggle', userPrefs.viewMode || "normal");
  };

  const viewModeToggle = document.getElementById('viewModeToggle');
  if (viewModeToggle) {
    const buttons = viewModeToggle.querySelectorAll('.btn-toggle');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          const isActive = b === btn;
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-pressed', String(isActive));
        });
      });
    });
  }

  const setToggleActive = (groupId, savedValue) => {
    const group = document.getElementById(groupId);
    if (!group) return;
    const buttons = group.querySelectorAll('.btn-toggle');
    const activeButton = Array.from(buttons).find(btn => btn.dataset.value === savedValue) || buttons[0];
    buttons.forEach(b => {
      const isActive = b === activeButton;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });
  };

  // Función para inyectar la clase de accesibilidad al body en tiempo real
  const aplicarModoVistaGlobal = (mode) => {
    if (mode === 'simple') {
      document.body.classList.add('view-mode-simple');
    } else {
      document.body.classList.remove('view-mode-simple');
    }
  };

  const btnViewSaved = document.getElementById('btnViewSaved');
  if (btnViewSaved) {
    btnViewSaved.addEventListener('click', () => {
      window.location.href = 'saved.html';
    });
  }

  document.getElementById('btnLogout').addEventListener('click', () => {
    signOut(auth).then(() => {
      localStorage.removeItem('cercared_currentUser');
      if (window.CercaRedNavbar) window.CercaRedNavbar.updateAuthLink();
      window.location.href = 'index.html';
    });
  });

  btnEditProfile.addEventListener('click', () => {
    profileViewMode.classList.add('hidden');
    profileEditMode.classList.remove('hidden');
    editNameInput.value = currentUser.name;
    tempAvatarBase64 = currentUser.avatar || null;
    updateAvatarDisplay('userAvatarEdit', { avatar: tempAvatarBase64, name: currentUser.name });
  });

  btnCancelEdit.addEventListener('click', () => {
    profileEditMode.classList.add('hidden');
    profileViewMode.classList.remove('hidden');
    document.getElementById('avatarErrorContainer').classList.add('hidden');
  });

  avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const errorContainer = document.getElementById('avatarErrorContainer');
    if (file) {
      if (file.size > 1048576) {
        errorContainer.classList.remove('hidden');
        e.target.value = "";
        return;
      }
      errorContainer.classList.add('hidden');
      const reader = new FileReader();
      reader.onload = (event) => {
        tempAvatarBase64 = event.target.result;
        updateAvatarDisplay('userAvatarEdit', { avatar: tempAvatarBase64, name: currentUser.name });
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('profileEditMode').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = editNameInput.value.trim();
    if (newName) {
      try {
        currentUser.name = newName;
        currentUser.avatar = tempAvatarBase64;
        await setDoc(doc(db, "users", currentUser.uid), {
          name: currentUser.name,
          avatar: currentUser.avatar
        }, { merge: true });
        document.getElementById('userName').textContent = currentUser.name;
        updateAvatarDisplay('userAvatar', currentUser);
        document.getElementById('profileEditMode').classList.add('hidden');
        document.getElementById('profileViewMode').classList.remove('hidden');
      } catch (error) {
        console.error(error);
        document.getElementById('avatarErrorContainer').classList.remove('hidden');
      }
    }
  });

  // 🚀 Lógica de Envío Completa del Formulario de Preferencias
  preferencesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newDistrict = districtInput.value;
    const newCategory = categoryInput.value;
    
    // Obtenemos cuál botón del Modo de Vista está activo
    const activeButton = document.querySelector('#viewModeToggle .btn-toggle.active');
    const activeViewMode = activeButton ? activeButton.dataset.value : "normal";

    currentUser.preferences = {
      district: newDistrict,
      category: newCategory,
      viewMode: activeViewMode
    };

    const successMsg = document.getElementById('preferencesSuccessMessage');

    try {
      // Guardamos directamente en la nube
      await setDoc(doc(db, "users", currentUser.uid), {
        preferences: currentUser.preferences
      }, { merge: true });

      // Actualizamos localStorage instantáneamente
      localStorage.setItem('cercared_currentUser', JSON.stringify(currentUser));
      
      // Aplicamos el cambio de modo de vista de inmediato en la pantalla actual
      aplicarModoVistaGlobal(activeViewMode);

      // ✨ Animamos el cartel de validación en verde para que el usuario sepa que funcionó
      if (successMsg) {
        successMsg.textContent = "¡Preferencias guardadas exitosamente!";
        successMsg.style.color = "var(--color-success, #2e7d32)";
        successMsg.style.visibility = "visible";
        successMsg.style.opacity = "1";

        setTimeout(() => {
          successMsg.style.opacity = "0";
          setTimeout(() => {
            successMsg.style.visibility = "hidden";
          }, 300);
        }, 3000); // Se muestra por 3 segundos completos
      }

    } catch (error) {
      console.error(error);
      if (successMsg) {
        successMsg.textContent = "Hubo un error al guardar en la nube.";
        successMsg.style.color = "#d32f2f"; 
        successMsg.style.visibility = "visible";
        successMsg.style.opacity = "1";
        setTimeout(() => {
          successMsg.style.opacity = "0";
          setTimeout(() => {
            successMsg.style.visibility = "hidden";
          }, 300);
        }, 3000);
      }
    }
  });

  function configurarSeccionContrasena(user) {
    const passwordCard = document.getElementById('passwordCard');
    const passwordForm = document.getElementById('passwordForm');
    if (!passwordCard || !passwordForm) return;

    const isGoogle = user.providerData.some(provider => provider.providerId === 'google.com');
    if (isGoogle) {
      passwordCard.remove();
    } else {
      passwordCard.style.display = 'block';
      passwordForm.style.display = 'block';
      
      passwordForm.innerHTML = `
        <p style="margin-bottom: var(--space-3); color: var(--color-text);">
          Te enviaremos un correo electrónico seguro con un enlace para restablecer tu contraseña.
        </p>
        <button type="button" id="btn-send-reset" class="btn-primary" style="width: auto; padding: 10px 24px; margin: 0;">
          Enviar enlace de restablecimiento
        </button>
        <div id="password-status-msg" style="margin-top: var(--space-2); font-size: 14px; font-weight: 500; visibility: hidden; opacity: 0; transition: all 0.3s ease;"></div>
      `;
      const btnSendReset = document.getElementById('btn-send-reset');
      const statusMsg = document.getElementById('password-status-msg');

      btnSendReset.addEventListener('click', async () => {
        try {
          btnSendReset.disabled = true;
          await sendPasswordResetEmail(auth, user.email);
          statusMsg.textContent = "¡Correo enviado! Revisa tu bandeja de entrada o spam.";
          statusMsg.style.color = "var(--color-success, #2e7d32)";
          statusMsg.style.visibility = "visible";
          statusMsg.style.opacity = "1";
        } catch (error) {
          console.error(error);
          statusMsg.textContent = "Error al enviar el correo. Inténtalo más tarde.";
          statusMsg.style.color = "var(--color-error, #d32f2f)";
          statusMsg.style.visibility = "visible";
          statusMsg.style.opacity = "1";
          btnSendReset.disabled = false;
        }
      });
    }
  }

  const profileMain = document.querySelector('.profile-main');
  if (profileMain) profileMain.classList.add('is-loaded');
});