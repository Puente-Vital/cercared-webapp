// ==========================================================================
// IMPORTACIONES E INICIALIZACIÓN DE FIREBASE (AL INICIO ABSOLUTO)
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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
  // Variable global interna para el manejo de los datos del usuario activo
  let currentUser = {};

  // ELEMENTOS DEL DOM ORIGINALES
  const profileViewMode = document.getElementById('profileViewMode');
  const profileEditMode = document.getElementById('profileEditMode');
  const btnEditProfile = document.getElementById('btnEditProfile');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const editNameInput = document.getElementById('editName');
  const avatarUpload = document.getElementById('avatarUpload');
  const districtInput = document.getElementById('district');
  const categoryInput = document.getElementById('category');
  const preferencesForm = document.getElementById('preferencesForm');
  const passwordForm = document.getElementById('passwordForm');
  const currentInput = document.getElementById('currentPassword');
  const newInput = document.getElementById('newPassword');
  const confirmInput = document.getElementById('confirmPassword');
  const currentError = document.getElementById('currentPasswordError');
  const newError = document.getElementById('newPasswordError');
  const confirmError = document.getElementById('confirmPasswordError');

  let tempAvatarBase64 = null;

  // ==========================================
  // FLUJO EN TIEMPO REAL: FIRESTORE + AUTH
  // ==========================================
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'auth.html';
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
          avatar: firestoreData.avatar || null,
          preferences: firestoreData.preferences || { district: "", category: "", fontSize: "normal", viewMode: "normal" }
        };
      } else {
        currentUser = {
          uid: user.uid,
          name: user.displayName || "Usuario de CercaRed",
          email: user.email,
          avatar: null,
          preferences: { district: "", category: "", fontSize: "normal", viewMode: "normal" }
        };
      }

      // Inicializar y renderizar las vistas con los datos de Firebase cargados
      renderProfileView();
      renderSavedStats();
      sincronizarPreferenciasEnPantalla();

    } catch (error) {
      console.error("Error al obtener el perfil de Firebase:", error);
    }
  });

  // LOGICA DINÁMICA DE AVATARES E INICIALES
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

  // ESTADÍSTICAS MOCK GUARDADAS EN LOCALSTORAGE (MANTENIDO)
  const getSavedServices = () => JSON.parse(localStorage.getItem('cercared_saved') || '[]');
  const renderSavedStats = () => {
    const statsNum = document.querySelector('.stats-number');
    if (statsNum) statsNum.textContent = String(getSavedServices().length);
  };

  const sincronizarPreferenciasEnPantalla = () => {
    const userPrefs = currentUser.preferences;
    districtInput.value = userPrefs.district || "";
    categoryInput.value = userPrefs.category || "";

    setToggleActive('fontSizeToggle', userPrefs.fontSize);
    setToggleActive('viewModeToggle', userPrefs.viewMode);
  };

  // INTERACTIVIDAD DE LOS BOTONES DE PREFERENCIAS (TOGGLES)
  const toggleGroups = document.querySelectorAll('.toggle-group');
  const setButtonPressed = (buttons, activeButton) => {
    buttons.forEach(button => {
      const isActive = button === activeButton;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  toggleGroups.forEach(group => {
    const buttons = group.querySelectorAll('.btn-toggle');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        setButtonPressed(buttons, btn);
      });
    });
  });

  const setToggleActive = (groupId, savedValue) => {
    const group = document.getElementById(groupId);
    if (!group) return;
    const buttons = group.querySelectorAll('.btn-toggle');
    const activeButton = Array.from(buttons).find(btn => btn.dataset.value === savedValue) || buttons[0];
    setButtonPressed(buttons, activeButton);
  };

  // BOTÓN IR A GUARDADOS Y LOGOUT NATIVO
  const btnViewSaved = document.getElementById('btnViewSaved');
  if (btnViewSaved) {
    btnViewSaved.addEventListener('click', () => {
      window.location.href = 'saved.html';
    });
  }

  document.getElementById('btnLogout').addEventListener('click', () => {
    signOut(auth).then(() => {
      localStorage.removeItem('cercared_currentUser');
      window.location.href = 'index.html';
    });
  });

  // FLUJO DE INTERFAZ: INICIAR EDICIÓN DE PERFIL
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

  // PROCESAR CARGA DE IMAGEN (MÁXIMO 1MB)
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

  // ENVIAR ACTUALIZACIÓN DE NOMBRE Y FOTO A CLOUD FIRESTORE
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
        console.error("Error al guardar cambios de perfil:", error);
        document.getElementById('avatarErrorContainer').classList.remove('hidden');
      }
    }
  });

  // ENVIAR CONFIGURACIÓN DE TAMAÑO Y MODOS A PREFERENCIAS FIRESTORE
  // ==========================================================================
  // ENVIAR CONFIGURACIÓN DE TAMAÑO Y MODOS A PREFERENCIAS FIRESTORE
  // ==========================================================================
  preferencesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newDistrict = districtInput.value.trim();
    const newCategory = categoryInput.value.trim();
    const activeFontSize = document.querySelector('#fontSizeToggle .btn-toggle.active').dataset.value;
    const activeViewMode = document.querySelector('#viewModeToggle .btn-toggle.active').dataset.value;

    currentUser.preferences = {
      district: newDistrict,
      category: newCategory,
      fontSize: activeFontSize,
      viewMode: activeViewMode
    };

    const successMsg = document.getElementById('preferencesSuccessMessage');

    try {
      await setDoc(doc(db, "users", currentUser.uid), {
        preferences: currentUser.preferences
      }, { merge: true });

      // Animación suave de aparición sin mover ni estirar el fondo
      // Tu JS se queda igual de elegante:
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
          }, 1250);
        }

} catch (error) {
      console.error("Error al guardar preferencias:", error);
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
        }, 1250);
      }
    }
  });

  // ==========================================================================
  // FORMULARIO TRADICIONAL DE CONTRASEÑA (REINICIAR ESTADOS)
  // ==========================================================================
  [currentInput, newInput, confirmInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        if (input.nextElementSibling) input.nextElementSibling.textContent = "";
      });
    }
  });

  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Para actualizar tu clave de forma segura, utiliza el enlace de recuperación en el inicio de sesión.");
    passwordForm.reset();
  });

  // TRANSICIÓN DE CARGA ESTABLECIDA
  const profileMain = document.querySelector('.profile-main');
  if (profileMain) profileMain.classList.add('is-loaded');
});