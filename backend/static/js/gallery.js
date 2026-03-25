import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import { db, storage } from "./firebase-config.js";

let galleryData = [];

function getEl(id) {
    return document.getElementById(id);
}

function renderGallery() {
    const container = getEl("galleryContainer");
    if (!container) return;

    if (!galleryData.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Gallery items found</h3>
                <p>Add your first gallery item.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = galleryData.map(item => `
        <div class="data-card">
            <img src="${item.imageUrl || ""}" alt="${item.title || "Gallery"}" class="gallery-image">
            <h3>${item.title || "No title"}</h3>
            <p><strong>Description:</strong> ${item.description || "-"}</p>
            <div class="card-actions">
                <button class="danger-btn delete-gallery" data-id="${item.id}" data-path="${item.storagePath || ""}">Delete</button>
            </div>
        </div>
    `).join("");

    container.querySelectorAll(".delete-gallery").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!confirm("Delete this gallery item?")) return;

            const id = btn.dataset.id;
            const path = btn.dataset.path;

            if (path) {
                await deleteObject(ref(storage, path));
            }

            await deleteDoc(doc(db, "gallery", id));
        });
    });
}

async function uploadGalleryItem() {
    const title = getEl("galleryTitle").value.trim();
    const description = getEl("galleryDescription").value.trim();
    const file = getEl("galleryFile").files[0];

    if (!title || !file) {
        alert("Title and image file are required.");
        return;
    }

    const fileName = `${Date.now()}-${file.name}`;
    const storagePath = `gallery/${fileName}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, "gallery"), {
        title,
        description,
        imageUrl,
        storagePath
    });

    getEl("galleryTitle").value = "";
    getEl("galleryDescription").value = "";
    getEl("galleryFile").value = "";
}

export function initGallery() {
    getEl("addGalleryBtn")?.addEventListener("click", uploadGalleryItem);

    onSnapshot(collection(db, "gallery"), (snapshot) => {
        galleryData = snapshot.docs.map(docItem => ({
            id: docItem.id,
            ...docItem.data()
        }));
        renderGallery();
    });
}