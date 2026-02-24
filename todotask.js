// Load tasks from storage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Select elements
const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");


// Render tasks
function renderTasks(){

    taskList.innerHTML = "";

    tasks.forEach((task,index)=>{

        const li = document.createElement("li");

        li.innerHTML = `
            <span class="${task.done ? 'done' : ''}">
                ${task.text}
            </span>

            <div class="actions">
                <button data-action="toggle">✔</button>
                <button data-action="edit">Edit</button>
                <button data-action="delete">Delete</button>
            </div>
        `;

        li.dataset.index = index;
        taskList.appendChild(li);
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// Add task
function addTask(){
    if(!input.value.trim()) return;

    tasks.push({
        text: input.value,
        done:false
    });

    input.value="";
    renderTasks();
}


// Add button click
addBtn.addEventListener("click", addTask);


// Handle edit/delete/toggle (Event Delegation)
taskList.addEventListener("click", function(e){

    const action = e.target.dataset.action;
    const index = e.target.closest("li").dataset.index;

    if(action === "delete"){
        if(confirm("Delete this task?")){
            tasks.splice(index,1);
        }
    }

    if(action === "edit"){
        const newText = prompt("Edit task", tasks[index].text);
        if(newText) tasks[index].text = newText;
    }

    if(action === "toggle"){
        tasks[index].done = !tasks[index].done;
    }

    renderTasks();
});


// Enter key support
input.addEventListener("keypress", function(e){
    if(e.key === "Enter") addTask();
});


// Initial load
renderTasks();