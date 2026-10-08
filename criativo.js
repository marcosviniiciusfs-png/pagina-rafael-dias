(() => {
  const videoInput = document.querySelector('#video-input');
  const fileList = document.querySelector('#file-list');
  const clearFilesButton = document.querySelector('#clear-files');
  const selectedCount = document.querySelector('#selected-count');
  const createCount = document.querySelector('#create-count');
  const createButton = document.querySelector('#create-button');
  const chosenTemplate = document.querySelector('#chosen-template');
  const creationMessage = document.querySelector('#creation-message');
  const templates = [...document.querySelectorAll('.template-card')];
  let selectedFiles = [];

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
  };

  const renderFiles = () => {
    const count = selectedFiles.length;
    selectedCount.textContent = count;
    createCount.textContent = count;
    createButton.disabled = count === 0;
    clearFilesButton.hidden = count === 0;
    fileList.replaceChildren();

    if (count === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'Os vídeos selecionados aparecerão aqui.';
      fileList.append(empty);
      return;
    }

    selectedFiles.forEach((file, index) => {
      const item = document.createElement('li');
      item.className = 'file-item';
      const details = document.createElement('span');
      const name = document.createElement('span');
      const size = document.createElement('span');
      const remove = document.createElement('button');
      details.className = 'file-details';
      name.className = 'file-name';
      size.className = 'file-size';
      name.textContent = file.name;
      size.textContent = formatBytes(file.size);
      remove.className = 'remove-file';
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remover ${file.name} da fila`);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        selectedFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
        creationMessage.textContent = '';
        renderFiles();
      });
      details.append(name, size);
      item.append(details, remove);
      fileList.append(item);
    });
  };

  videoInput.addEventListener('change', () => {
    const incomingFiles = [...videoInput.files].filter((file) => file.type.startsWith('video/'));
    const existingKeys = new Set(selectedFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
    selectedFiles.push(...incomingFiles.filter((file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`)));
    videoInput.value = '';
    creationMessage.textContent = '';
    renderFiles();
  });

  clearFilesButton.addEventListener('click', () => {
    selectedFiles = [];
    creationMessage.textContent = '';
    renderFiles();
  });

  templates.forEach((template) => {
    template.addEventListener('click', () => {
      templates.forEach((item) => item.setAttribute('aria-pressed', 'false'));
      template.setAttribute('aria-pressed', 'true');
      chosenTemplate.textContent = template.dataset.template;
      creationMessage.textContent = '';
    });
  });

  createButton.addEventListener('click', () => {
    creationMessage.textContent = `A fila com ${selectedFiles.length} vídeo${selectedFiles.length === 1 ? '' : 's'} está pronta. Conecte o Canva MCP para duplicar o template e iniciar as exportações.`;
  });

  renderFiles();
})();
