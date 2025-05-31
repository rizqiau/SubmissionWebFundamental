import Swal from "sweetalert2";
import "./style.css";

const API_BASE_URL = "https://notes-api.dicoding.dev/v2";

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
                    color: white;
                }
            </style>
            <h1>Notes App</h1>
        `;
  }
}
customElements.define("app-bar", AppBar);

class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        .loader {
          border: 8px solid #f3f3f3;
          border-top: 8px solid var(--primary-color, #4caf50);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        :host([hidden]) {
          display: none;
        }
      </style>
      <div class="loader"></div>
    `;
  }

  show() {
    this.removeAttribute("hidden");
  }

  hide() {
    this.setAttribute("hidden", "");
  }
}
customElements.define("loading-indicator", LoadingIndicator);

document.addEventListener("DOMContentLoaded", () => {
  const activeNotesListContainer = document.getElementById("notesList");
  const archivedNotesListContainer =
    document.getElementById("archivedNotesList");

  const activeNotesLoader = document.getElementById("activeNotesLoader");
  const archivedNotesLoader = document.getElementById("archivedNotesLoader");

  const renderNotesToContainer = (notesToRender, container, loader) => {
    if (!container) {
      console.error("Target container not found for rendering notes!");
      if (loader) loader.hide();
      return;
    }
    container.innerHTML = "";
    if (notesToRender.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; width: 100%;">No notes here.</p>';
    } else {
      notesToRender.forEach((note, index) => {
        const noteItemElement = document.createElement("note-item");
        noteItemElement.note = note;
        noteItemElement.classList.add("note-item-enter");
        container.appendChild(noteItemElement);
      });
    }
    if (loader) loader.hide();
  };

  const fetchAndRenderAllNotes = async () => {
    if (activeNotesLoader) activeNotesLoader.show();
    if (archivedNotesLoader) archivedNotesLoader.show();

    if (activeNotesListContainer) activeNotesListContainer.innerHTML = "";
    if (archivedNotesListContainer) archivedNotesListContainer.innerHTML = "";

    try {
      const activeNotesResponse = await fetch(`${API_BASE_URL}/notes`);
      const activeNotesJson = await activeNotesResponse.json();
      if (activeNotesJson.status === "success") {
        renderNotesToContainer(
          activeNotesJson.data,
          activeNotesListContainer,
          activeNotesLoader,
        );
      } else {
        console.error("Failed to fetch active notes:", activeNotesJson.message);
        if (activeNotesListContainer)
          activeNotesListContainer.innerHTML = `<p>Error: ${activeNotesJson.message}</p>`;
        if (activeNotesLoader) activeNotesLoader.hide();
      }

      const archivedNotesResponse = await fetch(
        `${API_BASE_URL}/notes/archived`,
      );
      const archivedNotesJson = await archivedNotesResponse.json();
      if (archivedNotesJson.status === "success") {
        renderNotesToContainer(
          archivedNotesJson.data,
          archivedNotesListContainer,
          archivedNotesLoader,
        );
      } else {
        console.error(
          "Failed to fetch archived notes:",
          archivedNotesJson.message,
        );
        if (archivedNotesListContainer)
          archivedNotesListContainer.innerHTML = `<p>Error: ${archivedNotesJson.message}</p>`;
        if (archivedNotesLoader) archivedNotesLoader.hide();
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      if (activeNotesListContainer)
        activeNotesListContainer.innerHTML = `<p>Error fetching notes. ${error.message}</p>`;
      if (archivedNotesListContainer)
        archivedNotesListContainer.innerHTML = `<p>Error fetching notes. ${error.message}</p>`;
      if (activeNotesLoader) activeNotesLoader.hide();
      if (archivedNotesLoader) archivedNotesLoader.hide();
      Swal.fire({
        title: "Error Fetching Data!",
        text: `Could not retrieve notes: ${error.message}. Please check your connection.`,
        icon: "error",
      });
    }
  };

  fetchAndRenderAllNotes();

  document.addEventListener("note-added", async (event) => {
    const newNoteData = event.detail;

    if (activeNotesLoader) activeNotesLoader.show();
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNoteData),
      });
      const responseJson = await response.json();
      if (responseJson.status === "success") {
        Swal.fire({
          title: "Success!",
          text: "Note added successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchAndRenderAllNotes();
      } else {
        Swal.fire({
          title: "Error!",
          text: `Error adding note: ${responseJson.message}`,
          icon: "error",
        });
        if (activeNotesLoader) activeNotesLoader.hide();
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Error adding note: ${error.message}`,
        icon: "error",
      });
      if (activeNotesLoader) activeNotesLoader.hide();
    }
  });

  document.addEventListener("delete-note", (event) => {
    const noteIdToDelete = event.detail.noteId;

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--primary-color, #4CAF50)",
      cancelButtonColor: "var(--error-color, #f44336)",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (activeNotesLoader) activeNotesLoader.show();
        try {
          const response = await fetch(
            `${API_BASE_URL}/notes/${noteIdToDelete}`,
            {
              method: "DELETE",
            },
          );
          const responseJson = await response.json();

          if (responseJson.status === "success") {
            Swal.fire({
              title: "Deleted!",
              text: "Your note has been deleted.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
            fetchAndRenderAllNotes();
          } else {
            Swal.fire({
              title: "Error!",
              text: `Error deleting note: ${responseJson.message}`,
              icon: "error",
            });
            if (activeNotesLoader) activeNotesLoader.hide();
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: `Error deleting note: ${error.message}`,
            icon: "error",
          });
          if (activeNotesLoader) activeNotesLoader.hide();
        }
      }
    });
  });

  document.addEventListener("toggle-archive-status", async (event) => {
    const { noteId, isArchived } = event.detail;
    const action = isArchived ? "unarchive" : "archive";
    const endpoint = `${API_BASE_URL}/notes/${noteId}/${action}`;

    if (activeNotesLoader) activeNotesLoader.show();
    if (archivedNotesLoader) archivedNotesLoader.show();

    try {
      const response = await fetch(endpoint, { method: "POST" });
      const responseJson = await response.json();

      if (responseJson.status === "success") {
        Swal.fire({
          title: "Success!",
          text: `Note ${action}d successfully!`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchAndRenderAllNotes();
      } else {
        alSwal.fire({
          title: "Error!",
          text: `Error ${action}ing note: ${responseJson.message}`,
          icon: "error",
        });
        if (activeNotesLoader) activeNotesLoader.hide();
        if (archivedNotesLoader) archivedNotesLoader.hide();
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: `Error ${action}ing note: ${error.message}`,
        icon: "error",
      });
      if (activeNotesLoader) activeNotesLoader.hide();
      if (archivedNotesLoader) archivedNotesLoader.hide();
    }
  });
});

class NoteItem extends HTMLElement {
  constructor() {
    super();
    this._noteData = {};
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
       
        :host {
            display: block;
            background-color: var(--card-background, #ffffff);
            border: 1px solid var(--border-color, #ddd);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transition: transform 0.2s ease;
            position: relative;
        }
        h3 { }
        p { }
        .note-date { margin-bottom: 15px; }

        .actions-container {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            justify-content: flex-end;
        }

        .action-button {
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.3s ease;
        }
        .delete-button {
            background-color: var(--error-color, #f44336);
        }
        .delete-button:hover {
            background-color: #d32f2f;
        }
        .archive-button {
            background-color: var(--secondary-color, #2196f3);
        }
        .archive-button:hover {
            background-color: #1976d2;
        }
      </style>
      <h3></h3>
      <p></p>
      <div class="note-date"></div>
      <div class="actions-container">
        <button class="archive-button action-button" aria-label="Toggle Archive Status"></button>
        <button class="delete-button action-button" aria-label="Delete Note">Delete</button>
      </div>
    `;

    this._deleteButton = this.shadowRoot.querySelector(".delete-button");
    this._archiveButton = this.shadowRoot.querySelector(".archive-button");

    this._deleteButton.addEventListener("click", () => {
      if (this._noteData.id) {
        this.dispatchEvent(
          new CustomEvent("delete-note", {
            detail: { noteId: this._noteData.id },
            bubbles: true,
            composed: true,
          }),
        );
      }
    });

    this._archiveButton.addEventListener("click", () => {
      if (this._noteData.id) {
        this.dispatchEvent(
          new CustomEvent("toggle-archive-status", {
            detail: {
              noteId: this._noteData.id,
              isArchived: this._noteData.archived,
            },
            bubbles: true,
            composed: true,
          }),
        );
      }
    });
  }

  set note(noteData) {
    this._noteData = noteData;
    this.shadowRoot.querySelector("h3").textContent = noteData.title;
    this.shadowRoot.querySelector("p").textContent = noteData.body;
    this.shadowRoot.querySelector(".note-date").textContent = formatDate(
      noteData.createdAt,
    );

    this._updateArchiveButton();
  }

  _updateArchiveButton() {
    if (this._archiveButton) {
      this._archiveButton.textContent = this._noteData.archived
        ? "Unarchive"
        : "Archive";
      this._archiveButton.setAttribute(
        "aria-label",
        this._noteData.archived ? "Unarchive Note" : "Archive Note",
      );
    }
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
                    display: none;
                }
                input:invalid:not(:placeholder-shown),
                textarea:invalid:not(:placeholder-shown) {
                    border-color: var(--error-color, #f44336);
                }
            </style>
            <form>
                <div>
                    <label for="noteTitle">Title:</label>
                    <input type="text" id="noteTitle" required minlength="3" placeholder="Enter note title...">
                    <div id="titleError" class="error-message">Title is required (min 3 characters).</div>
                </div>
                <div>
                    <label for="noteBody">Body:</label>
                    <textarea id="noteBody" required minlength="10" placeholder="Write your note here..."></textarea>
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
      this.validateInput.bind(this, this.noteTitleInput, this.titleError),
    );
    this.noteBodyTextarea.addEventListener(
      "input",
      this.validateInput.bind(this, this.noteBodyTextarea, this.bodyError),
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
      const noteData = {
        title: this.noteTitleInput.value,
        body: this.noteBodyTextarea.value,
      };

      this.dispatchEvent(
        new CustomEvent("note-added", {
          detail: noteData,
          bubbles: true,
          composed: true,
        }),
      );

      this.noteTitleInput.value = "";
      this.noteBodyTextarea.value = "";

      this.titleError.style.display = "none";
      this.bodyError.style.display = "none";
    } else {
    }
  }
}
customElements.define("note-form", NoteForm);
