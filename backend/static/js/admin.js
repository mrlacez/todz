import { db, auth, storage } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("admin.js loaded");

  const state = {
    bookings: [],
    customers: [],
    services: [],
    gallery: [],
    editing: {
      type: null,
      id: null,
      imagePath: null
    }
  };

  const els = {
    sidebar: document.getElementById("sidebar"),
    menuToggle: document.getElementById("menuToggle"),
    themeToggle: document.getElementById("themeToggle"),
    logoutBtn: document.getElementById("logoutBtn"),

    dashboardTotalBookings: document.getElementById("dashboardTotalBookings"),
    dashboardPendingBookings: document.getElementById("dashboardPendingBookings"),
    dashboardApprovedBookings: document.getElementById("dashboardApprovedBookings"),
    dashboardCompletedBookings: document.getElementById("dashboardCompletedBookings"),

    totalBookings: document.getElementById("totalBookings"),
    pendingBookings: document.getElementById("pendingBookings"),
    approvedBookings: document.getElementById("approvedBookings"),
    completedBookings: document.getElementById("completedBookings"),

    bookingSearch: document.getElementById("bookingSearch"),
    statusFilter: document.getElementById("statusFilter"),
    clearBookingSearch: document.getElementById("clearBookingSearch"),
    bookingsContainer: document.getElementById("bookingsContainer"),

    addCustomerBtn: document.getElementById("addCustomerBtn"),
    customerName: document.getElementById("customerName"),
    customerPhone: document.getElementById("customerPhone"),
    customerEmail: document.getElementById("customerEmail"),
    customerVehicle: document.getElementById("customerVehicle"),
    customerAddress: document.getElementById("customerAddress"),
    customersContainer: document.getElementById("customersContainer"),

    addServiceBtn: document.getElementById("addServiceBtn"),
    serviceName: document.getElementById("serviceName"),
    servicePrice: document.getElementById("servicePrice"),
    serviceDuration: document.getElementById("serviceDuration"),
    serviceDescription: document.getElementById("serviceDescription"),
    servicesContainer: document.getElementById("servicesContainer"),

    addGalleryBtn: document.getElementById("addGalleryBtn"),
    galleryTitle: document.getElementById("galleryTitle"),
    galleryFile: document.getElementById("galleryFile"),
    galleryDescription: document.getElementById("galleryDescription"),
    galleryContainer: document.getElementById("galleryContainer"),

    editModal: document.getElementById("editModal"),
    modalTitle: document.getElementById("modalTitle"),
    modalBody: document.getElementById("modalBody"),
    closeModalBtn: document.getElementById("closeModal"),
    saveModalBtn: document.getElementById("saveModalBtn")
  };

  setupAuthGuard();
  setupUI();
  initRealtimeFirestore();
  setupActions();

  function setupAuthGuard() {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/login";
      }
    });
  }

  function setupUI() {
    const menuLinks = document.querySelectorAll(".menu a[data-section]");
    const sections = document.querySelectorAll(".content-section");

    menuLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;

        sections.forEach((section) => section.classList.remove("active"));
        document.getElementById(sectionId)?.classList.add("active");

        document.querySelectorAll(".menu li").forEach((li) => li.classList.remove("active"));
        link.closest("li")?.classList.add("active");
      });
    });

    els.menuToggle?.addEventListener("click", () => {
      els.sidebar?.classList.toggle("collapsed");
    });

    els.themeToggle?.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
    });

    els.logoutBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "/login";
    });

    els.closeModalBtn?.addEventListener("click", closeModal);

    window.addEventListener("click", (e) => {
      if (e.target === els.editModal) {
        closeModal();
      }
    });
  }

  function setupActions() {
    els.clearBookingSearch?.addEventListener("click", () => {
      if (els.bookingSearch) els.bookingSearch.value = "";
      if (els.statusFilter) els.statusFilter.value = "";
      renderBookings();
    });

    els.bookingSearch?.addEventListener("input", renderBookings);
    els.statusFilter?.addEventListener("change", renderBookings);

    els.addCustomerBtn?.addEventListener("click", addCustomer);
    els.addServiceBtn?.addEventListener("click", addService);
    els.addGalleryBtn?.addEventListener("click", addGalleryItem);

    els.saveModalBtn?.addEventListener("click", saveModalChanges);
  }

  function initRealtimeFirestore() {
    onSnapshot(
      collection(db, "bookings"),
      (snapshot) => {
        state.bookings = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        state.bookings.sort((a, b) => {
          const aDate = a.createdAt?.seconds || 0;
          const bDate = b.createdAt?.seconds || 0;
          return bDate - aDate;
        });

        updateBookingStats();
        renderBookings();
      },
      (error) => {
        console.error("Bookings snapshot error:", error);
      }
    );

    onSnapshot(
      collection(db, "customers"),
      (snapshot) => {
        state.customers = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        console.log("Customers:", state.customers);
        renderCustomers(state.customers);
      },
      (error) => {
        console.error("Customers snapshot error:", error);
      }
    );

    onSnapshot(
      collection(db, "services"),
      (snapshot) => {
        state.services = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        console.log("Services:", state.services);
        renderServices(state.services);
      },
      (error) => {
        console.error("Services snapshot error:", error);
      }
    );

    onSnapshot(
      collection(db, "gallery"),
      (snapshot) => {
        state.gallery = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        renderGallery();
      },
      (error) => {
        console.error("Gallery snapshot error:", error);
      }
    );
  }

  function updateBookingStats() {
    const total = state.bookings.length;
    const pending = state.bookings.filter((item) => (item.status || "Pending") === "Pending").length;
    const approved = state.bookings.filter((item) => item.status === "Approved").length;
    const completed = state.bookings.filter((item) => item.status === "Completed").length;

    if (els.dashboardTotalBookings) els.dashboardTotalBookings.textContent = total;
    if (els.dashboardPendingBookings) els.dashboardPendingBookings.textContent = pending;
    if (els.dashboardApprovedBookings) els.dashboardApprovedBookings.textContent = approved;
    if (els.dashboardCompletedBookings) els.dashboardCompletedBookings.textContent = completed;

    if (els.totalBookings) els.totalBookings.textContent = total;
    if (els.pendingBookings) els.pendingBookings.textContent = pending;
    if (els.approvedBookings) els.approvedBookings.textContent = approved;
    if (els.completedBookings) els.completedBookings.textContent = completed;
  }

  function renderBookings() {
    if (!els.bookingsContainer) return;

    const searchValue = (els.bookingSearch?.value || "").toLowerCase().trim();
    const statusValue = (els.statusFilter?.value || "").trim();

    const filtered = state.bookings.filter((item) => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(searchValue) ||
        (item.phone || "").toLowerCase().includes(searchValue) ||
        (item.vehicle || "").toLowerCase().includes(searchValue) ||
        (item.service || "").toLowerCase().includes(searchValue) ||
        (item.message || "").toLowerCase().includes(searchValue);

      const matchesStatus = !statusValue || (item.status || "Pending") === statusValue;
      return matchesSearch && matchesStatus;
    });

    if (!filtered.length) {
      els.bookingsContainer.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">No bookings found.</td>
        </tr>
      `;
      return;
    }

    els.bookingsContainer.innerHTML = filtered
      .map((item) => {
        const safeMessage = escapeHtml(item.message || "-");
        const shortMessage =
          safeMessage.length > 60 ? `${safeMessage.substring(0, 60)}...` : safeMessage;

        return `
          <tr>
            <td data-label="Customer"><div class="table-name">${escapeHtml(item.name)}</div></td>
            <td data-label="Phone">${escapeHtml(item.phone)}</td>
            <td data-label="Vehicle">${escapeHtml(item.vehicle)}</td>
            <td data-label="Service">${escapeHtml(item.service)}</td>
            <td data-label="Date">${escapeHtml(item.date)}</td>
            <td data-label="Status">${getStatusBadge(item.status)}</td>
            <td data-label="Message" class="table-muted">${shortMessage}</td>
            <td>
              <div class="table-actions">
                <button class="btn-primary" data-action="edit-booking" data-id="${item.id}">Edit</button>
                <button class="status-btn approved" data-action="approve-booking" data-id="${item.id}">Approve</button>
                <button class="status-btn completed" data-action="complete-booking" data-id="${item.id}">Complete</button>
                <button class="btn-danger" data-action="delete-booking" data-id="${item.id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    bindDynamicButtons();
  }
  

  function renderCustomers(customers) {
    const container = document.getElementById("customersContainer");
    container.innerHTML = "";

    if (!customers || customers.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">No customers found.</td>
        </tr>
      `;
      return;
    }

    container.innerHTML = customers.map(c => `
      <tr class="table-row">
        <td data-label="Name" class="table-name">${escapeHtml(c.name)}</td>
        <td data-label="Phone">${escapeHtml(c.phone)}</td>
        <td data-label="Email">${escapeHtml(c.email)}</td>
        <td data-label="Vehicle"><span class="badge vehicle">${escapeHtml(c.vehicle)}</span></td>
        <td data-label="Address" class="table-muted">${escapeHtml(c.address)}</td>
        <td>
          <div class="action-group">
            <button class="action-btn edit" data-action="edit-customer" data-id="${c.id}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="action-btn delete" data-action="delete-customer" data-id="${c.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");

    bindDynamicButtons(); // IMPORTANT
  }

  function renderCustomer(customer, id) {
    return `
        <tr class="table-row">

            <td class="customer-cell">
                <strong>${customer.name}</strong>
            </td>

            <td>${customer.phone}</td>

            <td>${customer.email}</td>

            <td>
                <span class="badge vehicle">
                    ${customer.vehicle}
                </span>
            </td>

            <td class="message-cell">
                ${customer.address}
            </td>

            <td>
                <div class="action-group">

                    <button class="action-btn edit" data-id="${id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="action-btn delete" data-id="${id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>
            </td>

        </tr>
    `;
  }  

  function renderServices(services) {
    const container = document.getElementById("servicesContainer");
    container.innerHTML = "";

    if (!services || services.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">No services found.</td>
        </tr>
      `;
      return;
    }

    container.innerHTML = services.map(s => `
      <tr class="table-row">
        <td data-label="Service" class="table-name">${escapeHtml(s.name)}</td>
        <td data-label="Price">₱${escapeHtml(s.price)}</td>
        <td data-label="Duration">${escapeHtml(s.duration)}</td>
        <td data-label="Description" class="table-muted">${escapeHtml(s.description)}</td>
        <td>
          <div class="action-group">
            <button class="action-btn edit" data-action="edit-service" data-id="${s.id}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="action-btn delete" data-action="delete-service" data-id="${s.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");

    bindDynamicButtons();
  }

  function renderGallery() {
    if (!els.galleryContainer) return;

    if (!state.gallery.length) {
      els.galleryContainer.innerHTML = `<div class="empty-state">No gallery items found.</div>`;
      return;
    }

    els.galleryContainer.innerHTML = state.gallery
      .map(
        (item) => `
          <div class="card-item">
            ${
              item.imageUrl
                ? `<img src="${item.imageUrl}" alt="${escapeHtml(item.title || "Gallery Image")}" class="gallery-thumb">`
                : ""
            }
            <h3>${escapeHtml(item.title || "Untitled")}</h3>
            <p>${escapeHtml(item.description || "-")}</p>
            <div class="card-actions">
              <button class="primary-btn" data-action="edit-gallery" data-id="${item.id}">Edit</button>
              <button class="btn-danger" data-action="delete-gallery" data-id="${item.id}">Delete</button>
            </div>
          </div>
        `
      )
      .join("");

    bindDynamicButtons();
  }

  async function addCustomer() {
    try {
      await addDoc(collection(db, "customers"), {
        name: els.customerName?.value.trim() || "",
        phone: els.customerPhone?.value.trim() || "",
        email: els.customerEmail?.value.trim() || "",
        vehicle: els.customerVehicle?.value.trim() || "",
        address: els.customerAddress?.value.trim() || "",
        createdAt: serverTimestamp()
      });

      clearCustomerForm();
    } catch (error) {
      console.error("Add customer error:", error);
      alert("Failed to add customer.");
    }
  }

  async function addService() {
    try {
      await addDoc(collection(db, "services"), {
        name: els.serviceName?.value.trim() || "",
        price: els.servicePrice?.value.trim() || "",
        duration: els.serviceDuration?.value.trim() || "",
        description: els.serviceDescription?.value.trim() || "",
        createdAt: serverTimestamp()
      });

      clearServiceForm();
    } catch (error) {
      console.error("Add service error:", error);
      alert("Failed to add service.");
    }
  }

  async function addGalleryItem() {
    try {
      const title = els.galleryTitle?.value.trim() || "";
      const description = els.galleryDescription?.value.trim() || "";
      const file = els.galleryFile?.files?.[0];

      if (!file) {
        alert("Please choose an image.");
        return;
      }

      const filePath = `gallery/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "gallery"), {
        title,
        description,
        imageUrl,
        imagePath: filePath,
        createdAt: serverTimestamp()
      });

      clearGalleryForm();
    } catch (error) {
      console.error("Add gallery error:", error);
      alert("Failed to upload gallery item.");
    }
  }

  function bindDynamicButtons() {
    document.querySelectorAll("[data-action]").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        try {
          if (action === "approve-booking") {
            await updateDoc(doc(db, "bookings", id), { status: "Approved" });
          }

          if (action === "complete-booking") {
            await updateDoc(doc(db, "bookings", id), { status: "Completed" });
          }

          if (action === "delete-booking") {
            if (confirm("Delete this booking?")) {
              await deleteDoc(doc(db, "bookings", id));
            }
          }

          if (action === "delete-customer") {
            if (confirm("Delete this customer?")) {
              await deleteDoc(doc(db, "customers", id));
            }
          }

          if (action === "delete-service") {
            if (confirm("Delete this service?")) {
              await deleteDoc(doc(db, "services", id));
            }
          }

          if (action === "delete-gallery") {
            const item = state.gallery.find((x) => x.id === id);
            if (confirm("Delete this gallery item?")) {
              if (item?.imagePath) {
                try {
                  await deleteObject(ref(storage, item.imagePath));
                } catch (e) {
                  console.warn("Storage delete warning:", e);
                }
              }
              await deleteDoc(doc(db, "gallery", id));
            }
          }

          if (action === "edit-booking") openEditModal("booking", id);
          if (action === "edit-customer") openEditModal("customer", id);
          if (action === "edit-service") openEditModal("service", id);
          if (action === "edit-gallery") openEditModal("gallery", id);
        } catch (error) {
          console.error("Action error:", error);
          alert("Action failed.");
        }
      };
    });
  }

  function openEditModal(type, id) {
    state.editing.type = type;
    state.editing.id = id;
    state.editing.imagePath = null;

    let item;

    if (type === "booking") {
      item = state.bookings.find((x) => x.id === id);
      els.modalTitle.textContent = "Edit Booking";
      els.modalBody.innerHTML = `
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name</label>
            <input id="modalName" value="${escapeAttr(item?.name || "")}" placeholder="Name">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input id="modalPhone" value="${escapeAttr(item?.phone || "")}" placeholder="Phone">
          </div>
          <div class="form-group">
            <label>Vehicle</label>
            <input id="modalVehicle" value="${escapeAttr(item?.vehicle || "")}" placeholder="Vehicle">
          </div>
          <div class="form-group">
            <label>Service</label>
            <input id="modalService" value="${escapeAttr(item?.service || "")}" placeholder="Service">
          </div>
          <div class="form-group">
            <label>Date</label>
            <input id="modalDate" type="date" value="${escapeAttr(item?.date || "")}">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="modalStatus">
              <option value="Pending" ${item?.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Approved" ${item?.status === "Approved" ? "selected" : ""}>Approved</option>
              <option value="Completed" ${item?.status === "Completed" ? "selected" : ""}>Completed</option>
              <option value="Cancelled" ${item?.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label>Message</label>
            <textarea id="modalMessage" placeholder="Message">${escapeHtml(item?.message || "")}</textarea>
          </div>
        </div>
      `;
    }

    if (type === "customer") {
      item = state.customers.find((x) => x.id === id);
      els.modalTitle.textContent = "Edit Customer";
      els.modalBody.innerHTML = `
        <input id="modalName" value="${escapeAttr(item?.name || "")}" placeholder="Name">
        <input id="modalPhone" value="${escapeAttr(item?.phone || "")}" placeholder="Phone">
        <input id="modalEmail" value="${escapeAttr(item?.email || "")}" placeholder="Email">
        <input id="modalVehicle" value="${escapeAttr(item?.vehicle || "")}" placeholder="Vehicle">
        <textarea id="modalAddress" placeholder="Address">${escapeHtml(item?.address || "")}</textarea>
      `;
    }

    if (type === "service") {
      item = state.services.find((x) => x.id === id);
      els.modalTitle.textContent = "Edit Service";
      els.modalBody.innerHTML = `
        <input id="modalName" value="${escapeAttr(item?.name || "")}" placeholder="Service name">
        <input id="modalPrice" value="${escapeAttr(item?.price || "")}" placeholder="Price">
        <input id="modalDuration" value="${escapeAttr(item?.duration || "")}" placeholder="Duration">
        <textarea id="modalDescription" placeholder="Description">${escapeHtml(item?.description || "")}</textarea>
      `;
    }

    if (type === "gallery") {
      item = state.gallery.find((x) => x.id === id);
      state.editing.imagePath = item?.imagePath || null;
      els.modalTitle.textContent = "Edit Gallery";
      els.modalBody.innerHTML = `
        <input id="modalTitleInput" value="${escapeAttr(item?.title || "")}" placeholder="Title">
        <textarea id="modalDescription" placeholder="Description">${escapeHtml(item?.description || "")}</textarea>
        <input id="modalGalleryFile" type="file" accept="image/*">
        ${item?.imageUrl ? `<img src="${item.imageUrl}" class="gallery-thumb" alt="preview">` : ""}
      `;
    }

    els.editModal?.classList.add("show");
  }

  async function saveModalChanges() {
    console.log("Editing state:", state.editing);
    const { type, id, imagePath } = state.editing;
    if (!type || !id) return;

    try {
      if (type === "booking") {
        await updateDoc(doc(db, "bookings", id), {
          name: document.getElementById("modalName")?.value.trim() || "",
          phone: document.getElementById("modalPhone")?.value.trim() || "",
          vehicle: document.getElementById("modalVehicle")?.value.trim() || "",
          service: document.getElementById("modalService")?.value.trim() || "",
          date: document.getElementById("modalDate")?.value || "",
          status: document.getElementById("modalStatus")?.value || "Pending",
          message: document.getElementById("modalMessage")?.value.trim() || ""
        });
      }

      if (type === "customer") {
        await updateDoc(doc(db, "customers", id), {
          name: document.getElementById("modalName")?.value.trim() || "",
          phone: document.getElementById("modalPhone")?.value.trim() || "",
          email: document.getElementById("modalEmail")?.value.trim() || "",
          vehicle: document.getElementById("modalVehicle")?.value.trim() || "",
          address: document.getElementById("modalAddress")?.value.trim() || ""
        });
      }

      if (type === "service") {
        await updateDoc(doc(db, "services", id), {
          name: document.getElementById("modalName")?.value.trim() || "",
          price: document.getElementById("modalPrice")?.value.trim() || "",
          duration: document.getElementById("modalDuration")?.value.trim() || "",
          description: document.getElementById("modalDescription")?.value.trim() || ""
        });
      }

      if (type === "gallery") {
        const title = document.getElementById("modalTitleInput")?.value.trim() || "";
        const description = document.getElementById("modalDescription")?.value.trim() || "";
        const newFile = document.getElementById("modalGalleryFile")?.files?.[0];

        let imageUrl;
        let newImagePath = imagePath;

        if (newFile) {
          if (imagePath) {
            try {
              await deleteObject(ref(storage, imagePath));
            } catch (e) {
              console.warn("Old image delete warning:", e);
            }
          }

          newImagePath = `gallery/${Date.now()}_${newFile.name}`;
          const storageRef = ref(storage, newImagePath);
          await uploadBytes(storageRef, newFile);
          imageUrl = await getDownloadURL(storageRef);
        }

        const payload = { title, description };
        if (imageUrl) {
          payload.imageUrl = imageUrl;
          payload.imagePath = newImagePath;
        }

        await updateDoc(doc(db, "gallery", id), payload);
      }

      closeModal();
    } catch (error) {
      console.error("Save modal error:", error);
      alert("Failed to save changes.");
    }
  }

  function closeModal() {
    if (els.editModal) {
      els.editModal.classList.remove("show");
      els.editModal.style.display = "";
    }
    state.editing = { type: null, id: null, imagePath: null };
  }

  function clearCustomerForm() {
    if (els.customerName) els.customerName.value = "";
    if (els.customerPhone) els.customerPhone.value = "";
    if (els.customerEmail) els.customerEmail.value = "";
    if (els.customerVehicle) els.customerVehicle.value = "";
    if (els.customerAddress) els.customerAddress.value = "";
  }

  function clearServiceForm() {
    if (els.serviceName) els.serviceName.value = "";
    if (els.servicePrice) els.servicePrice.value = "";
    if (els.serviceDuration) els.serviceDuration.value = "";
    if (els.serviceDescription) els.serviceDescription.value = "";
  }

  function clearGalleryForm() {
    if (els.galleryTitle) els.galleryTitle.value = "";
    if (els.galleryDescription) els.galleryDescription.value = "";
    if (els.galleryFile) els.galleryFile.value = "";
  }

  function getStatusBadge(status) {
    const normalized = (status || "Pending").toLowerCase();

    if (normalized === "approved") {
      return `<span class="badge approved">Approved</span>`;
    }

    if (normalized === "completed") {
      return `<span class="badge completed">Completed</span>`;
    }

    if (normalized === "cancelled") {
      return `<span class="badge cancelled">Cancelled</span>`;
    }

    return `<span class="badge pending">Pending</span>`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }








const toggleBtn = document.getElementById("menuToggle");
const menuLinks = document.querySelectorAll(".menu a");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const main = document.querySelector(".main");


toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
  main.classList.toggle("shift");
});




menuLinks.forEach(link => {
  link.addEventListener("click", () => {

    // ONLY for mobile
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
      main.classList.remove("shift");
    }

  });
});



window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    main.classList.remove("shift");
  }
});




overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  main.classList.remove("shift");
});






// LOAD SAVED THEME
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
}

// TOGGLE
els.themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  if (document.body.classList.contains("dark-theme")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});






onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  // 🔥 ADD THIS
  if (user.email == "sjun8855@email.com") {
    alert("Access denied");
    window.location.href = "/";
  }
});








const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("previewImage");

imageInput?.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
    }
});





document.querySelectorAll(".edit-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.id;

    // 🔥 FORCE SET
    state.editing.type = "gallery";
    state.editing.id = id;

    // OPTIONAL: if not using Firebase gallery list
    state.editing.imagePath = null;

    openEditModal("gallery", id);
  });
});




});