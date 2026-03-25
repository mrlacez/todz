setInterval(loadBookings, 5000);


if(window.location.pathname.includes("admin.html")){

let loggedIn = sessionStorage.getItem("adminLoggedIn")

if(loggedIn !== "true"){

alert("Please login first")

window.location.href = "login.html"

}

}

//===========================================================================================


//================================================================================
document.getElementById("bookingForm").addEventListener("submit", function(e){

e.preventDefault()

let booking = {
name: document.getElementById("name").value,
phone: document.getElementById("phone").value,
vehicle: document.getElementById("vehicle").value,
service: document.getElementById("service").value,
date: document.getElementById("date").value,
message: document.getElementById("message").value
}

fetch("http://127.0.0.1:5000/book",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(booking)
})
.then(res => res.json())
.then(data => {
console.log(data)

if(data.status === "success"){
alert("Booking Successful")

document.getElementById("bookingForm").reset()
}else{
alert("Booking failed")
}
})

})




//==========================================================
function loadBookings(){

fetch("http://127.0.0.1:5000/bookings")

.then(res => res.json())

.then(data => {

let table = document.getElementById("bookingTable")

table.innerHTML=""

document.getElementById("totalBookings").innerText = data.length

data.forEach(b => {

let row = `<tr>

<td>${b.name}</td>
<td>${b.vehicle}</td>
<td>${b.service}</td>
<td>${b.date}</td>

</tr>`

table.innerHTML += row

})

})

}


// CONTACT =============================================================================
const contactForm = document.getElementById("contactForm")

if(contactForm){

contactForm.addEventListener("submit", function(e){

e.preventDefault()

let message = {

name: document.getElementById("contactName").value,
email: document.getElementById("contactEmail").value,
message: document.getElementById("contactMessage").value

}

fetch("http://127.0.0.1:5000/contact",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(message)

})

.then(res=>res.json())

.then(data=>{
alert("Message sent successfully!")
})

})

}


//=========================================================================================
function showPage(page){

document.querySelectorAll("main section").forEach(section=>{
section.style.display="none"
})

let target = document.getElementById(page)

if(target){
target.style.display="block"
}

}

if(document.getElementById("dashboard")){
showPage("dashboard")
}

//=====================================================================================
function filterGallery(category){

let items = document.querySelectorAll(".gallery-item")

items.forEach(item=>{

if(category === "all"){
item.style.display="block"
}
else if(item.classList.contains(category)){
item.style.display="block"
}
else{
item.style.display="none"
}

})

}


function openModal(src){

document.getElementById("imageModal").style.display="flex"
document.getElementById("modalImg").src = src

}

function closeModal(){

document.getElementById("imageModal").style.display="none"

}


//=====================================================================
function bookService(){
    window.location.href = "booking.html"
}


//=================================================================
function logout(){

localStorage.removeItem("adminToken")
window.location="login.html"

}




/* MOBILE ====================================================================*/
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", function(e){
touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", function(e){
touchEndX = e.changedTouches[0].screenX;
handleSwipe();
});

function handleSwipe(){

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

if(touchEndX - touchStartX > 100){
sidebar.classList.add("active");
overlay.classList.add("active");
}

if(touchStartX - touchEndX > 100){
sidebar.classList.remove("active");
overlay.classList.remove("active");
}

}

/*  =================================================================================*/
function clearCustomerSearch(){
document.getElementById("customerSearch").value="";
}


function viewCustomer(name, phone, vehicle, bookings){

document.getElementById("cName").textContent = name;
document.getElementById("cPhone").textContent = phone;
document.getElementById("cVehicle").textContent = vehicle;
document.getElementById("cBookings").textContent = bookings;

document.getElementById("customerModal").style.display = "flex";

}

function closeCustomer(){
document.getElementById("customerModal").style.display = "none";
}


/* BOOKING MANAGER ===================================================================================*/
function viewBooking(name, phone, vehicle, service, date, status){

document.getElementById("bName").textContent = name;
document.getElementById("bPhone").textContent = phone;
document.getElementById("bVehicle").textContent = vehicle;
document.getElementById("bService").textContent = service;
document.getElementById("bDate").textContent = date;
document.getElementById("bStatus").textContent = status;

document.getElementById("bookingModal").style.display = "flex";

}

function closeBooking(){
document.getElementById("bookingModal").style.display = "none";
}

/*=================================================================================*/
document.addEventListener("DOMContentLoaded", function(){

const calendarEl = document.getElementById("calendar");

const calendar = new FullCalendar.Calendar(calendarEl, {

initialView: "dayGridMonth",

height: 650,

events: [
{
title: "Scratch Repair",
start: "2026-03-20"
},
{
title: "Full Repaint",
start: "2026-03-19"
}
]

});

calendar.render();

});



function saveBooking(){

var name = document.getElementById("bookingName").value;
var vehicle = document.getElementById("bookingVehicle").value;
var service = document.getElementById("bookingService").value;
var date = document.getElementById("bookingDate").value;

calendar.addEvent({
title: service + " - " + vehicle,
start: date,
color:"#f1c40f"
});

closeAddBooking();

}

function closeAddBooking(){
document.getElementById("addBookingModal").style.display = "none";
}


/* ===============================================================================*/
const ctx = document.getElementById('bookingChart');

new Chart(ctx, {
type: 'bar',
data: {
labels: ['Mon','Tue','Wed','Thu','Fri','Sat'],
datasets: [{
label: 'Bookings',
data: [2,3,1,4,2,5],
backgroundColor:'#3498db'
}]
}
});