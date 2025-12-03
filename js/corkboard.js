document.addEventListener("DOMContentLoaded", () => {
  const quadro = document.getElementById("quadro")
  const painelBotoes = document.getElementsByClassName("btn-adicionar-item");

  // Usado para identificar individualmente os itens do quadro
  let novoItemId = 0;

  for (const e of painelBotoes) {
    e.addEventListener("click", () => {
      const novoItem = document.createElement("div");

      // Área superior do item (onde ficaria um alfinete, na vida real)
      const novoItemTop = document.createElement("div");
      novoItemTop.classList.add("item-top");
      novoItem.appendChild(novoItemTop);

      switch (e.id) {
        // Post-it para texto
        case "btn-adicionar-post-it":
          novoItem.classList.add("post-it");

          const textarea = document.createElement("textarea");
          novoItem.appendChild(textarea);

          break;
      }

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
    });
  }
});