const technicians = [
    { name: "John Doe", image: "https://picsum.photos/seed/john/200" },
    { name: "Jane Smith", image: "https://picsum.photos/seed/jane/200" },
    { name: "Mike Johnson", image: "https://picsum.photos/seed/mike/200" },
    { name: "Emily Brown", image: "https://picsum.photos/seed/emily/200" },
    { name: "Chris Lee", image: "https://picsum.photos/seed/chris/200" },
    { name: "Sarah Davis", image: "https://picsum.photos/seed/sarah/200" },
];

const technicianGrid = document.getElementById('technician-grid');
const modal = document.getElementById('tipModal');
const closeBtn = document.getElementsByClassName('close')[0];
const modalTechnicianName = document.getElementById('modalTechnicianName');

function createTechnicianCard(technician) {
    const card = document.createElement('div');
    card.className = 'technician-card';
    card.innerHTML = `
        <img src="${technician.image}" alt="${technician.name}">
        <div class="technician-info">
            <h2 class="technician-name">${technician.name}</h2>
            <button class="tip-button">Tip ${technician.name}</button>
        </div>
    `;
    card.querySelector('.tip-button').addEventListener('click', () => openModal(technician.name));
    return card;
}

function displayTechnicians() {
    technicianGrid.innerHTML = '';
    technicians.forEach(technician => {
        technicianGrid.appendChild(createTechnicianCard(technician));
    });
}

function openModal(technicianName) {
    modalTechnicianName.textContent = `Tip ${technicianName}`;
    modal.style.display = 'block';
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

function filterTechnicians(searchTerm) {
    return technicians.filter(technician => 
        technician.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    const filteredTechnicians = filterTechnicians(searchTerm);
    displayTechnicians(filteredTechnicians);
});

displayTechnicians();