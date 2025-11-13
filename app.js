// app.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, deleteDoc,
  doc, updateDoc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* -----------------------
  PLACEHOLDER: Firebase config
  You MUST replace the object below with your project's config
  (get it from Firebase Console -> Project settings -> SDK setup)
------------------------*/
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "FIREBASE_MSG_SENDER_ID",
  appId: "FIREBASE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksCol = collection(db, "tasks");

// UI refs
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// Add task
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  await addDoc(tasksCol, {
    text,
    completed: false,
    createdAt: serverTimestamp()
  });
  taskInput.value = "";
});

// Real-time listener (ordered by createdAt)
const q = query(tasksCol, orderBy("createdAt"));
onSnapshot(q, (snapshot) => {
  taskList.innerHTML = "";
  snapshot.forEach(docSnap => {
    const id = docSnap.id;
    const data = docSnap.data();
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.alignItems = "center";

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = !!data.completed;
    toggle.addEventListener("change", async () => {
      await updateDoc(doc(db, "tasks", id), { completed: toggle.checked });
    });

    const span = document.createElement("span");
    span.className = "taskText" + (data.completed ? " completed" : "");
    span.textContent = data.text;

    left.appendChild(toggle);
    left.appendChild(span);

    const actions = document.createElement("div");
    actions.className = "actions";

    const del = document.createElement("button");
    del.className = "smallBtn";
    del.textContent = "Delete";
    del.addEventListener("click", async () => {
      await deleteDoc(doc(db, "tasks", id));
    });

    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
});
