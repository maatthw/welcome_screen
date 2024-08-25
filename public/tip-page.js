
function generatePastelColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
}

function fetchTechnicians() {
    fetch('/technicians')
        .then(response => response.json())
        .then(data => {
            // Sort technicians alphabetically by name
            const sortedTechnicians = data.technicians.sort((a, b) => 
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            );
            displayTechnicians(sortedTechnicians);
        })
        .catch(error => console.error('Error fetching technicians:', error));
}

function displayTechnicians(technicians) {
    const technicianGrid = document.getElementById('technician-grid');
    technicianGrid.innerHTML = '';  // Clear current list

    technicians.forEach(technician => {
        const card = createTechnicianCard(technician);
        technicianGrid.appendChild(card);
    });
}

function createTechnicianCard(technician) {
    const card = document.createElement('div');
    card.className = 'technician-card';
    const imageUrl = technician.image || generatePastelColor();
    const imageStyle = technician.image ? `background-image: url('${imageUrl}')` : `background-color: ${imageUrl}`;
    card.innerHTML = `
        <div class="technician-image" style="${imageStyle}"></div>
        <div class="technician-info">
            <h2 class="technician-name">${technician.name}</h2>
            <button class="tip-button">Tip ${technician.name}</button>
        </div>
    `;
    card.querySelector('.tip-button').addEventListener('click', () => openModal(technician));
    return card;
}

function openModal(technician) {
    const modal = document.getElementById('tipModal');
    const modalTechnicianName = document.getElementById('modalTechnicianName');
    modalTechnicianName.textContent = `Tip ${technician.name}`;
    
    const qrContainer = document.querySelector('.qr-container');
    qrContainer.innerHTML = '';

    if (technician.cashapp_qr) {
        qrContainer.innerHTML += `
            <div class="qr-code">
                <img src="${technician.cashapp_qr}" alt="CashApp QR">
                <p>CashApp</p>
            </div>
        `;
    }
    if (technician.venmo_qr) {
        qrContainer.innerHTML += `
            <div class="qr-code">
                <img src="${technician.venmo_qr}" alt="Venmo QR">
                <p>Venmo</p>
            </div>
        `;
    }
    if (technician.zelle_qr) {
        qrContainer.innerHTML += `
            <div class="qr-code">
                <img src="${technician.zelle_qr}" alt="Zelle QR">
                <p>Zelle</p>
            </div>
        `;
    }

    modal.style.display = 'block';
}

function filterTechnicians(searchTerm) {
    const technicianCards = document.querySelectorAll('.technician-card');
    technicianCards.forEach(card => {
        const technicianName = card.querySelector('.technician-name').textContent.toLowerCase();
        if (technicianName.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

document.getElementById('settingsBtn').addEventListener('click', () => {
    window.location.href = 'admin-page.html';
});

document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

const closeBtn = document.getElementsByClassName('close')[0];
closeBtn.onclick = function() {
    modal.style.display = 'none';
};

window.onclick = function(event) {
    const modal = document.getElementById('tipModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

document.getElementById('searchInput').addEventListener('input', function(e) {
    filterTechnicians(e.target.value);
});

// Initial fetch of technicians
fetchTechnicians();