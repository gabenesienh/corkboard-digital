document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-controls-btn");
  const controlsPanel = document.getElementById("controls");
  const createPostitBtn = document.getElementById("create-postit-btn");
  const postitArea = document.getElementById("postit-area");
  const lineCanvas = document.getElementById("line-canvas");
  const postitColorInput = document.getElementById("postit-color");
  const postitTextInput = document.getElementById("postit-text");
  const postitImageUrlInput = document.getElementById("postit-image-url");
  const postitLinkUrlInput = document.getElementById("postit-link-url");

  let postitIdCounter = 0;
  const connections = []; // Array para armazenar {sourceId, targetId, color, svgElement}

  let activePostit = null;
  let initialX, initialY, initialPostitX, initialPostitY;

  // --- Lógica de Criação e Toggle ---
  toggleBtn.addEventListener("click", () => {
    controlsPanel.classList.toggle("hidden");
  });

  createPostitBtn.addEventListener("click", () => {
    const postitColor = postitColorInput.value;
    const postitText = postitTextInput.value.trim();
    const postitImageUrl = postitImageUrlInput.value.trim();
    const postitLinkUrl = postitLinkUrlInput.value.trim();

    if (!postitText && !postitImageUrl && !postitLinkUrl) {
      alert(
        "Por favor, digite um texto, adicione uma imagem ou um link para o post-it."
      );
      return;
    }

    postitIdCounter++;
    const postId = `postit-${postitIdCounter}`;

    const postit = document.createElement("div");
    postit.classList.add("post-it");
    postit.id = postId;
    postit.style.backgroundColor = postitColor;

    const containerRect = postitArea.getBoundingClientRect();
    const randomX = Math.random() * (containerRect.width - 200);
    const randomY = Math.random() * (containerRect.height - 150);
    postit.style.left = `${Math.max(20, randomX)}px`;
    postit.style.top = `${Math.max(20, randomY)}px`;

    // Conteúdo do Post-it (texto, imagem, link)
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("post-it-content");
    if (postitText) {
      const textNode = document.createElement("p");
      textNode.textContent = postitText;
      contentDiv.appendChild(textNode);
    }
    if (postitImageUrl) {
      const img = document.createElement("img");
      img.src = postitImageUrl;
      img.alt = "Imagem";
      contentDiv.appendChild(img);
    }
    if (postitLinkUrl) {
      const link = document.createElement("a");
      link.href = postitLinkUrl;
      link.target = "_blank";
      link.textContent = postitText || "Clique aqui";
      contentDiv.appendChild(link);
    }
    postit.appendChild(contentDiv);

    // Adiciona o Handle de Conexão (Pontos para iniciar/terminar linha)
    const topHandle = createHandle(postId, "top");
    postit.appendChild(topHandle);

    // Botão de fechar/deletar
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("close-postit");
    closeBtn.textContent = "X";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removePostitAndConnections(postId);
    });
    postit.appendChild(closeBtn);

    postitArea.appendChild(postit);

    // Limpa inputs
    postitTextInput.value = "";
    postitImageUrlInput.value = "";
    postitLinkUrlInput.value = "";
    controlsPanel.classList.add("hidden"); // Fecha o painel após criar
  });

  // --- Lógica de Conexão (Linhas SVG) ---
  let isConnecting = false;
  let sourcePostitId = null;
  let tempLine = null;

  function createHandle(postId, position) {
    const handle = document.createElement("div");
    handle.classList.add("connect-handle", position);
    handle.dataset.postId = postId;
    handle.dataset.position = position;

    handle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();

      isConnecting = true;
      sourcePostitId = postId;

      // Inicia o desenho da linha temporária
      const startPos = getHandleCenter(handle);
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.classList.add("connection-line");
      line.setAttribute("x1", startPos.x);
      line.setAttribute("y1", startPos.y);
      line.setAttribute("x2", startPos.x);
      line.setAttribute("y2", startPos.y);
      line.setAttribute("stroke", postitColorInput.value); // Usa a cor atual do seletor para a linha
      lineCanvas.appendChild(line);
      tempLine = line;
    });

    return handle;
  }

  // Função auxiliar para obter o centro absoluto de um Handle
  function getHandleCenter(handle) {
    const rect = handle.getBoundingClientRect();
    const containerRect = postitArea.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
  }

  // Desenha a linha temporária enquanto o mouse se move
  postitArea.addEventListener("mousemove", (e) => {
    if (!isConnecting || !tempLine) return;

    const containerRect = postitArea.getBoundingClientRect();
    tempLine.setAttribute("x2", e.clientX - containerRect.left);
    tempLine.setAttribute("y2", e.clientY - containerRect.top);
  });

  // Finaliza a Conexão
  postitArea.addEventListener("mouseup", (e) => {
    if (!isConnecting) return;

    isConnecting = false;

    // Verifica se o mouse parou em outro handle
    const targetHandle = e.target.closest(".connect-handle");

    if (targetHandle && targetHandle.dataset.postId !== sourcePostitId) {
      const targetPostitId = targetHandle.dataset.postId;

      // Cria a conexão permanente
      const connection = {
        sourceId: sourcePostitId,
        targetId: targetPostitId,
        color: tempLine.getAttribute("stroke"),
        svgElement: tempLine,
      };
      connections.push(connection);

      // Atualiza a posição final da linha
      const endPos = getHandleCenter(targetHandle);
      tempLine.setAttribute("x2", endPos.x);
      tempLine.setAttribute("y2", endPos.y);

      // Adiciona um listener para remover a linha ao clicar nela
      tempLine.addEventListener("click", () => removeConnection(connection));
    } else {
      // Se não conectou a nada, remove a linha temporária
      lineCanvas.removeChild(tempLine);
    }

    sourcePostitId = null;
    tempLine = null;
  });

  // --- Funções de Manutenção de Linhas ---

  function removeConnection(connToRemove) {
    connToRemove.svgElement.remove();
    const index = connections.indexOf(connToRemove);
    if (index > -1) {
      connections.splice(index, 1);
    }
  }

  function removePostitAndConnections(postId) {
    document.getElementById(postId).remove();

    // Remove as linhas conectadas a este post-it
    const linesToRemove = connections.filter(
      (c) => c.sourceId === postId || c.targetId === postId
    );
    linesToRemove.forEach((conn) => conn.svgElement.remove());

    // Atualiza o array de conexões
    connections.splice(
      0,
      connections.length,
      ...connections.filter(
        (c) => c.sourceId !== postId && c.targetId !== postId
      )
    );
  }

  function updateAllLines() {
    connections.forEach((conn) => {
      const sourcePostit = document.getElementById(conn.sourceId);
      const targetPostit = document.getElementById(conn.targetId);

      if (sourcePostit && targetPostit) {
        // Encontra os handles (simplificado para top/bottom)
        const sourceHandle = sourcePostit.querySelector(".connect-handle.top");
        const targetHandle = targetPostit.querySelector(".connect-handle.top");

        if (sourceHandle && targetHandle) {
          const startPos = getHandleCenter(sourceHandle);
          const endPos = getHandleCenter(targetHandle);

          conn.svgElement.setAttribute("x1", startPos.x);
          conn.svgElement.setAttribute("y1", startPos.y);
          conn.svgElement.setAttribute("x2", endPos.x);
          conn.svgElement.setAttribute("y2", endPos.y);
        }
      } else {
        // Se um post-it foi removido por fora (teoricamente não deve acontecer)
        removeConnection(conn);
      }
    });
  }

  // --- Lógica de Arrastar e Soltar (Drag and Drop) atualizada ---
  postitArea.addEventListener("mousedown", (e) => {
    const postit = e.target.closest(".post-it");
    if (
      postit &&
      !e.target.closest(".close-postit") &&
      !e.target.closest(".connect-handle")
    ) {
      activePostit = postit;
      initialX = e.clientX;
      initialY = e.clientY;
      initialPostitX = activePostit.offsetLeft;
      initialPostitY = activePostit.offsetTop;
      activePostit.style.zIndex = "1000";
      activePostit.style.cursor = "grabbing";
    }
  });

  postitArea.addEventListener("mousemove", (e) => {
    if (!activePostit) return;

    e.preventDefault();

    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;

    activePostit.style.left = `${initialPostitX + dx}px`;
    activePostit.style.top = `${initialPostitY + dy}px`;

    // **CHAVE:** Atualiza as linhas ao mover o post-it
    updateAllLines();
  });

  postitArea.addEventListener("mouseup", () => {
    if (activePostit) {
      activePostit.style.zIndex = "10"; // Z-index normal
      activePostit.style.cursor = "grab";
      activePostit = null;
    }
  });

  postitArea.addEventListener("mouseleave", () => {
    if (activePostit) {
      activePostit.style.zIndex = "10";
      activePostit.style.cursor = "grab";
      activePostit = null;
    }
    // Assegura que a linha temporária seja removida se o mouse sair da área
    if (tempLine) {
      lineCanvas.removeChild(tempLine);
      sourcePostitId = null;
      tempLine = null;
      isConnecting = false;
    }
  });
});
