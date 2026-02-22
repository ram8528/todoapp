let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

function showTasks() {
  let list = document.getElementById("list");
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    if (!task) return;

    let li = document.createElement("li");
    // li.innerHTML = `
    //   <span onclick="toggleTask(${index})" class="${task.done ? "done" : ""}">
    //     ${task.text}
    //   </span>
    li.innerHTML = ` <input type="checkbox" 
             ${task.done ? "checked" : ""} 
             onchange="toggleTask(${index})">

      <span class="${task.done ? "done" : ""}">
        ${task.text}
      </span>
      <button onclick="editTask(${index})">Edit</button>
      <button onclick="delTask(${index})">Delete</button>
    `;

    list.appendChild(li);
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  let input = document.getElementById("taskInput");
  if (!input.value.trim()) return;

  tasks.push({
    text: input.value.trim(),
    done: false,
  });

  input.value = "";
  showTasks();
}

function delTask(index) {
  tasks.splice(index, 1);
  showTasks();
}

function editTask(index) {
  let newTask = prompt("Edit your task", tasks[index].text);
  if (newTask && newTask.trim()) {
    tasks[index].text = newTask.trim();
    showTasks();
  }
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  showTasks();
}

showTasks();
