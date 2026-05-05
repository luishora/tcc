// Modal Toggle
const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');

loginBtn.onclick = () => modal.style.display = "flex";
window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; }

function toggleAuth(type) {
    document.getElementById('loginForm').style.display = type === 'forgot' ? 'none' : 'block';
    document.getElementById('forgotForm').style.display = type === 'forgot' ? 'block' : 'none';
}

// Lógica de Login
function handleLogin() {
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;

    if(user === "negodi" && pass === "123456") {
        alert("Olá " + user);
        modal.style.display = "none";
        loginBtn.innerText = "Olá, " + user;
    } else {
        alert("Dados incorretos!");
    }
}

// Carrossel
let currentSlide = 0;
function moveSlide(n) {
    const slides = document.querySelectorAll('.slide');
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

// Contador Animado
let count = 0;
const target = 1500; // Exemplo de número de clientes
const interval = setInterval(() => {
    if(count < target) {
        count += 10;
        document.getElementById('clientCounter').innerText = count + "+";
    } else {
        clearInterval(interval);
    }
}, 30);
