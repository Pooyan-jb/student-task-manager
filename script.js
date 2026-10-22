
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const deadlineInput = document.getElementById("task-deadline");
const priorityInput = document.getElementById("task-priority");
const taskList = document.getElementById("task-list");

const filterSelect = document.getElementById("filter");
const sortSelect = document.getElementById("sort");
const taskCount = document.getElementById("task-count");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const emptyState = document.getElementById("empty-state");

const STORAGE_KEY = "tasks";

const colors = [
    "#fbcfe8",
    "#bfdbfe",
    "#bbf7d0",
    "#fef08a",
    "#ddd6fe",
    "#fed7aa"
];

const priorityOrder = {
    high: 3,
    medium: 2,
    low: 1
};

// Generate a unique ID for each task
function createId() {
    return Date.now() + "-" + Math.random().toString(36).slice(2);
}

// Pick a random color
function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

// Load tasks, including tasks saved by older versions
function loadTasks() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(saved)) return [];

        return saved
            .filter(task =>
                task &&
                typeof task.text === "string" &&
                task.text.trim() !== ""
            )
            .map(task => ({
                id: task.id || createId(),
                text: task.text.trim(),
                deadline: task.deadline || "",
                priority: ["low", "medium", "high"].includes(task.priority)
                    ? task.priority
                    : "medium",
                color: task.color || randomColor(),
                completed: Boolean(task.completed)
            }));
    } catch (error) {
        console.error("Failed to load tasks:", error);
        return [];
    }
}

let tasks = loadTasks();

// Save all tasks
function saveTasks() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );
    } catch (error) {
        console.error("Failed to save tasks:", error);
        alert("Tasks could not be saved in this browser.");
    }
}

// Calculate progress
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    taskCount.textContent = `${completed} / ${total} Completed`;
    progressBar.value = percentage;
    progressText.textContent = `${percentage}%`;
}

// Get filtered and sorted tasks
function getVisibleTasks() {
    let result = [...tasks];

    const filter = filterSelect.value;

    if (filter === "active") {
        result = result.filter(task => !task.completed);
    } else if (filter === "completed") {
        result = result.filter(task => task.completed);
    }

    const sort = sortSelect.value;

    if (sort === "newest") {
        result.reverse();
    } else if (sort === "deadline") {
        result.sort((a, b) =>
            (a.deadline || "9999-12-31")
                .localeCompare(b.deadline || "9999-12-31")
        );
    } else if (sort === "priority") {
        result.sort((a, b) =>
            priorityOrder[b.priority] - priorityOrder[a.priority]
        );
    } else if (sort === "alphabetical") {
        result.sort((a, b) =>
            a.text.localeCompare(b.text)
        );
    }

    return result;
}

// Mark a task completed/uncompleted
function toggleTask(id, completed) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = completed;
    saveTasks();
    displayTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    displayTasks();
}

// Edit task name
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const newText = prompt("Edit task name:", task.text);

    if (newText === null) return;

    const trimmedText = newText.trim();

    if (trimmedText === "") {
        alert("Task name cannot be empty.");
        return;
    }

    if (trimmedText.length > 120) {
        alert("Task name is too long.");
        return;
    }

    task.text = trimmedText;
    saveTasks();
    displayTasks();
}

// Display tasks
function displayTasks() {
    taskList.innerHTML = "";

    const visibleTasks = getVisibleTasks();

    updateProgress();

    emptyState.style.display =
        visibleTasks.length === 0 ? "block" : "none";

    emptyState.textContent = tasks.length === 0
        ? "No tasks yet. Add your first task!"
        : "No tasks match this filter.";

    // Today's date in local time
    const now = new Date();
    const today =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");

    visibleTasks.forEach(task => {

        const li = document.createElement("li");
        li.className = "task-card";
        li.style.backgroundColor = task.color;

        if (task.completed) {
            li.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label", "Complete " + task.text
        );

        checkbox.addEventListener("change", () => {
            toggleTask(task.id, checkbox.checked);
        });

        // Content
        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("h3");
        title.className = "task-title";
        title.textContent = task.text;

        const details = document.createElement("div");
        details.className = "task-details";

        // Deadline
        const dateLabel = document.createElement("span");
        dateLabel.textContent = task.deadline
            ? "Due: " + task.deadline
            : "No deadline";

        if (
            task.deadline &&
            task.deadline < today &&
            !task.completed
        ) {
            dateLabel.classList.add("overdue");
            dateLabel.textContent += " (Overdue)";
        }

        // Priority
        const priorityBadge = document.createElement("span");
        priorityBadge.className =
            "priority-badge priority-" + task.priority;

        priorityBadge.textContent =
            task.priority.toUpperCase();

        details.appendChild(dateLabel);
        details.appendChild(priorityBadge);

        content.appendChild(title);
        content.appendChild(details);

        // Buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", "Edit " + task.text);
        editButton.addEventListener("click", () => {
            editTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + task.text);
        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        li.appendChild(checkbox);
        li.appendChild(content);
        li.appendChild(actions);

        taskList.appendChild(li);
    });
}

// Add task
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const text = input.value.trim();
    const deadline = deadlineInput.value;
    const priority = priorityInput.value;

    if (!text) return;

    // Reuse color for a task with the same name
    const existingTask = tasks.find(task =>
        task.text.toLowerCase() === text.toLowerCase()
    );

    const color = existingTask
        ? existingTask.color
        : randomColor();

    const newTask = {
        id: createId(),
        text: text,
        deadline: deadline,
        priority: priority,
        color: color,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    displayTasks();

    form.reset();
    input.focus();
});

// Refresh list when filter/sort changes
filterSelect.addEventListener("change", displayTasks);
sortSelect.addEventListener("change", displayTasks);

// Initial display
displayTasks();
