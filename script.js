// Função para trocar de página
function showPage(pageId) {
    // Esconde todas as páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Mostra a página selecionada
    document.getElementById(pageId).classList.add('active');

    // Fecha o menu no mobile após clicar
    document.getElementById('nav-links').classList.remove('show');
}

// Função para o menu hambúrguer no celular
function toggleMenu() {
    const nav = document.getElementById('nav-links');
    nav.classList.toggle('show');
}

