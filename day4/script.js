const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

function updateCounts() {
    const text = noteText.value;
    const characters = text.length;

    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    charCount.textContent = `${characters} / 200 characters`;
    wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;

    charCount.classList.remove("warning", "over");

    if (characters > 200) {
        charCount.classList.add("over");
    } else if (characters > 180) {
        charCount.classList.add("warning");
    }
}

noteText.addEventListener("input", () => {
    updateCounts();
    localStorage.setItem("quicknotes-draft", noteText.value);

});

function clearNote() {
    noteText.value = "";
    updateCounts();
    localStorage.removeItem("quicknotes-draft");
}

clearBtn.addEventListener("click", clearNote);

noteText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearNote();
    }
});

const savedDraft = localStorage.getItem("quicknotes-draft");

if (savedDraft !== null) {
    noteText.value = savedDraft;
}

updateCounts();

const savedTheme = localStorage.getItem("quicknotes-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    if (isDark) {
        themeToggle.textContent = "Light mode";
        localStorage.setItem("quicknotes-theme", "dark");
    } else {
        themeToggle.textContent = "Dark mode";
        localStorage.setItem("quicknotes-theme", "light");
    }
});

