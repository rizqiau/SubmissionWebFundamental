// Data Dummy
const notesData = [
  {
    id: "notes-jT-jjsyz61J8XKiI",
    title: "Welcome to Notes, Dimas!",
    body: "Welcome to Notes! This is your first note. You can archive it, delete it, or create new ones.",
    createdAt: "2022-07-28T10:03:12.594Z",
    archived: false,
  },
  {
    id: "notes-aB-cdefg12345",
    title: "Meeting Agenda",
    body: "Discuss project updates and assign tasks for the upcoming week.",
    createdAt: "2022-08-05T15:30:00.000Z",
    archived: false,
  },
  {
    id: "notes-XyZ-789012345",
    title: "Shopping List",
    body: "Milk, eggs, bread, fruits, and vegetables.",
    createdAt: "2022-08-10T08:45:23.120Z",
    archived: false,
  },
  {
    id: "notes-1a-2b3c4d5e6f",
    title: "Personal Goals",
    body: "Read two books per month, exercise three times a week, learn a new language.",
    createdAt: "2022-08-15T18:12:55.789Z",
    archived: false,
  },
  {
    id: "notes-LMN-456789",
    title: "Recipe: Spaghetti Bolognese",
    body: "Ingredients: ground beef, tomatoes, onions, garlic, pasta. Steps:...",
    createdAt: "2022-08-20T12:30:40.200Z",
    archived: false,
  },
  {
    id: "notes-QwErTyUiOp",
    title: "Workout Routine",
    body: "Monday: Cardio, Tuesday: Upper body, Wednesday: Rest, Thursday: Lower body, Friday: Cardio.",
    createdAt: "2022-08-25T09:15:17.890Z",
    archived: false,
  },
  {
    id: "notes-abcdef-987654",
    title: "Book Recommendations",
    body: "1. 'The Alchemist' by Paulo Coelho\n2. '1984' by George Orwell\n3. 'To Kill a Mockingbird' by Harper Lee",
    createdAt: "2022-09-01T14:20:05.321Z",
    archived: false,
  },
  {
    id: "notes-zyxwv-54321",
    title: "Daily Reflections",
    body: "Write down three positive things that happened today and one thing to improve tomorrow.",
    createdAt: "2022-09-07T20:40:30.150Z",
    archived: false,
  },
  {
    id: "notes-poiuyt-987654",
    title: "Travel Bucket List",
    body: "1. Paris, France\n2. Kyoto, Japan\n3. Santorini, Greece\n4. New York City, USA",
    createdAt: "2022-09-15T11:55:44.678Z",
    archived: false,
  },
  {
    id: "notes-asdfgh-123456",
    title: "Coding Projects",
    body: "1. Build a personal website\n2. Create a mobile app\n3. Contribute to an open-source project",
    createdAt: "2022-09-20T17:10:12.987Z",
    archived: false,
  },
  {
    id: "notes-5678-abcd-efgh",
    title: "Project Deadline",
    body: "Complete project tasks by the deadline on October 1st.",
    createdAt: "2022-09-28T14:00:00.000Z",
    archived: false,
  },
  {
    id: "notes-9876-wxyz-1234",
    title: "Health Checkup",
    body: "Schedule a routine health checkup with the doctor.",
    createdAt: "2022-10-05T09:30:45.600Z",
    archived: false,
  },
  {
    id: "notes-qwerty-8765-4321",
    title: "Financial Goals",
    body: "1. Create a monthly budget\n2. Save 20% of income\n3. Invest in a retirement fund.",
    createdAt: "2022-10-12T12:15:30.890Z",
    archived: false,
  },
  {
    id: "notes-98765-54321-12345",
    title: "Holiday Plans",
    body: "Research and plan for the upcoming holiday destination.",
    createdAt: "2022-10-20T16:45:00.000Z",
    archived: false,
  },
  {
    id: "notes-1234-abcd-5678",
    title: "Language Learning",
    body: "Practice Spanish vocabulary for 30 minutes every day.",
    createdAt: "2022-10-28T08:00:20.120Z",
    archived: false,
  },
];

const formatDate = (isoString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(isoString).toLocaleDateString("en-US", options);
};

class AppBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
            <style>
                h1 {
                    margin: 0;
                    font-size: 1.8em;
                    text-align: center;
                    color: white; /* Defined in main style but good to have a fallback */
                }
            </style>
            <h1>Notes App</h1>
        `;
  }
}
customElements.define("app-bar", AppBar);

class NoteItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block; /* Make the custom element behave like a block */
                    background-color: var(--card-background, #ffffff);
                    border: 1px solid var(--border-color, #ddd);
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    transition: transform 0.2s ease;
                }
                :host(:hover) {
                    transform: translateY(-5px);
                }
                h3 {
                    margin-top: 0;
                    color: var(--secondary-color, #2196F3);
                    font-size: 1.4em;
                    margin-bottom: 10px;
                }
                p {
                    font-size: 0.95em;
                    color: #555;
                    margin-bottom: 15px;
                    white-space: pre-wrap;
                }
                .note-date {
                    font-size: 0.8em;
                    color: #888;
                    text-align: right;
                    margin-top: 10px;
                }
            </style>
            <h3></h3>
            <p></p>
            <div class="note-date"></div>
        `;
  }

  static get observedAttributes() {
    return ["note-title", "note-body", "note-createdat"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "note-title") {
      this.shadowRoot.querySelector("h3").textContent = newValue;
    } else if (name === "note-body") {
      this.shadowRoot.querySelector("p").textContent = newValue;
    } else if (name === "note-createdat") {
      this.shadowRoot.querySelector(".note-date").textContent =
        formatDate(newValue);
    }
  }

  set note(noteData) {
    this.setAttribute("note-title", noteData.title);
    this.setAttribute("note-body", noteData.body);
    this.setAttribute("note-createdat", noteData.createdAt);
  }
}
customElements.define("note-item", NoteItem);

class NoteForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
            <style>
                form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                label {
                    font-weight: 600;
                    margin-bottom: 5px;
                    display: block;
                    color: var(--text-color);
                }
                input[type="text"],
                textarea {
                    width: calc(100% - 20px);
                    padding: 10px;
                    border: 1px solid var(--border-color, #ddd);
                    border-radius: 5px;
                    font-size: 1em;
                    box-sizing: border-box;
                }
                textarea {
                    resize: vertical;
                    min-height: 100px;
                }
                button {
                    background-color: var(--primary-color, #4CAF50);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1.1em;
                    font-weight: 600;
                    transition: background-color 0.3s ease;
                }
                button:hover {
                    background-color: #45a049;
                }
                .error-message {
                    color: var(--error-color, #f44336);
                    font-size: 0.9em;
                    margin-top: 5px;
                    display: none; /* Hidden by default */
                }
                input:invalid:not(:placeholder-shown),
                textarea:invalid:not(:placeholder-shown) {
                    border-color: var(--error-color, #f44336);
                }
            </style>
            <form>
                <div>
                    <label for="noteTitle">Title:</label>
                    <input type="text" id="noteTitle" required minlength="3">
                    <div id="titleError" class="error-message">Title is required (min 3 characters).</div>
                </div>
                <div>
                    <label for="noteBody">Body:</label>
                    <textarea id="noteBody" required minlength="10"></textarea>
                    <div id="bodyError" class="error-message">Body is required (min 10 characters).</div>
                </div>
                <button type="submit">Add Note</button>
            </form>
        `;

    this.form = this.shadowRoot.querySelector("form");
    this.noteTitleInput = this.shadowRoot.querySelector("#noteTitle");
    this.noteBodyTextarea = this.shadowRoot.querySelector("#noteBody");
    this.titleError = this.shadowRoot.querySelector("#titleError");
    this.bodyError = this.shadowRoot.querySelector("#bodyError");

    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.noteTitleInput.addEventListener(
      "input",
      this.validateInput.bind(this, this.noteTitleInput, this.titleError)
    );
    this.noteBodyTextarea.addEventListener(
      "input",
      this.validateInput.bind(this, this.noteBodyTextarea, this.bodyError)
    );
  }

  validateInput(inputElement, errorElement) {
    if (inputElement.validity.valid) {
      errorElement.style.display = "none";
    } else {
      errorElement.style.display = "block";
      if (inputElement.validity.valueMissing) {
        errorElement.textContent =
          inputElement.id === "noteTitle"
            ? "Title cannot be empty."
            : "Body cannot be empty.";
      } else if (inputElement.validity.tooShort) {
        const minLength = inputElement.getAttribute("minlength");
        errorElement.textContent = `${
          inputElement.id === "noteTitle" ? "Title" : "Body"
        } must be at least ${minLength} characters long.`;
      }
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    this.validateInput(this.noteTitleInput, this.titleError);
    this.validateInput(this.noteBodyTextarea, this.bodyError);

    if (this.form.checkValidity()) {
      const newNote = {
        id: `notes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID unik
        title: this.noteTitleInput.value,
        body: this.noteBodyTextarea.value,
        createdAt: new Date().toISOString(),
        archived: false,
      };

      this.dispatchEvent(
        new CustomEvent("note-added", {
          detail: newNote,
          bubbles: true,
          composed: true,
        })
      );

      this.noteTitleInput.value = "";
      this.noteBodyTextarea.value = "";
      this.noteTitleInput.focus();
    } else {
      alert("Please fill in all required fields correctly.");
    }
  }
}
customElements.define("note-form", NoteForm);

document.addEventListener("DOMContentLoaded", () => {
  const notesListContainer = document.getElementById("notesList");
  let currentNotes = [...notesData];

  const renderNotes = (notesToRender) => {
    notesListContainer.innerHTML = "";
    notesToRender.forEach((note) => {
      const noteItemElement = document.createElement("note-item");
      noteItemElement.note = note;
      notesListContainer.appendChild(noteItemElement);
    });
  };

  renderNotes(currentNotes);

  document.addEventListener("note-added", (event) => {
    const newNote = event.detail;
    currentNotes.unshift(newNote);
    renderNotes(currentNotes);
    alert("Note added successfully!");
  });
});
