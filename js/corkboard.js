document.addEventListener("DOMContentLoaded", () => {
  const quadro = document.getElementById("quadro")
  const painelBotoes = document.getElementsByClassName("btn-adicionar-item");

  // Usado para identificar individualmente os itens do quadro
  let novoItemId = 0;

  // Ao arrastar (drag & drop) um item, isso guarda uma referência do item
  let itemSegurado = null;

  // O quão longe o mouse deve ficar do canto superior esquerdo do item segurado
  // É definido ao clicar no item, e usado na hora de movê-lo
  let itemSeguradoOffsetX = 0;
  let itemSeguradoOffsetY = 0;

  for (const btn of painelBotoes) {
    btn.addEventListener("click", () => {
      const novoItem = document.createElement("div");
      novoItem.classList.add("item");

      // Área superior do item (onde ficaria um alfinete, na vida real)
      const novoItemTop = document.createElement("div");
      novoItemTop.classList.add("item-top");
      novoItem.appendChild(novoItemTop);

      switch (btn.id) {
        // Post-it para texto
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

        novoItemTop.style.cursor = "grabbing";

        itemSegurado = novoItem;
        itemSeguradoOffsetX = e.clientX - parseInt(itemSegurado.style.left, 10);
        itemSeguradoOffsetY = e.clientY - parseInt(itemSegurado.style.top, 10);
        
        // Mover item para a frente do quadro (movendo os outros para trás)
        for (const item of document.getElementsByClassName("item")) {
          if (item.style.zIndex > itemSegurado.style.zIndex) {
            item.style.zIndex--;
          }
        }

        itemSegurado.style.zIndex = novoItemId;
      })
    });
  }

  document.body.addEventListener("mousemove", (e) => {
    if (e.button !== 0) return;
    if (itemSegurado === null) return;

    itemSegurado.style.left = `${e.clientX - itemSeguradoOffsetX}px`;
    itemSegurado.style.top = `${e.clientY - itemSeguradoOffsetY}px`;
  });

  document.body.addEventListener("mouseup", (e) => {
    if (e.button !== 0) return;
    if (itemSegurado === null) return;

    itemSegurado.querySelector(".item-top").style.cursor = "";

    itemSegurado = null;
  });
});