document.addEventListener('DOMContentLoaded', () => {
    const returningCustomerBtn = document.getElementById('returningCustomer');
    const newCustomerBtn = document.getElementById('newCustomer');
    const checkInForm = document.getElementById('checkInForm');
    const newCustomerFields = document.getElementById('newCustomerFields');
    const customerTypeSelection = document.getElementById('customerTypeSelection');
    const backBtn = document.getElementById('backBtn');

    returningCustomerBtn.addEventListener('click', () => {
        customerTypeSelection.style.display = 'none';
        checkInForm.style.display = 'flex';
        newCustomerFields.style.display = 'none';
    });

    newCustomerBtn.addEventListener('click', () => {
        customerTypeSelection.style.display = 'none';
        checkInForm.style.display = 'flex';
        newCustomerFields.style.display = 'block';
    });

    checkInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phoneNumber = document.getElementById('phoneNumber').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;

        console.log('Check-in data:', { phoneNumber, firstName, lastName, dateOfBirth });
        alert('Check-in successful!');
    });

    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});