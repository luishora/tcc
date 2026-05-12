// Dados iniciais de simulação
let estoque = [
    { nome: "Papel A4", categoria: "Papelaria", qtd: 5, min: 10 },
    { nome: "Caneta Azul", categoria: "Escrita", qtd: 150, min: 20 },
    { nome: "Cloro 5L", categoria: "Limpeza", qtd: 2, min: 5 }
];

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    updateDashboard();
}

function updateDashboard() {
    const tableBody = document.getElementById('stockBody');
    tableBody.innerHTML = "";
    let criticos = 0;

    estoque.forEach(item => {
        const isCritico = item.qtd < item.min;
        if (isCritico) criticos++;

        tableBody.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.categoria}</td>
                <td>${item.qtd}</td>
                <td>${item.min}</td>
                <td style="color: ${isCritico ? '#ef4444' : '#22c55e'}">${isCritico ? 'CRÍTICO' : 'OK'}</td>
            </tr>
        `;
    });

    document.getElementById('total-itens').innerText = estoque.length;
    document.getElementById('total-critico').innerText = criticos;
    
    const alertBox = document.getElementById('alert-box');
    criticos > 0 ? alertBox.classList.remove('hidden') : alertBox.classList.add('hidden');
}

function filterTable() {
    let input = document.getElementById("filterInput").value.toUpperCase();
    let rows = document.getElementById("stockBody").getElementsByTagName("tr");
    
    for (let i = 0; i < rows.length; i++) {
        let text = rows[i].getElementsByTagName("td")[0].textContent.toUpperCase();
        rows[i].style.display = text.indexOf(input) > -1 ? "" : "none";
    }
}

// Inicialização do Gráfico
const ctx = document.getElementById('stockChart').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: estoque.map(i => i.nome),
        datasets: [{
            label: 'Quantidade em Estoque',
            data: estoque.map(i => i.qtd),
            backgroundColor: '#3b82f6'
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});

// Iniciar sistema
updateDashboard();
