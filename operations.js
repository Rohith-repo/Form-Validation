let users = [];
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

async function loadData() {
  try {
    const response = await fetch("data.json");
    if (response.ok) {
      users = await response.json();
      console.log("Loaded from data.json:", users);
    } else {
      throw new Error("data.json not found");
    }
  } catch (error) {
    const localData = localStorage.getItem('formData');
    if (localData) {
      users = JSON.parse(localData);
      console.log("Loaded from localStorage:", users);
    } else {
      console.log("No data found");
    }
  }
}

// Initial load
loadData();

// Listen for storage changes (when form is submitted)
window.addEventListener('storage', function(e) {
  if (e.key === 'formData') {
    loadData();
    console.log('Data updated from another tab/window');
  }
});

window.addEventListener('formDataUpdated', function() {
  loadData();
  console.log('Data updated - reloaded');
});

const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function dateToDays(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  let days = 365 * y + d;
  for (let i = 0; i < m - 1; i++) days += monthDays[i];
  return days;
}

function ageInDays(dob) {
  return todayToDays() - dateToDays(dob);
}

function todayToDays() {
  const t = new Date();
  return dateToDays(`${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`);
}

function interpretToMB(n) {
  if (n === 1 || n === 2) return n;
  if (n > 2 && n <= 3000) return n / 1024;
  return null;
}

searchInput.addEventListener("keyup", () => {
  const input = searchInput.value.trim();
  resultsDiv.innerHTML = "";
  if (!input) {
    resultsDiv.classList.remove('show');
    return;
  }
  
  let filtered = [];
  
  if (isNaN(input)) {
    const q = input.toLowerCase();
    filtered = users.filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      (u.lastName && u.lastName.toLowerCase().includes(q))
    );
  } else {
    const num = Number(input);
    filtered = users.filter(u => ageInDays(u.dob) <= num);
    const mb = interpretToMB(num);
    if (mb !== null) {
      filtered = users.filter(u => u.imageSizeMB <= mb);
    }
  }
  
  displayResults(filtered);
});

function displayResults(data) {
  if (!data.length) {
    resultsDiv.innerHTML = "<div class='result-item'>No results found</div>";
    resultsDiv.classList.add('show');
    return;
  }
  
  resultsDiv.innerHTML = '';
  data.forEach(user => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <strong>${user.firstName} ${user.lastName || ""}</strong><br>
      <span>Email: ${user.email}</span><br>
    `;
    resultsDiv.appendChild(div);
  });
  resultsDiv.classList.add('show');
}

(() => {
  'use strict'
  const forms = document.querySelectorAll('.needs-validation')
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })
})()