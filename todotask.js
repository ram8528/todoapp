let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let searchText = "";

/* ---------- SAVE ---------- */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ---------- ADD TASK ---------- */
function addTask() {
  const title = document.getElementById("title").value.trim();
  if (!title) {
    alert("Title required");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    desc: document.getElementById("desc").value,
    dueDate: document.getElementById("dueDate").value,
    priority: document.getElementById("priority").value,
    completed: false,
    createdAt: Date.now(),
  };

  tasks.push(task);
  saveTasks();
  clearInputs();
  renderTasks();
}

function clearInputs(){
    document.getElementById("title").value="";
    document.getElementById("desc").value="";
    document.getElementById("dueDate").value="";
}


document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

/* ---------- DELETE ---------- */
function deleteTask(id) {
  if (confirm("Delete this task?")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
  }
}

/* ---------- EDIT ---------- */
function editTask(id) {
  const task = tasks.find((t) => t.id === id);

  const newTitle = prompt("Edit title", task.title);
  if (newTitle === null) return;

  const newDesc = prompt("Edit description", task.desc);

  task.title = newTitle;
  task.desc = newDesc;

  saveTasks();
  renderTasks();
}

/* ---------- TOGGLE COMPLETE ---------- */
function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  task.completed = !task.completed;

  saveTasks();
  renderTasks();
}

/* ---------- SEARCH (DEBOUNCE 400ms) ---------- */
let debounceTimer;
document.getElementById("search").addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchText = e.target.value.toLowerCase();
    renderTasks();
  }, 400);
});


document.getElementById("filter").onchange = renderTasks;
document.getElementById("sort").onchange = renderTasks;

/* ---------- RENDER ---------- */
function renderTasks() {
  let filtered = [...tasks];

  /* SEARCH */
  filtered = filtered.filter((t) => t.title.toLowerCase().includes(searchText));

  /* FILTER */
  const filter = document.getElementById("filter").value;

  if (filter === "completed") filtered = filtered.filter((t) => t.completed);

  if (filter === "pending") filtered = filtered.filter((t) => !t.completed);

  if (filter === "high")
    filtered = filtered.filter((t) => t.priority === "high");

  /* SORT */
  const sort = document.getElementById("sort").value;

  if (sort === "created") filtered.sort((a, b) => a.createdAt - b.createdAt);

  if (sort === "due")
    filtered.sort((a, b) =>
      (a.dueDate || "9999") > (b.dueDate || "9999") ? 1 : -1,
    );

  if (sort === "priority")
    filtered.sort((a, b) => (a.priority === "high" ? -1 : 1));

  /* MOVE COMPLETED TO BOTTOM */
  filtered.sort((a, b) => a.completed - b.completed);

  /* DISPLAY */
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  filtered.forEach((task) => {
    const div = document.createElement("div");
    div.className = `task ${task.priority} ${task.completed ? "completed" : ""}`;

    div.innerHTML = `
        <div>
            <input type="checkbox"
                ${task.completed ? "checked" : ""}
                onchange="toggleComplete(${task.id})">

            <strong>${task.title}</strong><br>
            <small>${task.desc || ""}</small><br>
            <small>Due: ${task.dueDate || "N/A"}</small>
        </div>

        <div class="actions">
            <button onclick="editTask(${task.id})">Edit</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        </div>
        `;

    list.appendChild(div);
  });
}

renderTasks();
