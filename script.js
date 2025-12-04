/* ===========================================================
   MODULE 1 — VARIABLES, TIPE DATA, OPERATOR, INPUT/OUTPUT
   =========================================================== */
const APP_TITLE = "Smart Note Organizer";
let tasks = []; 
const STORAGE_KEY = "sd_tasks_v4";

/* ===========================================================
   MODULE 5 & 6 — OOP DASAR + LANJUTAN (ENCAPSULATION + INHERIT)
   =========================================================== */

// ABSTRACT CLASS
class StorageBase {
    save() { throw "Not implemented"; }
    load() { throw "Not implemented"; }
}

// INHERITANCE + ABSTRACTION
class LocalStorageAdapter extends StorageBase {
    constructor(key) {
        super();
        this.key = key;
    }
    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }
    load() {
        return JSON.parse(localStorage.getItem(this.key) || "[]");
    }
}

const storage = new LocalStorageAdapter(STORAGE_KEY);

// TASK CLASS (ENCAPSULATION)
class Task {
    #title;
    #deadline;
    #priority;
    #progress;
    #notes;

    constructor(title, deadline, priority, progress, notes) {
        this.#title = title;
        this.#deadline = deadline;
        this.#priority = priority;
        this.#progress = progress;
        this.#notes = notes;
    }

    // getters
    getTitle() { return this.#title; }
    getDeadline() { return this.#deadline; }
    getPriority() { return this.#priority; }
    getProgress() { return this.#progress; }
    getNotes() { return this.#notes; }

    // Utility
    toObject() {
        return {
            title: this.#title,
            deadline: this.#deadline,
            priority: this.#priority,
            progress: this.#progress,
            notes: this.#notes
        };
    }

    static fromObject(o) {
        return new Task(o.title, o.deadline, o.priority, o.progress, o.notes);
    }
}

/* ===========================================================
   MODULE 2 — PENGKONDISIAN (IF, ELSE, SWITCH)
   =========================================================== */
function priorityBadge(p) {
    switch (p) {
        case "High": return "🔴 High";
        case "Medium": return "🟡 Medium";
        case "Low": return "🟢 Low";
        default: return p;
    }
}

/* ===========================================================
   MODULE 3 — LOOPING (render task list)
   =========================================================== */
function renderTasks() {
    const box = document.getElementById("taskList");
    box.innerHTML = "";

    if (tasks.length === 0) {
        box.innerHTML = "Tidak ada tugas";
        updateSummary();
        return;
    }

tasks.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "task";

    // Format deadline agar lebih rapi
    const d = new Date(t.getDeadline());
    const formattedDeadline = d.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    row.innerHTML = `
        <div>
            <b>${t.getTitle()}</b>

            <!-- PRIORITY -->
            <div style="color:#444; margin-top:3px;">
                ${priorityBadge(t.getPriority())}
            </div>

            <!-- DEADLINE (baru ditambahkan) -->
            <div style="color:#b11; margin-top:3px; font-size:14px;">
                ⏳ Deadline: <b>${formattedDeadline}</b>
            </div>

            <!-- NOTES -->
            <div style="color:#6b4d4d; margin-top:4px;">
                ${t.getNotes()}
            </div>
        </div>

        <div style="text-align:right">
            <div style="font-weight:bold; margin-bottom:6px;">${t.getProgress()}%</div>
            <button class="btn-primary" onclick="editTask(${i})">Edit</button>
            <button class="btn-secondary" onclick="deleteTask(${i})">Hapus</button>
        </div>
    `;

    box.appendChild(row);
});
}

/* ===========================================================
   MODULE 4 — FUNCTIONS & METHODS
   =========================================================== */

function loadFromStorage() {
    tasks = storage.load().map(o => Task.fromObject(o));
}

function saveToStorage() {
    storage.save(tasks.map(t => t.toObject()));
}

function updateSummary() {
    const total = tasks.length;
    const avg = total ? Math.round(tasks.reduce((a, b) => a + b.getProgress(), 0) / total) : 0;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("sumCount").textContent = total;
    document.getElementById("avgPercent").textContent = avg + "%";
    document.getElementById("sumAvg").textContent = avg + "%";
    document.getElementById("progressFill").style.width = avg + "%";
}

/* ===========================================================
   FORM HANDLERS
   =========================================================== */

document.getElementById("taskForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const idx = Number(document.getElementById("taskIndex").value);
    const title = document.getElementById("title").value.trim();
    const deadline = document.getElementById("deadline").value;
    const priority = document.getElementById("priority").value;
    const progress = Number(document.getElementById("progress").value);
    const notes = document.getElementById("notes").value.trim();

    if (!title) return alert("Judul tidak boleh kosong!");

    const newTask = new Task(title, deadline, priority, progress, notes);

    if (idx === -1) tasks.push(newTask);
    else tasks[idx] = newTask;

    saveToStorage();
    renderTasks();
    resetForm();
});

function editTask(i) {
    const t = tasks[i];
    document.getElementById("taskIndex").value = i;
    document.getElementById("title").value = t.getTitle();
    document.getElementById("deadline").value = t.getDeadline();
    document.getElementById("priority").value = t.getPriority();
    document.getElementById("progress").value = t.getProgress();
    document.getElementById("notes").value = t.getNotes();
}

function deleteTask(i) {
    if (confirm("Hapus tugas ini?")) {
        tasks.splice(i, 1);
        saveToStorage();
        renderTasks();
    }
}

function resetForm() {
    document.getElementById("taskIndex").value = -1;
    document.getElementById("title").value = "";
    document.getElementById("deadline").value = "";
    document.getElementById("priority").value = "High";
    document.getElementById("progress").value = 0;
    document.getElementById("notes").value = "";
}

/* ===========================================================
   QUOTE (RANDOM)
   =========================================================== */
const quotes = [
    "Sedikit tiap hari lebih baik daripada menunda.",
    "Kerjakan apa yang bisa kamu selesaikan hari ini.",
    "Progres kecil tetaplah progres.",
    "Fokus pada langkah, bukan jarak.",
    "Disiplin hari ini = kebebasan esok hari."
];

function setQuote() {
    document.getElementById("dailyQuote").textContent =
        quotes[Math.floor(Math.random() * quotes.length)];
}

/* ===========================================================
   CALENDAR RENDER
   =========================================================== */

function renderCalendar() {
    const now = new Date();
    const monthText = now.toLocaleString("id-ID", { month: "long", year: "numeric" });
    document.getElementById("monthLabel").textContent = monthText;

    const year = now.getFullYear();
    const month = now.getMonth();

    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();

    const box = document.getElementById("calendarDates");
    box.innerHTML = "";

    for (let i = 0; i < first; i++) {
        const b = document.createElement("button");
        b.style.visibility = "hidden";
        box.appendChild(b);
    }

    for (let d = 1; d <= total; d++) {
        const b = document.createElement("button");
        b.textContent = d;
        if (d === now.getDate()) b.classList.add("today");
        box.appendChild(b);
    }
}

/* ===========================================================
   INIT
   =========================================================== */
(function init() {
    loadFromStorage();
    renderCalendar();
    renderTasks();
    setQuote();
    document.getElementById("activity").textContent =
        "Aktif: " + new Date().toLocaleString("id-ID");
})();
// ==========================================
// TOMBOL CANCEL
// ==========================================
document.getElementById("btnCancel").addEventListener("click", function () {
    resetForm();                     // kosongkan form
    document.getElementById("title").focus(); // cursor kembali ke judul
});
