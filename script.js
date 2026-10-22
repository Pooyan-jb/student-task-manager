
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

const colors = [
    "#fbcfe8",
    "#bfdbfe",
    "#bbf7d0",
    "#fef08a",
    "#ddd6fe",
    "#fed7aa"
];

// Load saved tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display all tasks
function displayTasks() {
    taskList.innerHTML = "";

    tasks.forEach(function(task, index) {
        const newTask = document.createElement("li");
        newTask.style.backgroundColor = task.color;

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = Boolean(task.completed);

        // Task text
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        if (task.completed) {
            newTask.classList.add("completed");
        }

        // Mark task as completed or uncompleted
        checkbox.addEventListener("change", function() {
            task.completed = checkbox.checked;
            saveTasks();
            displayTasks();
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        });

        newTask.appendChild(checkbox);
        newTask.appendChild(taskText);
        newTask.appendChild(deleteButton);

        taskList.appendChild(newTask);
    });
}

// Add a new task
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskText = input.value.trim();

    if (taskText === "") {
        return;
    }

    const existingTask = tasks.find(task =>
        task.text.toLowerCase() === taskText.toLowerCase()
    );

    let taskColor;

    if (existingTask) {
        taskColor = existingTask.color;
    } else {
        const randomIndex = Math.floor(
            Math.random() * colors.length
        );
        taskColor = colors[randomIndex];
    }

    const newTask = {
        text: taskText,
        color: taskColor,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    displayTasks();

    input.value = "";
});

// Show saved tasks
displayTasks();
