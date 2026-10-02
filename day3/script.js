let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" },
];


// 1. Search notes
function searchNotes(word) {
    return notes.filter(note =>
        note.text.toLowerCase().includes(word.toLowerCase())
    );
}

console.log(searchNotes("JavaScript"));
// Expected: [{ id: 4, text: "Revise JavaScript arrays", category: "study" }]

console.log(searchNotes("Python"));
// Expected: []


// 2. Find the longest note
function longestNote() {
    if (notes.length === 0) {
        return null;
    }

    let longest = notes[0];

    for (let note of notes) {
        if (note.text.length > longest.text.length) {
            longest = note;
        }
    }

    return longest;
}

console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

let savedNotes = notes;
notes = [];

console.log(longestNote());
// Expected: null

notes = savedNotes;


// 3. Count notes by category
function countByCategory() {
    let counts = {};

    for (let note of notes) {
        if (counts[note.category]) {
            counts[note.category]++;
        } else {
            counts[note.category] = 1;
        }
    }

    return counts;
}

console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

let savedNotesForCount = notes;
notes = [];

console.log(countByCategory());
// Expected: {}

notes = savedNotesForCount;


// 4. Get notes summary
function getSummary() {
    const counts = countByCategory();
    const total = notes.length;

    const noteWord = total === 1 ? "note" : "notes";

    return `${total} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}

console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."

let savedNotesForSummary = notes;

notes = [
    { id: 6, text: "Study JavaScript", category: "study" }
];

console.log(getSummary());
// Expected: "1 note: 0 personal, 0 work, 1 study."

notes = savedNotesForSummary;


// 5. Check for duplicate notes
function isDuplicate(text) {
    const searchText = text.trim().toLowerCase();

    return notes.some(note =>
        note.text.trim().toLowerCase() === searchText
    );
}

console.log(isDuplicate("Buy milk and bread"));
// Expected: true

console.log(isDuplicate("  BUY MILK AND BREAD  "));
// Expected: true

console.log(isDuplicate("Buy eggs"));
// Expected: false


// 6. Add a new note
function addNote(text, category) {
    const cleanText = text.trim();

    if (cleanText.length < 1 || cleanText.length > 200) {
        console.log("Note must be between 1 and 200 characters.");
        return false;
    }

    if (isDuplicate(cleanText)) {
        console.log("Note is a duplicate.");
        return false;
    }

    const validCategories = ["personal", "work", "study"];

    if (!validCategories.includes(category)) {
        console.log("Invalid category. Use personal, work or study.");
        return false;
    }

    const newId = notes.length > 0
        ? Math.max(...notes.map(note => note.id)) + 1
        : 1;

    notes.push({
        id: newId,
        text: cleanText,
        category: category
    });

    return true;
}

console.log(addNote("Learn JavaScript functions", "study"));
// Expected: true

console.log(addNote("  BUY MILK AND BREAD  ", "personal"));
// Expected: false

console.log(addNote("Go for a walk", "health"));
// Expected: false

console.log(addNote("", "personal"));
// Expected: false

