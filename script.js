const API_URL = 'https://localhost:3000';

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
dashboardBtn.addEventListener('click', 

 showDashboard);
logoutBtn.addEventListener('click', handleLogout);
applicationTypeSelect.addEventListener('change', updateApplicationTemplate);

async function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const studentFacultyId = document.getElementById('signupId').value;
    const role = document.getElementById('signupRole').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role, studentFacultyId })
        });

        if (response.ok) {
            alert('User registered successfully');
            showSigninForm();
        } else {
            const data = await response.json();
            alert(data.error || 'Error registering user');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while registering');
    }
}

async function handleSignin(e) {
    e.preventDefault();
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            showDashboard();
        } else {
            const data = await response.json();
            alert(data.error || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while signing in');
    }
}

async function handleApplicationSubmit(e) {
    e.preventDefault();
    const type = applicationTypeSelect.value;
    const content = applicationContent.value;
    const recipientId = recipientSelect.value;

    try {
        const response = await fetch(`${API_URL}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, recipientId, type, content }),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Application submitted successfully');
            applicationForm.reset();
            updateApplicationList();
        } else {
            const data = await response.json();
            alert(data.error || 'Error submitting application');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the application');
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

async function handleLogout() {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            currentUser = null;
            showSigninForm();
            signupBtn.style.display = 'inline-block';
            signinBtn.style.display = 'inline-block';
            dashboardBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        } else {
            console.error('Error logging out');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging out');
    }
}

function updateUserInfo() {
    userInfo.innerHTML = `
        <p class="font-bold">Welcome, ${currentUser.email}</p>
        <p>Role: ${currentUser.role}</p>
        <p>ID: ${currentUser.studentFacultyId}</p>
    `;
}

async function updateApplicationList() {
    try {
        const response = await fetch(`${API_URL}/applications`, {
            credentials: 'include'
        });
        if (response.ok) {
            const applications = await response.json();
            applicationList.innerHTML = '';
            applications.forEach(app => {
                const li = document.createElement('li');
                li.className = 'bg-gray-100 p-4 rounded shadow';
                li.innerHTML = `
                    <h4 class="font-bold text-lg mb-2">${app.type}</h4>
                    <p><strong>Submitted by:</strong> ${app.user_email}</p>
                    <p><strong>Recipient:</strong> ${app.recipient_email}</p>
                    <p class="my-2">${app.content}</p>
                    <p><strong>Status:</strong> <span class="font-bold ${app.status === 'Pending' ? 'text-yellow-600' : app.status === 'Approved' ? 'text-green-600' : 'text-red-600'}">${app.status}</span></p>
                `;

                if ((currentUser.role === 'faculty' || currentUser.role === 'admin') && app.status === 'Pending') {
                    const actionDiv = document.createElement('div');
                    actionDiv.className = 'mt-4 space-x-2';
                    
                    const approveBtn = document.createElement('button');
                    approveBtn.textContent = 'Approve';
                    approveBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded';
                    approveBtn.onclick = () => updateApplicationStatus(app.id, 'Approved');
                    actionDiv.appendChild(approveBtn);

                    const rejectBtn = document.createElement('button');
                    rejectBtn.textContent = 'Reject';
                    rejectBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded';
                    rejectBtn.onclick = () => updateApplicationStatus(app.id, 'Rejected');
                    actionDiv.appendChild(rejectBtn);

                    li.appendChild(actionDiv);
                }

                applicationList.appendChild(li);
            });
        } else {
            console.error('Error fetching applications');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateApplicationStatus(appId, status) {
    try {
        const response = await fetch(`${API_URL}/applications/${appId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
            credentials: 'include'
        });

        if (response.ok) {
            alert(`Application ${status.toLowerCase()} successfully`);
            updateApplicationList();
        } else {
            const data = await response.json();
            alert(data.error || `Error updating application status`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the application status');
    }
}

async function updateRecipientList() {
    try {
        const response = await fetch(`${API_URL}/users?role=faculty,admin`, {
            credentials: 'include'
        });
        if (response.ok) {
            const recipients = await response.json();
            recipientSelect.innerHTML = '<option value="">Select Recipient</option>';
            recipients.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.email} (${user.role})`;
                recipientSelect.appendChild(option);
            });
        } else {
            console.error('Error fetching recipients');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateApplicationTemplate() {
    const selectedType = applicationTypeSelect.value;
    const templates = {
        leaveRequest: "I hereby request a leave of absence from [start date] to [end date] due to [reason].",
        documentRequest: "I would like to request the following document: [document name]. The purpose of this request is [purpose].",
        certificate: "I am writing to request a [certificate type] certificate. I completed the necessary requirements on [date]."
    };
    applicationContent.value = templates[selectedType] || '';
}