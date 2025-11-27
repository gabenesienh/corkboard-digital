document.addEventListener('DOMContentLoaded', () => {
    const createPostitBtn = document.getElementById('create-postit-btn');
    const postitArea = document.getElementById('postit-area');
    const postitColorInput = document.getElementById('postit-color');
    const postitTextInput = document.getElementById('postit-text');
    const postitImageUrlInput = document.getElementById('postit-image-url');
    const postitLinkUrlInput = document.getElementById('postit-link-url');

    let activePostit = null; // Post-it que está sendo arrastado
    let initialX; // Posição X inicial do mouse
    let initialY; // Posição Y inicial do mouse
    let initialPostitX; // Posição X inicial do post-it
    let initialPostitY; // Posição Y inicial do post-it

    createPostitBtn.addEventListener('click', () => {
        const postitColor = postitColorInput.value;
        const postitText = postitTextInput.value.trim();
        const postitImageUrl = postitImageUrlInput.value.trim();
        const postitLinkUrl = postitLinkUrlInput.value.trim();

        if (!postitText && !postitImageUrl && !postitLinkUrl) {
            alert('Por favor, digite um texto, adicione uma imagem ou um link para o post-it.');
            return;
        }

        const postit = document.createElement('div');
        postit.classList.add('post-it');
        postit.style.backgroundColor = postitColor;

        // Posição inicial aleatória para o post-it (dentro dos limites visíveis)
        const containerRect = postitArea.getBoundingClientRect();
        const randomX = Math.random() * (containerRect.width - 200); // 200 é uma largura estimada para o post-it
        const randomY = Math.random() * (containerRect.height - 150); // 150 é uma altura estimada para o post-it
        postit.style.left = `${Math.max(0, randomX)}px`;
        postit.style.top = `${Math.max(0, randomY)}px`;

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('post-it-content');

        if (postitText) {
            const textNode = document.createElement('p');
            textNode.textContent = postitText;
            contentDiv.appendChild(textNode);
        }

        if (postitImageUrl) {
            const img = document.createElement('img');
            img.src = postitImageUrl;
            img.alt = 'Imagem do Post-it';
            contentDiv.appendChild(img);
        }
        
        if (postitLinkUrl) {
            const link = document.createElement('a');
            link.href = postitLinkUrl;
            link.target = '_blank'; // Abre o link em uma nova aba
            link.textContent = postitText || 'Clique aqui'; // Usa o texto do post-it ou um texto padrão
            contentDiv.appendChild(link);
        }

        postit.appendChild(contentDiv);

        // Botão de fechar/deletar o post-it
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('close-postit');
        closeBtn.textContent = 'X';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o evento de arrastar seja disparado
            postit.remove();
        });
        postit.appendChild(closeBtn);

        postitArea.appendChild(postit);

        // Limpa os campos de input
        postitTextInput.value = '';
        postitImageUrlInput.value = '';
        postitLinkUrlInput.value = '';
    });

    // --- Funcionalidade de Arrastar e Soltar (Drag and Drop) ---

    postitArea.addEventListener('mousedown', (e) => {
        // Verifica se o clique foi em um post-it e não no botão de fechar
        if (e.target.classList.contains('post-it') && !e.target.classList.contains('close-postit')) {
            activePostit = e.target;
            initialX = e.clientX;
            initialY = e.clientY;
            initialPostitX = activePostit.offsetLeft;
            initialPostitY = activePostit.offsetTop;
            activePostit.style.zIndex = '1000'; // Traz o post-it para frente
        } else if (e.target.closest('.post-it') && !e.target.classList.contains('close-postit')) {
            // Se o clique foi em um elemento dentro do post-it, mas não no botão de fechar
            activePostit = e.target.closest('.post-it');
            initialX = e.clientX;
            initialY = e.clientY;
            initialPostitX = activePostit.offsetLeft;
            initialPostitY = activePostit.offsetTop;
            activePostit.style.zIndex = '1000';
        }
    });

    postitArea.addEventListener('mousemove', (e) => {
        if (!activePostit) return;

        e.preventDefault(); // Evita seleção de texto durante o arrasto

        const dx = e.clientX - initialX;
        const dy = e.clientY - initialY;

        activePostit.style.left = `${initialPostitX + dx}px`;
        activePostit.style.top = `${initialPostitY + dy}px`;
    });

    postitArea.addEventListener('mouseup', () => {
        if (activePostit) {
            activePostit.style.zIndex = 'auto'; // Retorna o z-index ao normal
            activePostit = null;
        }
    });

    postitArea.addEventListener('mouseleave', () => {
        // Garante que o post-it seja "solto" se o mouse sair da área do quadro
        if (activePostit) {
            activePostit.style.zIndex = 'auto';
            activePostit = null;
        }
    });
});