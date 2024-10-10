// const API_URL = 'http://localhost:3000'; // Updated to use regular HTTP

// let currentUser = null;

// // DOM Elements
// const authForms = document.getElementById('authForms');
// const signupForm = document.getElementById('signup');
// const signinForm = document.getElementById('signin');
// const dashboard = document.getElementById('dashboard');
// const userInfo = document.getElementById('userInfo');
// const applicationForm = document.getElementById('submitApplication');
// const applicationList = document.getElementById('applications');
// const signupBtn = document.getElementById('signupBtn');
// const signinBtn = document.getElementById('signinBtn');
// const dashboardBtn = document.getElementById('dashboardBtn');
// const logoutBtn = document.getElementById('logoutBtn');
// const recipientSelect = document.getElementById('recipient');
// const applicationTypeSelect = document.getElementById('applicationType');
// const applicationContent = document.getElementById('applicFationContent');

// // Event Listeners
// signupForm.addEventListener('submit', handleSignup);
// signinForm.addEventListener('submit', handleSignin);
// applicationForm.addEventListener('submit', handleApplicationSubmit);
// signupBtn.addEventListener('click', showSignupForm);
// signinBtn.addEventListener('click', showSigninForm);
// dashboardBtn.addEventListener('click', showDashboard);
// logoutBtn.addEventListener('click', handleLogout);
// applicationTypeSelect.addEventListener('change', updateApplicationTemplate);

// window.addEventListener('DOMContentLoaded', checkSession);

// // Check if the user is already logged in
// async function checkSession() {
//     try {
//         const response = await fetch(`${API_URL}/session`, {
//             method: 'GET',
//             credentials: 'include'
//         });

//         if (response.ok) {
//             currentUser = await response.json();
//             showDashboard(); // Automatically show the dashboard if logged in
//         } else {
//             showSigninForm(); // Show sign-in form if not logged in
//         }
//     } catch (error) {
//         console.error('Error checking session:', error);
//     }
// }

// async function handleSignup(e) {
//     e.preventDefault();
//     const formData = {
//         email: document.getElementById('signupEmail').value,
//         password: document.getElementById('signupPassword').value,
//         studentFacultyId: document.getElementById('signupId').value,
//         role: document.getElementById('signupRole').value
//     };

//     try {
//         const response = await fetch(`${API_URL}/register`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(formData),
//             credentials: 'include'
//         });

//         if (response.ok) {
//             alert('User registered successfully');
//             showSigninForm();
//         } else {
//             const data = await response.json();
//             alert(data.error || 'Error registering user');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred while registering');
//     }
// }

// async function handleSignin(e) {
//     e.preventDefault();
//     const formData = {
//         email: document.getElementById('signinEmail').value,
//         password: document.getElementById('signinPassword').value
//     };

//     try {
//         const response = await fetch(`${API_URL}/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(formData),
//             credentials: 'include'
//         });

//         if (response.ok) {
//             currentUser = await response.json();
//             console.log('Login successful:', currentUser); // Log success
//             showDashboard(); // Show dashboard after successful sign-in
//         } else {
//             const data = await response.json();
//             console.error('Login failed:', data); // Log failure
//             alert(data.error || 'Invalid credentials');
//         }
//     } catch (error) {
//         console.error('Error during login:', error); // Log any fetch errors
//         alert('An error occurred while signing in');
//     }
// }


// async function handleLogout() {
//     try {
//         const response = await fetch(`${API_URL}/logout`, {
//             method: 'POST',
//             credentials: 'include'
//         });

//         if (response.ok) {
//             currentUser = null;
//             showSigninForm();
//             signupBtn.style.display = 'inline-block';
//             signinBtn.style.display = 'inline-block';
//             dashboardBtn.style.display = 'none';
//             logoutBtn.style.display = 'none';
//         } else {
//             console.error('Error logging out');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred while logging out');
//     }
// }

// function showSignupForm() {
//     document.getElementById('signupForm').style.display = 'block';
//     document.getElementById('signinForm').style.display = 'none';
//     authForms.style.display = 'block';
//     dashboard.style.display = 'none';
// }

// function showSigninForm() {
//     document.getElementById('signupForm').style.display = 'none';
//     document.getElementById('signinForm').style.display = 'block';
//     authForms.style.display = 'block';
//     dashboard.style.display = 'none';
// }

// function showDashboard() {
//     authForms.style.display = 'none';
//     dashboard.style.display = 'block';
//     signupBtn.style.display = 'none';
//     signinBtn.style.display = 'none';
//     dashboardBtn.style.display = 'inline-block';
//     logoutBtn.style.display = 'inline-block';
//     updateUserInfo();
//     updateApplicationList();
//     updateRecipientList();
// }

// function updateUserInfo() {
//     userInfo.innerHTML = `
//         <p class="font-bold">Welcome, ${currentUser.email}</p>
//         <p>Role: ${currentUser.role}</p>
//         <p>ID: ${currentUser.studentFacultyId}</p>
//     `;
// }



const API_URL = 'http://localhost:3000';

let currentUser = null;

// DOM Elements
const authForms = document.getElementById('authForms');
const signupForm = document.getElementById('signup');
const signinForm = document.getElementById('signin');
const dashboard = document.getElementById('dashboard');
const userInfo = document.getElementById('userInfo');
const applicationForm = document.getElementById('submitApplication');
const applicationList = document.getElementById('applications');
const signupBtn = document.getElementById('signupBtn');
const signinBtn = document.getElementById('signinBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const logoutBtn = document.getElementById('logoutBtn');
const recipientSelect = document.getElementById('recipient');
const applicationTypeSelect = document.getElementById('applicationType');
const applicationContent = document.getElementById('applicationContent');

// Event Listeners
signupForm.addEventListener('submit', handleSignup);
signinForm.addEventListener('submit', handleSignin);
applicationForm.addEventListener('submit', handleApplicationSubmit);
signupBtn.addEventListener('click', showSignupForm);
signinBtn.addEventListener('click', showSigninForm);
dashboardBtn.addEventListener('click', showDashboard);
logoutBtn.addEventListener('click', handleLogout);
applicationTypeSelect.addEventListener('change', updateApplicationTemplate);

window.addEventListener('DOMContentLoaded', checkSession);

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

async function checkSession() {
    try {
        const response = await fetch(`${API_URL}/session`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            currentUser = await response.json();
            showDashboard();
        } else {
            showSigninForm();
        }
    } catch (error) {
        console.error('Error checking session:', error);
        showSigninForm();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const formData = {
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
        studentFacultyId: document.getElementById('signupId').value,
        role: document.getElementById('signupRole').value
    };

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            alert('User registered successfully. Please log in.');
            showSigninForm();
        } else {
            showError(data.error || 'Error registering user');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while registering');
    }
}

async function handleSignin(e) {
    e.preventDefault();
    const formData = {
        email: document.getElementById('signinEmail').value,
        password: document.getElementById('signinPassword').value
    };

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data;
            console.log('Login successful:', currentUser);
            showDashboard();
        } else {
            console.error('Login failed:', data);
            showError(data.error || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Error during login:', error);
        showError('An error occurred while signing in');
    }
}

async function handleLogout() {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            currentUser = null;
            showSigninForm();
        } else {
            console.error('Error logging out');
            showError('An error occurred while logging out');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while logging out');
    }
}

function showSignupForm() {
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('signinForm').style.display = 'none';
    authForms.style.display = 'block';
    dashboard.style.display = 'none';
}

function showSigninForm() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('signinForm').style.display = 'block';
    authForms.style.display = 'block';
    dashboard.style.display = 'none';
}

function showDashboard() {
    authForms.style.display = 'none';
    dashboard.style.display = 'block';
    signupBtn.style.display = 'none';
    signinBtn.style.display = 'none';
    dashboardBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'inline-block';
    updateUserInfo();
    updateApplicationList();
    updateRecipientList();
}

function updateUserInfo() {
    userInfo.innerHTML = `
        <p class="font-bold">Welcome, ${currentUser.email}</p>
        <p>Role: ${currentUser.role}</p>
        <p>ID: ${currentUser.studentFacultyId}</p>
    `;
}

// Placeholder functions for other features
function handleApplicationSubmit(e) {
    e.preventDefault();
    // Implement application submission logic
    console.log('Application submitted');
    showError('Application submission not yet implemented');
}

function updateApplicationList() {
    // Implement fetching and displaying user's applications
    console.log('Updating application list');
    applicationList.innerHTML = '<p>No applications found.</p>';
}

function updateRecipientList() {
    // Implement fetching and populating recipient list
    console.log('Updating recipient list');
    recipientSelect.innerHTML = '<option value="">Select a recipient</option>';
}

function updateApplicationTemplate() {
    // Implement updating application form based on selected type
    console.log('Updating application template');
    applicationContent.value = '';
}