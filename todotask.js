/* ===============================
   USER PROFILE IMAGE
=================================*/

const profileInput = document.getElementById("profileInput");
const profilePreview = document.getElementById("profilePreview");

// load saved image
const savedProfile = localStorage.getItem("profileImage");
if(savedProfile){
    profilePreview.src = savedProfile;
    profilePreview.style.display="block";
}

// upload profile
profileInput.addEventListener("change",function(){
    const file = this.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){
        profilePreview.src = e.target.result;
        profilePreview.style.display="block";
        localStorage.setItem("profileImage", e.target.result);
    };

    reader.readAsDataURL(file);
});

// remove profile
function removeProfile(){
    if(!confirm("Remove profile image?")) return;

    localStorage.removeItem("profileImage");
    profilePreview.style.display="none";
    profileInput.value="";
}


/* ===============================
   TASK MANAGER
=================================*/

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ADD TASK */
function addTask(){

    const title = document.getElementById("title").value.trim();
    if(!title){
        alert("Title required");
        return;
    }

    const imageFile = document.getElementById("taskImage").files[0];

    function createTask(imageData=null){

        const task = {
            id: Date.now(),
            title:title,
            desc:desc.value,
            dueDate:dueDate.value,
            priority:priority.value,
            image:imageData,
            completed:false,
            createdAt:Date.now()
        };

        tasks.push(task);
        saveTasks();
        clearInputs();
        renderTasks();
    }

    if(imageFile){
        const reader = new FileReader();

        reader.onload = function(e){
            createTask(e.target.result);
        };

        reader.readAsDataURL(imageFile);
    }else{
        createTask();
    }
}

/* CLEAR INPUTS */
function clearInputs(){
    title.value="";
    desc.value="";
    dueDate.value="";
    taskImage.value="";
}

/* DELETE TASK */
function deleteTask(id){
    if(!confirm("Delete task?")) return;

    tasks = tasks.filter(t=>t.id!==id);
    saveTasks();
    renderTasks();
}

/* TOGGLE COMPLETE */
function toggleComplete(id){
    const task = tasks.find(t=>t.id===id);
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
}

/* EDIT TASK */
function editTask(id){
    const task = tasks.find(t=>t.id===id);

    const newTitle = prompt("Edit title",task.title);
    if(newTitle===null) return;

    const newDesc = prompt("Edit description",task.desc);

    task.title=newTitle;
    task.desc=newDesc;

    saveTasks();
    renderTasks();
}

/* RENDER TASKS */
function renderTasks(){

    const list=document.getElementById("taskList");
    list.innerHTML="";

    const sorted=[...tasks].sort((a,b)=>a.completed-b.completed);

    sorted.forEach(task=>{

        const div=document.createElement("div");
        div.className=`task ${task.priority} ${task.completed?'completed':''}`;

        div.innerHTML=`
        <div>
            <input type="checkbox"
            ${task.completed?'checked':''}
            onchange="toggleComplete(${task.id})">

            <strong>${task.title}</strong><br>
            <small>${task.desc||""}</small><br>
            <small>Due: ${task.dueDate||"N/A"}</small><br>

            ${
                task.image
                ? `<img src="${task.image}" width="80">`
                : ""
            }
        </div>

        <div>
            <button onclick="editTask(${task.id})">Edit</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        </div>
        `;

        list.appendChild(div);
    });
}

renderTasks();