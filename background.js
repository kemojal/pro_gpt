// background.js - Service worker for handling background tasks

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Initialize storage with default settings and prompt library
    initializeExtensionData().catch((error) => {
      console.error("Failed to initialize extension:", error);
    });
  } else if (details.reason === "update") {
    // Handle version updates if needed
    updateIfNeeded(details.previousVersion);
  }
});

// Initialize extension data with default settings and prompt library
async function initializeExtensionData() {
  const defaultSettings = {
    theme: "auto", // auto, light, dark
    rtlEnabled: false,
    collapseGPTSections: true,
    showFolderPins: true,
    audioQuality: "high",
    defaultExportFormat: "txt",
  };

  // Set up default folders structure
  const defaultFolders = [
    {
      id: "default",
      name: "All Chats",
      pinned: true,
      subfolders: [],
      chats: [],
    },
    {
      id: "favorites",
      name: "Favorites",
      pinned: true,
      subfolders: [],
      chats: [],
    },
  ];

  try {
    // First, ensure we can access storage
    await chrome.storage.local.set({ test: true });
    await chrome.storage.local.remove("test");

    // Load default prompt library from bundled JSON
    const promptsUrl = chrome.runtime.getURL(
      "prompt-library/default-prompts.json"
    );
    console.log("Attempting to load prompts from:", promptsUrl);

    let defaultPrompts = [
      {
        id: "prompt1",
        title: "Example Prompt",
        content: "This is an example prompt",
      },
    ];
    try {
      const response = await fetch(promptsUrl);
      console.log("Fetch response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      defaultPrompts = await response.json();
      console.log("Successfully loaded default prompts");
    } catch (promptError) {
      console.error("Error loading prompts:", promptError);
      console.error("Prompts URL was:", promptsUrl);
      // Continue with empty prompts array
    }

    // Save all initial data to storage
    await chrome.storage.local.set({
      settings: defaultSettings,
      folders: defaultFolders,
      prompts: defaultPrompts,
      savedImages: [],
      initialized: true,
    });

    console.log("ChatGPT Toolbox: Initial setup complete");
    return true;
  } catch (error) {
    console.error("Failed to initialize extension data:", error);
    throw new Error("Could not create an options page. " + error.message);
  }
}

// Handle version updates
function updateIfNeeded(previousVersion) {
  // Compare versions and migrate data if needed
  console.log(`Updated from ${previousVersion}`);

  // Example: If updating from pre-1.0 to 1.0+, might need data migration
  if (previousVersion && previousVersion.startsWith("0.")) {
    migrateFromLegacyFormat();
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadAsMP3") {
    convertTextToMP3(request.text, request.filename)
      .then((url) => {
        sendResponse({ success: true, url: url });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }

  if (request.action === "bulkExport") {
    handleBulkExport(request.chats, request.format)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "saveImage") {
    saveImageToGallery(request.imageData, request.chatId)
      .then((imageId) => {
        sendResponse({ success: true, imageId: imageId });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Convert text to MP3 audio file
async function convertTextToMP3(text, filename) {
  // Get audio quality setting
  const { settings } = await chrome.storage.local.get("settings");
  const quality = settings?.audioQuality || "medium";

  // For a real implementation, you would:
  // 1. Use a Text-to-Speech API or library
  // 2. Generate the audio file
  // 3. Return a downloadable URL

  // This is a placeholder - in a real extension you'd use Web Speech API
  // or a third-party service like Google Cloud TTS, Amazon Polly, etc.

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return a mock URL (in real implementation, this would be a blob URL)
  return `data:audio/mp3;base64,MOCK_MP3_DATA`;
}

// Handle bulk export of multiple chats
async function handleBulkExport(chatIds, format) {
  // Retrieve the selected chats from storage
  // Combine them into the requested format (TXT, JSON)
  // Return data for download or trigger a download

  if (!Array.isArray(chatIds) || chatIds.length === 0) {
    throw new Error("No chats selected for export");
  }

  // Fetch all chats from ChatGPT (in a real extension, you'd need to have
  // already saved these or fetch them from the page)
  const chats = []; // Placeholder for actual chat data

  let exportData;

  if (format === "json") {
    exportData = JSON.stringify(chats, null, 2);
  } else {
    // Default to text format
    exportData = chats
      .map((chat) => {
        return `CHAT: ${chat.title}\n\n${chat.messages
          .map((msg) => {
            return `${msg.role}: ${msg.content}`;
          })
          .join("\n\n")}\n\n---\n\n`;
      })
      .join("");
  }

  // Create a download for the user
  const blob = new Blob([exportData], {
    type: format === "json" ? "application/json" : "text/plain",
  });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url: url,
    filename: `chatgpt-export-${new Date()
      .toISOString()
      .slice(0, 10)}.${format}`,
    saveAs: true,
  });

  // Clean up the blob URL after download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { message: "Export complete", count: chatIds.length };
}

// Save image to the user's gallery
async function saveImageToGallery(imageData, chatId) {
  const { savedImages } = await chrome.storage.local.get("savedImages");
  const images = savedImages || [];

  const newImage = {
    id: Date.now().toString(),
    data: imageData,
    chatId: chatId,
    timestamp: new Date().toISOString(),
    tags: [],
  };

  images.push(newImage);

  await chrome.storage.local.set({ savedImages: images });
  return newImage.id;
}

// Function for migrating from legacy data format if needed
function migrateFromLegacyFormat() {
  // Logic to handle data migration between versions
  console.log("Migrating from legacy data format");
}
