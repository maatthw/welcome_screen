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
        // Edit existing technician
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
        // Add new technician
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
    
    ['technicianImage', 'cashappQR', 'venmoQR', 'zelleQR'].forEach(fieldId => {
        const infoElement = document.getElementById(`current${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
        const removeButton = document.getElementById(`remove${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
        infoElement.textContent = '';
        infoElement.classList.remove('has-image');
        removeButton.style.display = 'none';
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
        })
        .catch(error => console.error('Error fetching technician data for editing:', error));
}

function updateImageInfo(fieldId, imagePath) {
    const infoElement = document.getElementById(`current${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
    const removeButton = document.getElementById(`remove${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
    if (imagePath) {
        infoElement.textContent = "Image uploaded";
        infoElement.classList.add('has-image');
        removeButton.style.display = 'inline-block';
        currentImages[fieldId] = imagePath;
    } else {
        infoElement.textContent = "No image uploaded";
        infoElement.classList.remove('has-image');
        removeButton.style.display = 'none';
        currentImages[fieldId] = null;
    }
    document.getElementById(fieldId).value = ''; // Clear file input
}

function displayTechnicians() {
    fetch('/technicians')
        .then(response => response.json())
        .then(data => {
            // Sort technicians alphabetically by name
            const sortedTechnicians = data.technicians.sort((a, b) => 
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            );

            const technicianList = document.getElementById('technicianList');
            technicianList.innerHTML = '';  // Clear current list

            sortedTechnicians.forEach((technician) => {
                const technicianCard = document.createElement('div');
                technicianCard.className = 'technician-card';
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
    if (confirm('Are you sure you want to remove this technician?')) {
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

['technicianImage', 'cashappQR', 'venmoQR', 'zelleQR'].forEach(fieldId => {
    document.getElementById(`remove${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`).addEventListener('click', function() {
        updateImageInfo(fieldId, null);
    });
});

document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'tip-page.html';
});

document.getElementById('cancelBtn').addEventListener('click', resetForm);


displayTechnicians();