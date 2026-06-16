document.addEventListener('DOMContentLoaded', () => {
  const currentUserStr = localStorage.getItem('cercared_currentUser');
  if (!currentUserStr) {
    window.location.href = 'auth.html';
    return;
  }

  let currentUser = JSON.parse(currentUserStr);

  const updateAvatarDisplay = (elementId, userObj) => {
    const el = document.getElementById(elementId);
    if (userObj.avatar) {
      el.innerHTML = `<img src="${userObj.avatar}" alt="Avatar">`;
    } else {
      const nameParts = userObj.name.trim().split(' ');
      let initials = nameParts.length >= 2 ? nameParts[0].charAt(0) + nameParts[1].charAt(0) : nameParts[0].substring(0, 2);
      el.innerHTML = initials.toUpperCase();
    }
  };

  const renderProfileView = () => {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    updateAvatarDisplay('userAvatar', currentUser);
  };

  renderProfileView();
  document.querySelector('.stats-number').textContent = '0';

  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('cercared_currentUser');
    window.location.href = 'index.html';
  });

  const profileViewMode = document.getElementById('profileViewMode');
  const profileEditMode = document.getElementById('profileEditMode');
  const btnEditProfile = document.getElementById('btnEditProfile');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const editNameInput = document.getElementById('editName');
  const avatarUpload = document.getElementById('avatarUpload');
  let tempAvatarBase64 = currentUser.avatar || null;

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

  document.getElementById('profileEditMode').addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = editNameInput.value.trim();
    
    if (newName) {
      try {
        currentUser.name = newName;
        currentUser.avatar = tempAvatarBase64;
        
        localStorage.setItem('cercared_currentUser', JSON.stringify(currentUser));
        
        const usersStr = localStorage.getItem('cercared_users');
        if (usersStr) {
          let users = JSON.parse(usersStr);
          const userIndex = users.findIndex(u => u.email === currentUser.email);
          if (userIndex !== -1) {
            users[userIndex].name = currentUser.name;
            users[userIndex].avatar = currentUser.avatar;
            localStorage.setItem('cercared_users', JSON.stringify(users));
          }
        }
        
        document.getElementById('userName').textContent = currentUser.name;
        const viewAvatar = document.getElementById('userAvatar');
        
        if (currentUser.avatar) {
          viewAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="Avatar">`;
        } else {
          const nameParts = currentUser.name.trim().split(' ');
          let initials = nameParts.length >= 2 ? nameParts[0].charAt(0) + nameParts[1].charAt(0) : nameParts[0].substring(0, 2);
          viewAvatar.innerHTML = initials.toUpperCase();
        }
        
        document.getElementById('profileEditMode').classList.add('hidden');
        document.getElementById('profileViewMode').classList.remove('hidden');
        
      } catch (error) {
        document.getElementById('avatarErrorContainer').classList.remove('hidden');
      }
    }
  });

  const toggleGroups = document.querySelectorAll('.toggle-group');
  toggleGroups.forEach(group => {
    const buttons = group.querySelectorAll('.btn-toggle');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  const districtInput = document.getElementById('district');
  const categoryInput = document.getElementById('category');

  const userPrefs = currentUser.preferences || {
    district: "",
    category: "",
    fontSize: "normal",
    viewMode: "normal"
  };

  districtInput.value = userPrefs.district;
  categoryInput.value = userPrefs.category;

  const setToggleActive = (groupId, savedValue) => {
    const group = document.getElementById(groupId);
    const buttons = group.querySelectorAll('.btn-toggle');
    buttons.forEach(btn => {
      if (btn.dataset.value === savedValue) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  setToggleActive('fontSizeToggle', userPrefs.fontSize);
  setToggleActive('viewModeToggle', userPrefs.viewMode);

  const preferencesForm = document.getElementById('preferencesForm');
  preferencesForm.addEventListener('submit', (e) => {
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

    localStorage.setItem('cercared_currentUser', JSON.stringify(currentUser));

    const usersStr = localStorage.getItem('cercared_users');
    if (usersStr) {
      let users = JSON.parse(usersStr);
      const userIndex = users.findIndex(u => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].preferences = currentUser.preferences;
        localStorage.setItem('cercared_users', JSON.stringify(users));
      }
    }
  });

  const passwordForm = document.getElementById('passwordForm');
  const currentInput = document.getElementById('currentPassword');
  const newInput = document.getElementById('newPassword');
  const confirmInput = document.getElementById('confirmPassword');

  const currentError = document.getElementById('currentPasswordError');
  const newError = document.getElementById('newPasswordError');
  const confirmError = document.getElementById('confirmPasswordError');

  [currentInput, newInput, confirmInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      input.nextElementSibling.textContent = "";
    });
  });

  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const currentPass = currentInput.value.trim();
    const newPass = newInput.value.trim();
    const confirmPass = confirmInput.value.trim();

    if (currentPass === "") {
      currentInput.classList.add('input-error');
      currentError.textContent = "Ingresa tu contraseña actual.";
      isValid = false;
    } else if (currentPass !== currentUser.password) {
      currentInput.classList.add('input-error');
      currentError.textContent = "Contraseña incorrecta.";
      isValid = false;
    }

    if (newPass === "") {
      newInput.classList.add('input-error');
      newError.textContent = "Ingresa una nueva contraseña.";
      isValid = false;
    } else if (newPass === currentUser.password) {
      newInput.classList.add('input-error');
      newError.textContent = "La nueva contraseña no puede ser igual a la actual.";
      isValid = false;
    }

    if (confirmPass === "") {
      confirmInput.classList.add('input-error');
      confirmError.textContent = "Confirma tu nueva contraseña.";
      isValid = false;
    } else if (newPass !== confirmPass && newPass !== "") {
      confirmInput.classList.add('input-error');
      confirmError.textContent = "Las contraseñas no coinciden.";
      isValid = false;
    }

    if (isValid) {
      currentUser.password = newPass;
      localStorage.setItem('cercared_currentUser', JSON.stringify(currentUser));

      const usersStr = localStorage.getItem('cercared_users');
      if (usersStr) {
        let users = JSON.parse(usersStr);
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
          users[userIndex].password = newPass;
          localStorage.setItem('cercared_users', JSON.stringify(users));
        }
      }

      passwordForm.reset();
    }
  });

  document.querySelector('.profile-main').classList.add('is-loaded');
});