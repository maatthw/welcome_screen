let editMode = false;
let editingTechnicianId = null;
let currentImages = {};

document.getElementById('addTechnicianForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('technicianName').value);
    
    appendImageToFormData(formData, 'technicianImage');
    appendImageToFormData(formData, 'cashappQR');
    appendImageToFormData(formData, 'venmoQR');
    appendImageToFormData(formData, 'zelleQR');

    if (editMode) {
        fetch(`/technicians/${editingTechnicianId}`, {
            method: 'PUT',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Technician updated successfully');
            resetForm();
            displayTechnicians();
        })
        .catch(error => console.error('Error updating technician:', error));
    } else {
        fetch('/technicians', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Technician added successfully with ID:', data.technicianId);
            resetForm();
            displayTechnicians();
        })
        .catch(error => console.error('Error adding technician to the database:', error));
    }
});

function appendImageToFormData(formData, fieldId) {
    const fileInput = document.getElementById(fieldId);
    if (fileInput.files[0]) {
        formData.append(fieldId, fileInput.files[0]);
    } else if (currentImages[fieldId] === null) {
        formData.append(fieldId, 'remove');
    }
}

function resetForm() {
    editMode = false;
    editingTechnicianId = null;
    currentImages = {};
    document.getElementById('addTechnicianForm').reset();
    document.getElementById('submitBtn').textContent = "Add Technician";
    document.getElementById('formTitle').textContent = "Add New Technician";
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('editingModeIndicator').style.display = 'none';
    highlightEditingTechnician(null);

    ['technicianImage', 'cashappQR', 'venmoQR', 'zelleQR'].forEach(fieldId => {
        const infoElement = document.getElementById(`current${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
        const removeButton = document.getElementById(`remove${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
        infoElement.textContent = '';
        infoElement.classList.remove('has-image');
        removeButton.style.display = 'none';
        document.getElementById(`${fieldId}Preview`).style.display = 'none'; // Hide preview
    });
}

function editTechnician(id) {
    fetch(`/technicians/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const technician = data.technician;
            document.getElementById('technicianName').value = technician.name;
            updateImageInfo('technicianImage', technician.image);
            updateImageInfo('cashappQR', technician.cashapp_qr);
            updateImageInfo('venmoQR', technician.venmo_qr);
            updateImageInfo('zelleQR', technician.zelle_qr);
            editingTechnicianId = id;
            editMode = true;
            document.getElementById('submitBtn').textContent = "Update Technician";
            document.getElementById('formTitle').textContent = "Edit Technician";
            document.getElementById('cancelBtn').style.display = 'inline-block';
            document.getElementById('editingModeIndicator').style.display = 'block';
            highlightEditingTechnician(id);
        })
        .catch(error => console.error('Error fetching technician data for editing:', error));
}

function updateImageInfo(fieldId, imagePath) {
    const infoElement = document.getElementById(`current${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
    const removeButton = document.getElementById(`remove${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
    const previewElement = document.getElementById(`${fieldId}Preview`);
    
    if (imagePath) {
        infoElement.textContent = "Image uploaded";
        infoElement.classList.add('has-image');
        removeButton.style.display = 'inline-block';
        currentImages[fieldId] = imagePath;
        previewElement.src = `/${imagePath}`; // Correct path reference
        previewElement.style.display = 'block';
    } else {
        infoElement.textContent = "No image uploaded";
        infoElement.classList.remove('has-image');
        removeButton.style.display = 'none';
        currentImages[fieldId] = null;
        previewElement.style.display = 'none';
    }
    document.getElementById(fieldId).value = ''; // Clear file input
}

function displayTechnicians() {
    fetch('/technicians')
        .then(response => response.json())
        .then(data => {
            const sortedTechnicians = data.technicians.sort((a, b) => 
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            );

            const technicianList = document.getElementById('technicianList');
            technicianList.innerHTML = '';  // Clear current list

            sortedTechnicians.forEach((technician) => {
                const technicianCard = document.createElement('div');
                technicianCard.className = 'technician-card';
                technicianCard.dataset.id = technician.id;
                technicianCard.innerHTML = `
                    <p>${technician.name}</p>
                    <div class="button-group">
                        <button onclick="editTechnician(${technician.id})" class="btn btn-secondary">Edit</button>
                        <button onclick="removeTechnician(${technician.id})" class="btn btn-secondary">Remove</button>
                    </div>
                `;
                technicianList.appendChild(technicianCard);
            });
        })
        .catch(error => console.error('Error fetching technicians:', error));
}

function removeTechnician(id) {
    if (confirm('Are you sure you want to remove this technician? This action cannot be undone.')) {
        fetch(`/technicians/${id}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            displayTechnicians();
        })
        .catch(error => console.error('Error deleting technician:', error));
    }
}

function highlightEditingTechnician(id) {
    const cards = document.querySelectorAll('.technician-card');
    cards.forEach(card => {
        if (card.dataset.id == id) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

['technicianImage', 'cashappQR', 'venmoQR', 'zelleQR'].forEach(fieldId => {
    document.getElementById(`remove${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`).addEventListener('click', function() {
        updateImageInfo(fieldId, null);
    });
});

document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'tip-page.html';
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    resetForm();
    document.getElementById('editingModeIndicator').style.display = 'none';
    highlightEditingTechnician(null);
});

function previewImage(event, previewId) {
    const output = document.getElementById(previewId);
    output.src = URL.createObjectURL(event.target.files[0]);
    output.style.display = 'block';
    output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
    }
}

displayTechnicians();
