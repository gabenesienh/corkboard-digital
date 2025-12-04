import { AlfinetePonto } from "./alfinete-ponto.js";

const quadro = document.getElementById("quadro")
const quadroLinhas = document.getElementById("quadro-linhas");
const painelBotoes = document.getElementsByClassName("btn-adicionar-item");
const pontos = new WeakMap(); // Cada alfinete possui um

// Apaga e desenha novamente as linhas do quadro
function atualizarLinhas() {
  quadroLinhas.textContent = "";

  for (const alfinete of document.getElementsByClassName("alfinete")) {
    const ponto = pontos.get(alfinete);

    if (ponto.next.length > 0) {
      const alfineteRect = alfinete.getBoundingClientRect();

      for (const alfinete2 of ponto.next) {
        const alfinete2Rect = alfinete2.getBoundingClientRect();

        const linha = document.createElementNS("http://www.w3.org/2000/svg", "line");

        linha.setAttribute("x1", alfineteRect.x + alfineteRect.width/2);
        linha.setAttribute("y1", alfineteRect.y + alfineteRect.height/2);
        linha.setAttribute("x2", alfinete2Rect.x + alfinete2Rect.width/2);
        linha.setAttribute("y2", alfinete2Rect.y + alfinete2Rect.height/2);

        quadroLinhas.appendChild(linha);
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Usado para identificar individualmente os itens do quadro
  let novoItemId = 0;

  // Ao arrastar (drag & drop) um item, isso guarda uma referência do item
  let itemHold = null;

  // Ao desenhar uma linha, isso guarda a referência da linha e do alfinete
  let linhaHold = null;
  let alfineteHold = null;

  // O quão longe o mouse deve ficar do canto superior esquerdo do item segurado
  // É definido ao clicar no item, e usado na hora de movê-lo
  let itemHoldOffsetX = 0;
  let itemHoldOffsetY = 0;

  for (const btn of painelBotoes) {
    btn.addEventListener("click", () => {
      const novoItem = document.createElement("div");
      novoItem.classList.add("item");

      // Área superior do item (onde fica o alfinete)
      const novoItemTop = document.createElement("div");
      novoItemTop.classList.add("item-top");
      novoItem.appendChild(novoItemTop);

      // Criar alfinete no topo do objeto
      const alfinete = document.createElement("div");
      alfinete.classList.add("alfinete");
      pontos.set(alfinete, new AlfinetePonto());
      novoItemTop.appendChild(alfinete);

      // Criar elementos do item com base no tipo dele
      switch (btn.id) {
        case "btn-adicionar-post-it":
          novoItem.classList.add("post-it");

          const textarea = document.createElement("textarea");
          novoItem.appendChild(textarea);

          break;
      }

      // Mover item para a frente do quadro
      novoItem.style.zIndex = novoItemId;

      // Dar um ID ao item criado
      novoItem.id = "item-" + novoItemId;
      novoItemId++;

      // Adicionar item ao quadro
      quadro.appendChild(novoItem);

      // Retângulo com as medidas do quadro no viewport
      const quadroRect = quadro.getBoundingClientRect();

      // Medidas do item, convertidas de px para int
      const itemLargura = parseInt(getComputedStyle(novoItem).width, 10);
      const itemAltura = parseInt(getComputedStyle(novoItem).height, 10);

      // Mover o item para um local aleatório no quadro
      // Coordenadas são ajustadas para que o item caiba dentro do quadro
      const randomX = Math.random()*(quadroRect.width - itemLargura);
      const randomY = Math.random()*(quadroRect.height - itemAltura);
      novoItem.style.left = `${randomX}px`;
      novoItem.style.top = `${randomY}px`;

      // Detectar quando o topo do item é clicado, para permitir drag´ & drop
      novoItemTop.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;

        novoItem.querySelector(".item-top > .alfinete").style.visibility = "hidden";

        novoItemTop.style.cursor = "grabbing";

        itemHold = novoItem;
        itemHoldOffsetX = e.clientX - parseInt(itemHold.style.left, 10);
        itemHoldOffsetY = e.clientY - parseInt(itemHold.style.top, 10);
        
        // Mover item para a frente do quadro (movendo os outros para trás)
        for (const item of document.getElementsByClassName("item")) {
          if (item.style.zIndex > itemHold.style.zIndex) {
            item.style.zIndex--;
          }
        }

        itemHold.style.zIndex = novoItemId;
      })

      // Começar a desenhar uma linha ao clicar no alfinete
      alfinete.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      
        alfineteHold = alfinete;
        linhaHold = document.createElementNS("http://www.w3.org/2000/svg", "line");

        const alfineteRect = alfinete.getBoundingClientRect();

        linhaHold.setAttribute("x1", alfineteRect.x + alfineteRect.width/2);
        linhaHold.setAttribute("y1", alfineteRect.y + alfineteRect.height/2);
        linhaHold.setAttribute("x2", e.clientX);
        linhaHold.setAttribute("y2", e.clientY);
      
        quadroLinhas.appendChild(linhaHold);
      });
    
      alfinete.addEventListener("mouseup", (e) => {
        if (e.button !== 0) return;
      
        if (alfinete === alfineteHold) {
          // Remover item ao clicar no alfinete
          alfinete.parentElement.parentElement.remove();
        } else {
          const a1 = alfinete;
          const a2 = alfineteHold;
          const p1 = pontos.get(a1);
          const p2 = pontos.get(a2);

          // Adicionar alfinete e alfineteHold como prev e next um do outro
          // Primeiro verificar se já não estão conectados
          if (p1.next.indexOf(a2) === -1
          &&  p2.next.indexOf(a1) === -1) {
            if (p1.prev === null) {
              // a1 é integrado na sequência de a2
              p1.prev = a2;
              p2.next.push(a1);
            } else if (p2.prev === null) {
              // a2 é integrado na sequência de a1
              p2.prev = a1;
              p1.next.push(a2);
            } else if (p1.prev !== p2 && p2.prev !== p1) {
              // Ambos possuem um ponto anterior, dar prioridade à sequência
              // cuja linha o usuário está segurando
              p2.next.push(a1);
            }
          }

          atualizarLinhas();
        }
      })
    });
  }

  document.body.addEventListener("mousemove", (e) => {
    if (e.button !== 0) return;

    if (itemHold !== null) {
      itemHold.style.left = `${e.clientX - itemHoldOffsetX}px`;
      itemHold.style.top = `${e.clientY - itemHoldOffsetY}px`;
      atualizarLinhas();
    }

    if (linhaHold !== null) {
      linhaHold.setAttribute("x2", e.clientX);
      linhaHold.setAttribute("y2", e.clientY);
    }
  });

  document.body.addEventListener("mouseup", (e) => {
    if (e.button !== 0) return;

    if (itemHold !== null) {
      itemHold.querySelector(".item-top > .alfinete").style.visibility = "";
      itemHold.querySelector(".item-top").style.cursor = "";
    }

    if (alfineteHold !== null) {
      atualizarLinhas();
    }

    itemHold = null;
    alfineteHold = null;
  });
});