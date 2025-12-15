function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function esc(str) {
  return String(str ?? '').replaceAll("'", "\\'").replaceAll('"', '\\"');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return alert(message);

  const id = `t-${Date.now()}`;
  const bg =
    type === 'danger' ? 'bg-danger' :
    type === 'warning' ? 'bg-warning text-dark' :
    type === 'info' ? 'bg-info text-dark' :
    'bg-success';

  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-white ${bg} border-0 mb-2"
         role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"></button>
      </div>
    </div>
  `);

  const el = document.getElementById(id);
  if (window.bootstrap?.Toast) {
    const t = new bootstrap.Toast(el, { delay: 2500 });
    t.show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
  } else {
    setTimeout(() => el.remove(), 3000);
  }
}

function forceLogout() {
  localStorage.clear();
  showToast('Session expired. Please login again.', 'warning');
  setTimeout(() => window.location.href = '/login', 900);
}

async function apiFetch(url, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(url, { ...options, headers });

  let data = {};
  try { data = await res.json(); } catch {}

  if (res.status === 401) forceLogout();

  return { res, data };
}

function setupNavbar() {
  const user = getUser();

  const navLogin = document.getElementById('navLogin');
  const navRegister = document.getElementById('navRegister');
  const navLogout = document.getElementById('navLogout');
  const navMyEvents = document.getElementById('navMyEvents');
  const navCoach = document.getElementById('navCoach');
  const navAdmin = document.getElementById('navAdmin');
  const badge = document.getElementById('navUserBadge');

  if (!user) {
    if (badge) badge.textContent = '';

    navLogin?.classList.remove('d-none');
    navRegister?.classList.remove('d-none');

    navLogout?.classList.add('d-none');
    navMyEvents?.classList.add('d-none');
    navCoach?.classList.add('d-none');
    navAdmin?.classList.add('d-none');
    return;
  }

  if (badge) badge.textContent = `${user.email} (${user.role})`;

  navLogin?.classList.add('d-none');
  navRegister?.classList.add('d-none');
  navMyEvents?.classList.remove('d-none');
  navLogout?.classList.remove('d-none');

  if (user.role === 'coach' || user.role === 'admin') navCoach?.classList.remove('d-none');
  else navCoach?.classList.add('d-none');

  if (user.role === 'admin') navAdmin?.classList.remove('d-none');
  else navAdmin?.classList.add('d-none');

  if (navLogout) {
    navLogout.onclick = () => {
      localStorage.clear();
      window.location.href = '/login';
    };
  }
}


function guardCoachPage() {
  const isCoachPage =
    document.getElementById('coachCreateEventForm') ||
    document.getElementById('coachEventsGrid');

  if (!isCoachPage) return;

  const user = getUser();
  const token = getToken();

  if (!token || !user) return forceLogout();

  if (!(user.role === 'coach' || user.role === 'admin')) {
    showToast('Access denied: Coach/Admin only.', 'danger');
    setTimeout(() => window.location.href = '/', 1400);
  }
}

function guardAdminPage() {
  const isAdminPage =
    document.getElementById('sportsList') ||
    document.getElementById('roomsList');

  if (!isAdminPage) return;

  const user = getUser();
  const token = getToken();

  if (!token || !user) return forceLogout();

  if (user.role !== 'admin') {
    showToast('Access denied: Admin only.', 'danger');
    setTimeout(() => window.location.href = '/', 1400);
  }
}

let ALL_EVENTS = [];

async function loadSportsIntoFilter() {
  const sel = document.getElementById('sportFilterSelect');
  if (!sel) return;

  const { res, data } = await apiFetch('/sports');
  if (!res.ok) return;

  const sports = data.data || [];
  sel.innerHTML =
    `<option value="">All sports</option>` +
    sports.map(s => `<option value="${s.sport_id}">${s.name}</option>`).join('');
}

function renderEvents(events) {
  const grid = document.getElementById('eventsGrid');
  const alertBox = document.getElementById('eventsAlert');
  if (!grid) return;

  grid.innerHTML = '';

  if (!events.length) {
    if (alertBox) {
      alertBox.textContent = 'No events match your filters.';
      alertBox.classList.remove('d-none');
    }
    return;
  }

  alertBox?.classList.add('d-none');

  grid.innerHTML = events.map(e => `
    <div class="col-md-4">
      <div class="card shadow-sm h-100">
        <div class="card-body">
          <h5 class="card-title">${e.title}</h5>
          <p class="text-muted mb-2">${e.description ?? ''}</p>
          <div class="small text-muted mb-2">
            📅 ${fmtDate(e.date)} ⏰ ${String(e.time).slice(0,5)}<br/>
            🏀 ${e.sport_name} • 🏠 ${e.room_name}<br/>
            👤 Coach: ${e.coach_name}<br/>
            🎟 Capacity: ${e.capacity}
          </div>
          <button class="btn btn-dark w-100" onclick="joinEvent(${e.event_id})">Join</button>
        </div>
      </div>
    </div>
  `).join('');
}

function applyEventFilters() {
  const q = (document.getElementById('eventSearchInput')?.value || '').toLowerCase().trim();
  const sportId = document.getElementById('sportFilterSelect')?.value || '';

  let filtered = [...ALL_EVENTS];
  if (q) filtered = filtered.filter(e => (e.title || '').toLowerCase().includes(q));
  if (sportId) filtered = filtered.filter(e => String(e.sport_id) === String(sportId));

  renderEvents(filtered);
}

async function loadEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  const { res, data } = await apiFetch('/events');

  if (!res.ok) {
    grid.innerHTML = '';
    showToast(data.message || 'Failed to load events', 'danger');
    return;
  }

  ALL_EVENTS = data.data || [];
  applyEventFilters();
}

async function joinEvent(eventId) {
  if (!getToken()) return showToast('Please login first.', 'warning');

  const { res, data } = await apiFetch(`/events/${eventId}/register`, { method: 'POST' });
  if (!res.ok) return showToast(data.message || 'Could not register', 'danger');

  showToast(data.message || 'Registered!', 'success');
}

async function loadMyEvents() {
  const grid = document.getElementById('myEventsGrid');
  if (!grid) return;

  if (!getToken()) {
    grid.innerHTML = `<div class="alert alert-warning">Please login to view your events.</div>`;
    return;
  }

  const { res, data } = await apiFetch('/events/me/my-events');

  if (!res.ok) {
    grid.innerHTML = `<div class="alert alert-danger">${data.message || 'Failed to load your events'}</div>`;
    return;
  }

  const events = data.data || [];
  grid.innerHTML = '';

  if (!events.length) {
    grid.innerHTML = `<div class="alert alert-info">You have no registered events.</div>`;
    return;
  }

  grid.innerHTML = events.map(e => `
    <div class="card mb-2 shadow-sm">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-bold">${e.title}</div>
          <div class="small text-muted">📅 ${fmtDate(e.date)} ⏰ ${String(e.time).slice(0,5)}</div>
        </div>
        <button class="btn btn-outline-danger btn-sm" onclick="leaveEvent(${e.event_id})">Leave</button>
      </div>
    </div>
  `).join('');
}

async function leaveEvent(eventId) {
  const { res, data } = await apiFetch(`/events/${eventId}/register`, { method: 'DELETE' });
  if (!res.ok) return showToast(data.message || 'Could not unregister', 'danger');

  showToast(data.message || 'Unregistered!', 'success');
  loadMyEvents();
}

async function coachCreateEvent(e) {
  e.preventDefault();

  const user = getUser();
  if (!getToken() || !(user?.role === 'coach' || user?.role === 'admin')) {
    return showToast('Only coach/admin can create events.', 'danger');
  }

  const form = e.target;

  const payload = {
    title: form.title.value,
    description: form.description.value || null,
    date: form.date.value,
    time: form.time.value,
    capacity: Number(form.capacity.value),
    sport_id: Number(form.sport_id.value),
    room_id: Number(form.room_id.value)
  };

  const { res, data } = await apiFetch('/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) return showToast(data.message || 'Create failed', 'danger');

  showToast('Event created!', 'success');
  form.reset();
  loadCoachEvents();
  loadEvents(); 
}

async function loadCoachEvents() {
  const grid = document.getElementById('coachEventsGrid');
  if (!grid) return;

  const user = getUser();
  if (!user) {
    grid.innerHTML = '';
    showToast('Login required.', 'warning');
    return;
  }

  const { res, data } = await apiFetch('/events');

  if (!res.ok) {
    grid.innerHTML = `<div class="alert alert-danger">${data.message || 'Failed to load events'}</div>`;
    return;
  }

  const events = data.data || [];

  grid.innerHTML = events.map(e => `
    <div class="card mb-2 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-bold">${e.title}</div>
            <div class="small text-muted">
              📅 ${fmtDate(e.date)} ⏰ ${String(e.time).slice(0,5)} • Capacity ${e.capacity}
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm"
              onclick="editEvent(${e.event_id}, '${esc(e.title)}', '${esc(e.description ?? '')}', '${String(e.date).split('T')[0]}', '${String(e.time).slice(0,5)}', ${e.capacity})">
              Edit
            </button>

            <button class="btn btn-outline-secondary btn-sm"
              onclick="viewRegistrations(${e.event_id})">
              Registrations
            </button>

            <button class="btn btn-outline-danger btn-sm"
              onclick="deleteEvent(${e.event_id})">
              Delete
            </button>
          </div>
        </div>

        <div id="reg-${e.event_id}" class="mt-2 d-none"></div>
      </div>
    </div>
  `).join('');
}

async function viewRegistrations(eventId) {
  const box = document.getElementById(`reg-${eventId}`);
  if (!box) return;

  // toggle
  if (!box.classList.contains('d-none')) {
    box.classList.add('d-none');
    return;
  }

  const { res, data } = await apiFetch(`/events/${eventId}/registrations`);

  if (!res.ok) {
    showToast(data.message || 'Not allowed', 'danger');
    box.innerHTML = '';
    box.classList.add('d-none');
    return;
  }

  const regs = data.data || [];
  if (!regs.length) {
    box.innerHTML = `<div class="alert alert-info mb-0">No registrations yet.</div>`;
  } else {
    box.innerHTML = `
      <ul class="list-group">
        ${regs.map(r => `<li class="list-group-item">${r.name} (${r.email})</li>`).join('')}
      </ul>
    `;
  }

  box.classList.remove('d-none');
}

async function deleteEvent(eventId) {
  if (!confirm('Delete this event?')) return;

  const { res, data } = await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
  if (!res.ok) return showToast(data.message || 'Delete failed', 'danger');

  showToast('Event deleted', 'success');
  loadCoachEvents();
  loadEvents();
}

async function editEvent(id, curTitle, curDesc, curDate, curTime, curCap) {
  const title = prompt('Event title:', curTitle);
  if (title === null) return;

  const description = prompt('Description:', curDesc ?? '');
  if (description === null) return;

  const date = prompt('Date (YYYY-MM-DD):', curDate);
  if (date === null) return;

  const time = prompt('Time (HH:MM):', curTime);
  if (time === null) return;

  const capStr = prompt('Capacity:', String(curCap));
  if (capStr === null) return;

  const capacity = Number(capStr);
  if (!Number.isFinite(capacity) || capacity < 1) {
    return showToast('Capacity must be a number >= 1', 'danger');
  }

  const { res, data } = await apiFetch(`/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, date, time, capacity })
  });

  if (!res.ok) return showToast(data.message || 'Update failed', 'danger');

  showToast('Event updated successfully', 'success');
  loadCoachEvents();
  loadEvents();
}

async function loadSportsIntoSelect() {
  const sel = document.getElementById('sportSelect');
  if (!sel) return;

  const { res, data } = await apiFetch('/sports');
  if (!res.ok) return;

  const sports = data.data || [];
  sel.innerHTML =
    `<option value="">Select sport...</option>` +
    sports.map(s => `<option value="${s.sport_id}">${s.name}</option>`).join('');
}

async function loadRoomsIntoSelect() {
  const sel = document.getElementById('roomSelect');
  if (!sel) return;

  const { res, data } = await apiFetch('/rooms');
  if (!res.ok) return;

  const rooms = data.data || [];
  sel.innerHTML =
    `<option value="">Select room...</option>` +
    rooms.map(r => `<option value="${r.room_id}">${r.name} (cap ${r.capacity})</option>`).join('');
}

async function loadSportsAdmin() {
  const list = document.getElementById('sportsList');
  if (!list) return;

  const { res, data } = await apiFetch('/sports');
  if (!res.ok) {
    list.innerHTML = `<div class="alert alert-danger mb-0">${data.message || 'Failed to load sports'}</div>`;
    return;
  }

  const sports = data.data || [];
  if (!sports.length) {
    list.innerHTML = `<div class="alert alert-info mb-0">No sports yet.</div>`;
    return;
  }

  list.innerHTML = `
    <div class="list-group">
      ${sports.map(s => `
        <div class="list-group-item">
          <div class="d-flex justify-content-between gap-2">
            <div>
              <div class="fw-bold">${s.name}</div>
              <div class="small text-muted">${s.description ?? ''}</div>
              <div class="small text-muted">ID: ${s.sport_id}</div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary btn-sm"
                onclick="editSport(${s.sport_id}, '${esc(s.name)}', '${esc(s.description ?? '')}')">Edit</button>
              <button class="btn btn-outline-danger btn-sm"
                onclick="deleteSport(${s.sport_id})">Delete</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function createSport(e) {
  e.preventDefault();
  const form = e.target;

  const payload = {
    name: form.name.value.trim(),
    description: form.description.value.trim() || null
  };

  const { res, data } = await apiFetch('/sports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) return showToast(data.message || 'Create sport failed', 'danger');

  showToast('Sport created!', 'success');
  form.reset();
  loadSportsAdmin();
  loadSportsIntoSelect();
  loadSportsIntoFilter();
}

async function deleteSport(id) {
  if (!confirm('Delete this sport?')) return;

  const { res, data } = await apiFetch(`/sports/${id}`, { method: 'DELETE' });
  if (!res.ok) return showToast(data.message || 'Delete sport failed', 'danger');

  showToast('Sport deleted', 'success');
  loadSportsAdmin();
  loadSportsIntoSelect();
  loadSportsIntoFilter();
}

async function editSport(id, currentName, currentDesc) {
  const name = prompt('Sport name:', currentName);
  if (name === null) return;

  const description = prompt('Sport description:', currentDesc ?? '');
  if (description === null) return;

  const payload = { name: name.trim(), description: description.trim() || null };

  const { res, data } = await apiFetch(`/sports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) return showToast(data.message || 'Update sport failed', 'danger');

  showToast('Sport updated!', 'success');
  loadSportsAdmin();
  loadSportsIntoSelect();
  loadSportsIntoFilter();
}

async function loadRoomsAdmin() {
  const list = document.getElementById('roomsList');
  if (!list) return;

  const { res, data } = await apiFetch('/rooms');
  if (!res.ok) {
    list.innerHTML = `<div class="alert alert-danger mb-0">${data.message || 'Failed to load rooms'}</div>`;
    return;
  }

  const rooms = data.data || [];
  if (!rooms.length) {
    list.innerHTML = `<div class="alert alert-info mb-0">No rooms yet.</div>`;
    return;
  }

  list.innerHTML = `
    <div class="list-group">
      ${rooms.map(r => `
        <div class="list-group-item">
          <div class="d-flex justify-content-between gap-2">
            <div>
              <div class="fw-bold">${r.name}</div>
              <div class="small text-muted">${r.location ?? ''}</div>
              <div class="small text-muted">Capacity: ${r.capacity} • ID: ${r.room_id}</div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary btn-sm"
                onclick="editRoom(${r.room_id}, '${esc(r.name)}', '${esc(r.location ?? '')}', ${r.capacity})">Edit</button>
              <button class="btn btn-outline-danger btn-sm"
                onclick="deleteRoom(${r.room_id})">Delete</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function createRoom(e) {
  e.preventDefault();
  const form = e.target;

  const payload = {
    name: form.name.value.trim(),
    location: form.location.value.trim() || null,
    capacity: Number(form.capacity.value)
  };

  const { res, data } = await apiFetch('/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) return showToast(data.message || 'Create room failed', 'danger');

  showToast('Room created!', 'success');
  form.reset();
  loadRoomsAdmin();
  loadRoomsIntoSelect();
}

async function deleteRoom(id) {
  if (!confirm('Delete this room?')) return;

  const { res, data } = await apiFetch(`/rooms/${id}`, { method: 'DELETE' });
  if (!res.ok) return showToast(data.message || 'Delete room failed', 'danger');

  showToast('Room deleted', 'success');
  loadRoomsAdmin();
  loadRoomsIntoSelect();
}

async function editRoom(id, currentName, currentLocation, currentCapacity) {
  const name = prompt('Room name:', currentName);
  if (name === null) return;

  const location = prompt('Room location:', currentLocation ?? '');
  if (location === null) return;

  const capStr = prompt('Room capacity:', String(currentCapacity));
  if (capStr === null) return;

  const capacity = Number(capStr);
  if (!Number.isFinite(capacity) || capacity < 1) {
    return showToast('Capacity must be >= 1', 'warning');
  }

  const payload = { name: name.trim(), location: location.trim() || null, capacity };

  const { res, data } = await apiFetch(`/rooms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) return showToast(data.message || 'Update room failed', 'danger');

  showToast('Room updated!', 'success');
  loadRoomsAdmin();
  loadRoomsIntoSelect();
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();

  guardCoachPage();
  guardAdminPage();

  const refreshEventsBtn = document.getElementById('refreshEventsBtn');
  if (refreshEventsBtn) refreshEventsBtn.addEventListener('click', loadEvents);

  if (document.getElementById('eventsGrid')) {
    loadSportsIntoFilter();

    document.getElementById('eventSearchInput')
      ?.addEventListener('input', applyEventFilters);

    document.getElementById('sportFilterSelect')
      ?.addEventListener('change', applyEventFilters);

    document.getElementById('clearFiltersBtn')
      ?.addEventListener('click', () => {
        const s = document.getElementById('eventSearchInput');
        const f = document.getElementById('sportFilterSelect');
        if (s) s.value = '';
        if (f) f.value = '';
        applyEventFilters();
      });

    loadEvents();
  }

  if (document.getElementById('myEventsGrid')) {
    loadMyEvents();
  }

  const refreshCoachBtn = document.getElementById('refreshCoachEventsBtn');
  if (refreshCoachBtn) refreshCoachBtn.addEventListener('click', loadCoachEvents);

  const coachForm = document.getElementById('coachCreateEventForm');
  if (coachForm) coachForm.addEventListener('submit', coachCreateEvent);

  if (document.getElementById('coachEventsGrid')) {
    loadSportsIntoSelect();
    loadRoomsIntoSelect();
    loadCoachEvents();
  }

  const sportForm = document.getElementById('sportCreateForm');
  if (sportForm) sportForm.addEventListener('submit', createSport);

  const roomForm = document.getElementById('roomCreateForm');
  if (roomForm) roomForm.addEventListener('submit', createRoom);

  const adminRefresh = document.getElementById('adminRefreshBtn');
  if (adminRefresh) adminRefresh.addEventListener('click', () => {
    loadSportsAdmin();
    loadRoomsAdmin();
  });

  if (document.getElementById('sportsList') || document.getElementById('roomsList')) {
    loadSportsAdmin();
    loadRoomsAdmin();
  }

});

window.joinEvent = joinEvent;
window.leaveEvent = leaveEvent;

window.viewRegistrations = viewRegistrations;
window.deleteEvent = deleteEvent;
window.editEvent = editEvent;

window.deleteSport = deleteSport;
window.editSport = editSport;

window.deleteRoom = deleteRoom;
window.editRoom = editRoom;
