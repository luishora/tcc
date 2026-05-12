// DADOS DO ESTOQUE

const estoque = [

  {
    produto: "Caderno",
    categoria: "Papelaria",
    quantidade: 120
  },

  {
    produto: "Canetas",
    categoria: "Papelaria",
    quantidade: 250
  },

  {
    produto: "Tinta Impressora",
    categoria: "Tecnologia",
    quantidade: 4
  },

  {
    produto: "Álcool Gel",
    categoria: "Limpeza",
    quantidade: 8
  },

  {
    produto: "Mouse",
    categoria: "Tecnologia",
    quantidade: 18
  }

];

// ELEMENTOS

const tabela = document.getElementById("tabelaEstoque");

const pesquisa = document.getElementById("pesquisa");

const filtroCategoria = document.getElementById("filtroCategoria");

const totalEstoque = document.getElementById("totalEstoque");

const itensCriticos = document.getElementById("itensCriticos");

const alertaEstoque = document.getElementById("alertaEstoque");

// RENDERIZAR TABELA

function renderizarTabela() {

  tabela.innerHTML = "";

  let filtroTexto = pesquisa.value.toLowerCase();

  let categoriaSelecionada = filtroCategoria.value;

  let total = 0;

  let criticos = 0;

  estoque.forEach(item => {

    let nome = item.produto.toLowerCase();

    let categoriaOK =
      categoriaSelecionada === "" ||
      item.categoria === categoriaSelecionada;

    let pesquisaOK = nome.includes(filtroTexto);

    if(categoriaOK && pesquisaOK){

      total += item.quantidade;

      let status = "";

      if(item.quantidade <= 10){

        status = "Crítico";

        criticos++;

      } else {

        status = "Normal";

      }

      tabela.innerHTML += `
        <tr>
          <td>${item.produto}</td>
          <td>${item.categoria}</td>
          <td>${item.quantidade}</td>
          <td class="${
            item.quantidade <= 10
              ? "low-stock"
              : "ok-stock"
          }">
            ${status}
          </td>
        </tr>
      `;
    }

  });

  totalEstoque.innerText = total;

  itensCriticos.innerText = criticos;

  alertaEstoque.innerText =
    criticos > 0
      ? `⚠ ${criticos} itens com estoque crítico`
      : "✅ Estoque normal";

}

// EVENTOS

pesquisa.addEventListener("input", renderizarTabela);

filtroCategoria.addEventListener("change", renderizarTabela);

// LOGIN

function login(){

  alert("Login realizado com sucesso!");

}

// CADASTRO

function cadastro(){

  alert("Usuário cadastrado com sucesso!");

}

// INICIAR

renderizarTabela();