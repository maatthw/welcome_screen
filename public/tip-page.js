function generatePastelColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
}

function fetchTechnicians() {
    fetch('/technicians')
        .then(response => response.json())
        .then(data => {
            const sortedTechnicians = data.technicians.sort((a, b) => 
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            );
            displayTechnicians(sortedTechnicians);
        })
        .catch(error => console.error('Error fetching technicians:', error));
}

function displayTechnicians(technicians) {
    const technicianGrid = document.getElementById('technician-grid');
    technicianGrid.innerHTML = ''; 

    technicians.forEach(technician => {
        const card = createTechnicianCard(technician);
        technicianGrid.appendChild(card);
    });
}

function createTechnicianCard(technician) {
    const card = document.createElement('div');
    card.className = 'technician-card';

    const imageUrl = technician.image ? `${technician.image}` : generatePastelColor();
    console.log(`Constructed image URL: ${imageUrl}`);

    const imageStyle = technician.image ? `background-image: url('${imageUrl}'); background-size: cover;` : `background-color: ${imageUrl};`;
    
    card.innerHTML = `
        <div class="technician-image" style="${imageStyle}"></div>
        <div class="technician-info">
            <h2 class="technician-name">${technician.name}</h2>
        </div>
    `;

    card.addEventListener('click', () => openModal(technician));

    return card;
}

function openModal(technician) {
    const modal = document.getElementById('tipModal');
    const modalTechnicianName = document.getElementById('modalTechnicianName');
    const tipLine = document.getElementById('tap-tech');

    tipLine.style.display = 'none';
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

    modal.style.display = 'flex';
}

function filterTechnicians(searchTerm) {
    const technicianCards = document.querySelectorAll('.technician-card');
    technicianCards.forEach(card => {
        const technicianName = card.querySelector('.technician-name').textContent.toLowerCase();
        if (technicianName.startsWith(searchTerm.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

document.getElementById('settingsBtn').addEventListener('click', (event) => {
    event.preventDefault(); 
    openKeypadModal(); 
});

function openKeypadModal() {
    const modal = document.getElementById('keypadModal');
    modal.style.display = 'flex';  // Show the modal
}

function closeKeypadModal() {
    const modal = document.getElementById('keypadModal');
    modal.style.display = 'none';  // Hide the modal
}

function closeModal() {
    const modal = document.getElementById('tipModal');
    const tipLine = document.getElementById('tap-tech');
    modal.style.display = 'none';
    tipLine.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('tipModal');
    const closeBtn = document.querySelector('.close');

    // Ensure the modal is hidden by default
    modal.style.display = 'none';

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    fetchTechnicians();
});

function createKeypad() {
    const keypad = document.getElementById('keypad');
    keypad.innerHTML = '';  // Clear existing buttons

    for (let i = 0; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'keypad-btn';
        btn.addEventListener('click', () => addDigitToCode(i));
        keypad.appendChild(btn);
    }
}

function addDigitToCode(digit) {
    const accessCodeInput = document.getElementById('accessCode');
    if (accessCodeInput.value.length < 4) {
        accessCodeInput.value += digit;  // Append digit to access code
    }
}

function clearCode() {
    document.getElementById('accessCode').value = '';
}

document.getElementById('clearCodeBtn').addEventListener('click', clearCode);

function verifyAccessCode(code) {
    fetch('/verify-access-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'admin-page.html';  // Redirect if code is correct
        } else {
            alert('Incorrect code. Please try again.');
            clearCode();  // Clear the input if the code is wrong
        }
    })
    .catch(error => console.error('Error verifying access code:', error));
}

document.getElementById('enterCodeBtn').addEventListener('click', () => {
    const accessCode = document.getElementById('accessCode').value;
    if (accessCode.length === 4) {
        verifyAccessCode(accessCode);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    createKeypad();
    closeKeypadModal(); 
});

window.onclick = function(event) {
    const modal = document.getElementById('keypadModal');
    if (event.target === modal) {
        closeKeypadModal();
    }
};

fetchTechnicians();