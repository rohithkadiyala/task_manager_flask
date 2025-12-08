// static/app.js
// Frontend JavaScript for Task Manager
// - Fetch tasks from backend
// - Render tasks into three columns
// - Handle add / edit / delete
// - Handle status changes (move tasks between columns)
// - Handle search + sort
// - Update progress bar
// - Update theme toggle
//
// Code is heavily commented for beginners.

(() => {
  // API base
  const API_BASE = '/api/tasks';

  // DOM references
  const colIncomplete = document.getElementById('col-incomplete');
  const colInProgress = document.getElementById('col-inprogress');
  const colCompleted = document.getElementById('col-completed');

  const addBtn = document.getElementById('add-task-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  const prioritySelect = document.getElementById('task-priority');
  const deadlineInput = document.getElementById('task-deadline');

  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  const progressFill = document.getElementById('progress-fill');
  const progressPercent = document.getElementById('progress-percent');

  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // App state
  let tasks = [];        // list of all tasks
  let editingTaskId = null; // if null -> adding mode; else -> editing that ID

  // ----- Utility functions -----
  function formatDeadline(deadline) {
    if (!deadline) return '';
    // Show human-friendly date/time
    try {
      const d = new Date(deadline);
      if (isNaN(d)) return deadline;
      return d.toLocaleString();
    } catch (e) {
      return deadline;
    }
  }

  function priorityToClass(priority) {
    if (priority === 'High') return 'high';
    if (priority === 'Medium') return 'medium';
    return 'low';
  }

  function clearForm() {
    titleInput.value = '';
    descInput.value = '';
    prioritySelect.value = 'Medium';
    deadlineInput.value = '';
    editingTaskId = null;
    addBtn.textContent = 'Add Task';
    cancelEditBtn.classList.add('hidden');
  }

  function showFormWithTask(task) {
    titleInput.value = task.title;
    descInput.value = task.description || '';
    prioritySelect.value = task.priority || 'Medium';
    deadlineInput.value = task.deadline || '';
    editingTaskId = task.id;
    addBtn.textContent = 'Save Edit';
    cancelEditBtn.classList.remove('hidden');
    // Scroll to top so form is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ----- Rendering -----
  function renderTasks() {
    // Clear columns
    colIncomplete.innerHTML = '';
    colInProgress.innerHTML = '';
    colCompleted.innerHTML = '';

    // Apply search + sort
    const q = searchInput.value.trim().toLowerCase();
    let visible = tasks.filter(t => {
      if (!q) return true;
      // search in title and description
      return (t.title && t.title.toLowerCase().includes(q)) ||
             (t.description && t.description.toLowerCase().includes(q));
    });

    // Sorting
    const sort = sortSelect.value;
    visible.sort((a, b) => {
      if (sort === 'created_desc') {
        return (b.id || 0) - (a.id || 0);
      } else if (sort === 'created_asc') {
        return (a.id || 0) - (b.id || 0);
      } else if (sort === 'deadline_asc') {
        const A = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const B = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return A - B;
      } else if (sort === 'deadline_desc') {
        const A = a.deadline ? new Date(a.deadline).getTime() : -Infinity;
        const B = b.deadline ? new Date(b.deadline).getTime() : -Infinity;
        return B - A;
      } else if (sort === 'priority_desc') {
        const map = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (map[b.priority] || 0) - (map[a.priority] || 0);
      } else if (sort === 'priority_asc') {
        const map = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (map[a.priority] || 0) - (map[b.priority] || 0);
      } else if (sort === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sort === 'title_desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

    // Put into columns
    visible.forEach(t => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.innerHTML = `
        <h3>${escapeHtml(t.title)}</h3>
        <p>${escapeHtml(t.description || '')}</p>
        <div class="meta">
          <div class="badge ${priorityToClass(t.priority)}">${t.priority}</div>
          <div class="deadline">${escapeHtml(formatDeadline(t.deadline))}</div>
        </div>
        <div class="card-actions">
          <button class="small" data-action="edit" data-id="${t.id}">Edit</button>
          <button class="small" data-action="delete" data-id="${t.id}">Delete</button>
          <select class="small status-select" data-id="${t.id}" title="Change status">
            <option value="incomplete">Incomplete</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      `;

      // Set the status select to current value
      const sel = card.querySelector('.status-select');
      sel.value = t.status;

      // Event listeners for card buttons
      card.querySelector('[data-action="edit"]').addEventListener('click', () => {
        showFormWithTask(t);
      });

      card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
        if (!confirm('Delete this task?')) return;
        await deleteTask(t.id);
      });

      sel.addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        await changeStatus(t.id, newStatus);
      });

      // Append to correct column
      if (t.status === 'completed') {
        colCompleted.appendChild(card);
      } else if (t.status === 'in_progress') {
        colInProgress.appendChild(card);
      } else {
        colIncomplete.appendChild(card);
      }
    });

    updateProgressBar();
  }

  // Escape HTML for safety (simple)
  function escapeHtml(str) {
    return (str + '')
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function updateProgressBar() {
    const total = tasks.length || 0;
    const done = tasks.filter(t => t.status === 'completed').length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
  }

  // ----- API actions -----
  async function fetchTasks() {
    try {
      const res = await fetch(API_BASE);
      tasks = await res.json();
      renderTasks();
    } catch (err) {
      console.error('Failed to fetch tasks', err);
      alert('Failed to fetch tasks from server.');
    }
  }

  async function addTask(payload) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Error adding task: ' + (err.error || res.statusText));
        return;
      }
      const newTask = await res.json();
      tasks.push(newTask);
      clearForm();
      renderTasks();
    } catch (err) {
      console.error(err);
      alert('Error adding task.');
    }
  }

  async function saveEdit(taskId, payload) {
    try {
      const res = await fetch(`${API_BASE}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Error saving task: ' + (err.error || res.statusText));
        return;
      }
      const updated = await res.json();
      // update local list
      tasks = tasks.map(t => (t.id === updated.id ? updated : t));
      clearForm();
      renderTasks();
    } catch (err) {
      console.error(err);
      alert('Error saving edit.');
    }
  }

  async function deleteTask(taskId) {
    try {
      const res = await fetch(`${API_BASE}/${taskId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert('Error deleting: ' + (err.error || res.statusText));
        return;
      }
      tasks = tasks.filter(t => t.id !== taskId);
      renderTasks();
    } catch (err) {
      console.error(err);
      alert('Error deleting task.');
    }
  }

  async function changeStatus(taskId, newStatus) {
    try {
      const res = await fetch(`${API_BASE}/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Error changing status: ' + (err.error || res.statusText));
        // Re-fetch to correct UI
        fetchTasks();
        return;
      }
      const updated = await res.json();
      tasks = tasks.map(t => (t.id === updated.id ? updated : t));
      renderTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to change status.');
    }
  }

  // ----- Event handlers -----
  addBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) {
      alert('Title is required.');
      return;
    }
    const payload = {
      title,
      description: descInput.value.trim(),
      priority: prioritySelect.value,
      deadline: deadlineInput.value || null
    };
    if (editingTaskId) {
      // Save edit
      payload.status = tasks.find(t => t.id === editingTaskId)?.status || 'incomplete';
      await saveEdit(editingTaskId, payload);
    } else {
      // Add new
      await addTask(payload);
    }
  });

  cancelEditBtn.addEventListener('click', () => {
    clearForm();
  });

  searchInput.addEventListener('input', () => {
    renderTasks();
  });

  sortSelect.addEventListener('change', () => {
    renderTasks();
  });

  // Theme toggle
  function setTheme(theme) {
    if (theme === 'dark') {
      body.classList.remove('light');
      body.classList.add('dark');
      // Theme-specific adjustments can go here
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark');
      body.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }

  themeToggle.addEventListener('click', () => {
    const current = body.classList.contains('dark') ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Load theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  // ----- Initialization -----
  // Fetch tasks from server when page loads
  fetchTasks();

  // Expose some helpers for debugging (optional)
  window.taskApp = {
    reload: fetchTasks,
    tasks: () => tasks
  };

})();
