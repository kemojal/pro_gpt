document.addEventListener("DOMContentLoaded", initChatGPTToolbox);

function initChatGPTToolbox() {
  // Wait for ChatGPT interface to fully load
  const checkLoaded = setInterval(() => {
    if (document.querySelector(".flex.flex-col.text-sm")) {
      clearInterval(checkLoaded);
      injectToolbox();
    }
  }, 500);
}

function injectToolbox() {
  // Create main toolbox container
  const toolboxContainer = document.createElement("div");
  toolboxContainer.id = "chatgpt-toolbox";
  toolboxContainer.className = "chatgpt-toolbox-container";

  // Add toolbox to the ChatGPT sidebar
  const sidebar = document.querySelector("nav");
  if (sidebar) {
    sidebar.appendChild(toolboxContainer);

    // Initialize all features
    initFolderSystem();
    initPromptLibrary();
    initSearchFeature();
    initBulkActions();
    initCustomizationOptions();
    initImageGallery();
    setupRTLSupport();

    // Load user settings and apply theme
    loadUserSettings();
  } else {
    console.error("ChatGPT Toolbox: Could not find sidebar to inject toolbox");
  }
}

// Folder System Implementation
function initFolderSystem() {
  // Create folder manager UI
  const folderManager = document.createElement("div");
  folderManager.id = "folder-manager";
  folderManager.className = "toolbox-section";

  // Add folder controls
  const folderControls = `
    <div class="section-header">
      <h3>Folders</h3>
      <button id="new-folder-btn" class="toolbox-btn">New Folder</button>
    </div>
    <div id="folders-list" class="folders-container"></div>
  `;

  folderManager.innerHTML = folderControls;
  document.getElementById("chatgpt-toolbox").appendChild(folderManager);

  // Initialize folder event handlers
  document
    .getElementById("new-folder-btn")
    .addEventListener("click", createNewFolder);

  // Load existing folders from storage
  chrome.storage.local.get("folders", (data) => {
    const folders = data.folders || [];
    renderFolders(folders);
  });
}

// Prompt Library Implementation
function initPromptLibrary() {
  const promptLibrary = document.createElement("div");
  promptLibrary.id = "prompt-library";
  promptLibrary.className = "toolbox-section";

  // Create prompt library UI
  const promptLibraryContent = `
    <div class="section-header">
      <h3>Prompt Library</h3>
      <button id="add-prompt-btn" class="toolbox-btn">Add New</button>
    </div>
    <div class="prompt-categories">
      <select id="prompt-category-select">
        <option value="all">All Categories</option>
        <option value="marketing">Marketing</option>
        <option value="sales">Sales</option>
        <option value="seo">SEO</option>
        <option value="customer-service">Customer Service</option>
        <option value="personal-development">Personal Development</option>
      </select>
    </div>
    <div id="prompts-list" class="prompts-container"></div>
  `;

  promptLibrary.innerHTML = promptLibraryContent;
  document.getElementById("chatgpt-toolbox").appendChild(promptLibrary);

  // Initialize prompt library handlers
  document
    .getElementById("add-prompt-btn")
    .addEventListener("click", addNewPrompt);
  document
    .getElementById("prompt-category-select")
    .addEventListener("change", filterPrompts);

  // Load prompts from both built-in library and user-saved prompts
  loadPromptLibrary();
}

// Expanded functionality would include additional functions for:
// - Handling chat organization
// - MP3 export functionality
// - Image gallery management
// - Search implementation
// - RTL language support
// - UI customization options
// - Bulk export/delete operations

// Helper function to create new folders
function createNewFolder() {
  const folderName = prompt("Enter folder name:");
  if (!folderName) return;

  chrome.storage.local.get("folders", (data) => {
    const folders = data.folders || [];
    const newFolder = {
      id: Date.now().toString(),
      name: folderName,
      pinned: false,
      subfolders: [],
      chats: [],
    };

    folders.push(newFolder);
    chrome.storage.local.set({ folders }, () => {
      renderFolders(folders);
    });
  });
}
