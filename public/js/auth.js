console.log("✅ auth.js loaded");

function showAlert(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('d-none');
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('d-none');
}

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('loginAlert');

    const payload = {
      email: loginForm.email.value,
      password: loginForm.password.value
    };

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) return showAlert('loginAlert', data.message || 'Login failed');

    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    window.location.href = '/';
  });
}

// REGISTER
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('registerAlert');

    const payload = {
      name: registerForm.name.value,
      email: registerForm.email.value,
      password: registerForm.password.value,
      role: 'user'
    };

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) return showAlert('registerAlert', data.message || 'Registration failed');

    window.location.href = '/login';
  });
}
