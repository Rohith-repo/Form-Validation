let formData = JSON.parse(localStorage.getItem('formData')) || [];

const fields = {
    firstName: { required: true },
    lastName: { required: false },
    email: { required: true },
    password: { required: true },
    education: { required: true },
    occupation: { required: false },
    pan: { required: true },
    dob: { required: true },
    profileImage: { required: true }
};


function validateEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [local, domain] = parts;
    if (local.length < 4) return false;
    
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    
    const beforeDot = domainParts.slice(0, -1).join('.');
    const afterDot = domainParts[domainParts.length - 1];
    
    if (beforeDot.length < 3) return false;
    if (!['in', 'com', 'org', 'edu', 'net', 'gov'].includes(afterDot.toLowerCase())) return false;
    
    return true;
}

function validatePassword(password) {
    const requirements = {
        length: password.length >= 8 && password.length <= 15,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    document.getElementById('reqLength').classList.toggle('met', requirements.length);
    document.getElementById('reqUpper').classList.toggle('met', requirements.upper);
    document.getElementById('reqLower').classList.toggle('met', requirements.lower);
    document.getElementById('reqNumber').classList.toggle('met', requirements.number);
    document.getElementById('reqSpecial').classList.toggle('met', requirements.special);

    return Object.values(requirements).every(r => r);
}

function validatePAN(pan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
}

function validateDOB(dob) {
    const date = new Date(dob);
    const min = new Date('1947-08-15');
    const max = new Date('2010-08-15');
    return date >= min && date <= max;
}

function validateField(field, value) {
    const errorEl = document.getElementById(field.id + 'Error');
    const isRequired = fields[field.id].required;

    if (!isRequired && !value) {
        field.classList.remove('invalid', 'valid');
        if (errorEl) errorEl.classList.remove('show');
        return true;
    }

    let isValid = true; 

    if (field.id === 'firstName') {
        isValid = value.trim().length > 0;
    } else if (field.id === 'email') {
        isValid = validateEmail(value);
    } else if (field.id === 'password') {
        isValid = validatePassword(value);
    } else if (field.id === 'education') {
        isValid = value !== '';
    } else if (field.id === 'pan') {
        isValid = validatePAN(value.toUpperCase());
    } else if (field.id === 'dob') {
        isValid = value && validateDOB(value);
    } else if (field.id === 'profileImage') {
        isValid = field.files.length > 0 && field.files[0].size <= 2 * 1024 * 1024;
    }

    field.classList.toggle('valid', isValid);
    field.classList.toggle('invalid', !isValid && isRequired);

    if (errorEl) {
        errorEl.classList.toggle('show', !isValid && isRequired);
    }

    return isValid;
}


function saveToLocalStorage() {
    localStorage.setItem('formData', JSON.stringify(formData));
}

function exportToJSON() {
    if (formData.length === 0) {
        alert('No data to export!');
        return;
    }
    
}

async function loadExistingData() {
    try {
        const response = await fetch('data.json');
        if (response.ok) {
            const data = await response.json();
            formData = data;
            saveToLocalStorage();
            console.log('Loaded data from data.json:', formData);
        }
    } catch (error) {
        console.log('No existing data.json found, starting fresh.');
    }
}

document.getElementById('firstName').addEventListener('blur', function() {
    validateField(this, this.value);
});

document.getElementById('firstName').addEventListener('input', function() {
    if (this.value.trim()) validateField(this, this.value);
});

document.getElementById('email').addEventListener('blur', function() {
    validateField(this, this.value);
});

document.getElementById('email').addEventListener('input', function() {
    if (this.value) validateField(this, this.value);
});

document.getElementById('password').addEventListener('input', function() {
    validateField(this, this.value);
});

document.getElementById('education').addEventListener('change', function() {
    validateField(this, this.value);
});

document.getElementById('pan').addEventListener('blur', function() {
    validateField(this, this.value);
});

document.getElementById('pan').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    if (this.value.length === 10) validateField(this, this.value);
});

document.getElementById('dob').addEventListener('change', function() {
    validateField(this, this.value);
});

document.getElementById('profileImage').addEventListener('change', function() {
    const fileInfo = document.getElementById('fileInfo');
    if (this.files.length > 0) {
        const file = this.files[0];
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileInfo.textContent = `${file.name} (${sizeMB} MB)`;
        validateField(this, file);
    } else {
        fileInfo.textContent = 'No file chosen (Max 2MB)';
    }
});

document.getElementById('validationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let allValid = true;
    
    for (let fieldId in fields) {
        const field = document.getElementById(fieldId);
        const value = field.type === 'file' ? field.files[0] : field.value;
        if (!validateField(field, value)) {
            allValid = false;
        }
    }

    if (allValid) {
        const imageFile = document.getElementById('profileImage').files[0];
        const formEntry = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value || "",
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            education: document.getElementById('education').value,
            occupation: document.getElementById('occupation').value || "",
            pan: document.getElementById('pan').value,
            dob: document.getElementById('dob').value,
            image: imageFile.name,
            imageSizeMB: parseFloat((imageFile.size / (1024 * 1024)).toFixed(2))
        };
        
        formData.push(formEntry);
        saveToLocalStorage();
        
        alert('Form submitted successfully!.');
        console.log('Current Data:', JSON.stringify(formData, null, 2));
        
        this.reset();
        
        document.querySelectorAll('input, select').forEach(el => {
            el.classList.remove('valid', 'invalid');
        });
        
        document.querySelectorAll('.requirement').forEach(el => {
            el.classList.remove('met');
        });
        
        document.getElementById('fileInfo').textContent = 'No file chosen (Max 2MB)';
    } else {
        alert('Please fill all required fields correctly');
    }
});

document.getElementById('searchInput').addEventListener('input', function() {
    const query = this.value.toLowerCase().trim();
    const resultsDiv = document.getElementById('results');
    
    if (!query || formData.length === 0) {
        resultsDiv.classList.remove('show');
        return;
    }

    const filtered = formData.filter(entry => {
        return entry.firstName.toLowerCase().includes(query) ||
               entry.lastName.toLowerCase().includes(query) ||
               entry.dob.includes(query) ||
               entry.imageSizeMB.toString().includes(query);
    });

    if (filtered.length > 0) {
        resultsDiv.innerHTML = filtered.map(entry => `
            <div class="result-item">
                <strong>${entry.firstName} ${entry.lastName}</strong><br>
            </div>
        `).join('');
        resultsDiv.classList.add('show');
    } else {
        resultsDiv.innerHTML = '<div class="result-item">No results found</div>';
        resultsDiv.classList.add('show');
    }
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
        document.getElementById('results').classList.remove('show');
    }
});