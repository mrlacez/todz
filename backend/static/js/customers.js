import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";

let customersData = [];

function getEl(id) {
    return document.getElementById(id);
}

function renderCustomers() {
    const container = getEl("customersContainer");
    if (!container) return;

    if (!customersData.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Customers found</h3>
                <p>Add your first customer.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = customersData.map(item => `
        <div class="data-card">
            <h3>${item.name || "No name"}</h3>
            <p><strong>Phone:</strong> ${item.phone || "-"}</p>
            <p><strong>Email:</strong> ${item.email || "-"}</p>
            <p><strong>Vehicle:</strong> ${item.vehicle || "-"}</p>
            <p><strong>Address:</strong> ${item.address || "-"}</p>

            <div class="card-actions">
                <button class="secondary-btn edit-customer" data-id="${item.id}">Edit</button>
                <button class="danger-btn delete-customer" data-id="${item.id}">Delete</button>
            </div>
        </div>
    `).join("");

    container.querySelectorAll(".delete-customer").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!confirm("Delete this customer?")) return;
            await deleteDoc(doc(db, "customers", btn.dataset.id));
        });
    });

    container.querySelectorAll(".edit-customer").forEach(btn => {
        btn.addEventListener("click", async () => {
            const item = customersData.find(c => c.id === btn.dataset.id);
            if (!item) return;

            const name = prompt("Customer name:", item.name || "");
            const phone = prompt("Phone:", item.phone || "");
            const email = prompt("Email:", item.email || "");
            const vehicle = prompt("Vehicle:", item.vehicle || "");
            const address = prompt("Address:", item.address || "");

            await updateDoc(doc(db, "customers", item.id), {
                name, phone, email, vehicle, address
            });
        });
    });
}

export function initCustomers() {
    getEl("addCustomerBtn")?.addEventListener("click", async () => {
        const payload = {
            name: getEl("customerName").value.trim(),
            phone: getEl("customerPhone").value.trim(),
            email: getEl("customerEmail").value.trim(),
            vehicle: getEl("customerVehicle").value.trim(),
            address: getEl("customerAddress").value.trim()
        };

        if (!payload.name || !payload.phone) {
            alert("Customer name and phone are required.");
            return;
        }

        await addDoc(collection(db, "customers"), payload);

        getEl("customerName").value = "";
        getEl("customerPhone").value = "";
        getEl("customerEmail").value = "";
        getEl("customerVehicle").value = "";
        getEl("customerAddress").value = "";
    });

    onSnapshot(collection(db, "customers"), (snapshot) => {
        customersData = snapshot.docs.map(docItem => ({
            id: docItem.id,
            ...docItem.data()
        }));
        renderCustomers();
    });
}