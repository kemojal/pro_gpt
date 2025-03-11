// popup.js - Script for the popup interface

// Load user settings and stats when popup opens
document.addEventListener("DOMContentLoaded", function () {
  // Get references to UI elements
  const openToolboxBtn = document.getElementById("openToolbox");
  const newPromptBtn = document.getElementById("newPrompt");
  const openSettingsBtn = document.getElementById("openSettings");
  const folderPinsToggle = document.getElementById("folderPins");
  const collapseSectionsToggle = document.getElementById("collapseSections");
  const rtlSupportToggle = document.getElementById("rtlSupport");
  const savedConversationsElement =
    document.getElementById("savedConversations");
  const customPromptsElement = document.getElementById("customPrompts");
  const helpLink = document.getElementById("helpLink");
  const feedbackLink = document.getElementById("feedbackLink");
  const privacyLink = document.getElementById("privacyLink");

  // Load settings and update UI
  loadSettings();
  loadStats();

  // Add event listeners
  openToolboxBtn.addEventListener("click", openToolbox);
  newPromptBtn.addEventListener("click", openNewPromptDialog);
  openSettingsBtn.addEventListener("click", openSettingsPage);

  // Toggle settings listeners
  folderPinsToggle.addEventListener("change", updateSetting);
  collapseSectionsToggle.addEventListener("change", updateSetting);
  rtlSupportToggle.addEventListener("change", updateSetting);

  // Link event listeners
  helpLink.addEventListener("click", openHelpPage);
  feedbackLink.addEventListener("click", openFeedbackPage);
  privacyLink.addEventListener("click", openPrivacyPage);
});

// Load user settings from storage
function loadSettings() {
  chrome.storage.local.get("settings", function (data) {
    if (data.settings) {
      document.getElementById("folderPins").checked =
        data.settings.showFolderPins !== false;
      document.getElementById("collapseSections").checked =
        data.settings.collapseGPTSections !== false;
      document.getElementById("rtlSupport").checked =
        data.settings.rtlEnabled === true;
    }
  });
}

// Load usage statistics
function loadStats() {
  chrome.storage.local.get(["folders", "prompts"], function (data) {
    // Count saved conversations
    let conversationCount = 0;
    if (data.folders && Array.isArray(data.folders)) {
      data.folders.forEach((folder) => {
        if (folder.chats && Array.isArray(folder.chats)) {
          conversationCount += folder.chats.length;
        }
      });
    }

    // Count custom prompts
    let promptCount = 0;
    if (data.prompts && Array.isArray(data.prompts)) {
      // Filter to only include user-created prompts (not default ones)
      promptCount = data.prompts.filter((prompt) => prompt.isCustom).length;
    }

    // Update UI
    document.getElementById("savedConversations").textContent =
      conversationCount;
    document.getElementById("customPrompts").textContent = promptCount;
  });
}

// Update a setting when toggled
function updateSetting(event) {
  const settingId = event.target.id;
  const isChecked = event.target.checked;

  chrome.storage.local.get("settings", function (data) {
    const settings = data.settings || {};

    // Update the specific setting
    switch (settingId) {
      case "folderPins":
        settings.showFolderPins = isChecked;
        break;
      case "collapseSections":
        settings.collapseGPTSections = isChecked;
        break;
      case "rtlSupport":
        settings.rtlEnabled = isChecked;
        break;
    }

    // Save updated settings
    chrome.storage.local.set({ settings: settings }, function () {
      // Notify content script about the settings change
      sendMessageToActiveTab({
        action: "settingsUpdated",
        settings: settings,
      });
    });
  });
}

// Open the ChatGPT toolbox interface in the active tab
function openToolbox() {
  sendMessageToActiveTab({ action: "openToolbox" });
  window.close(); // Close the popup
}

// Open the new prompt dialog
function openNewPromptDialog() {
  sendMessageToActiveTab({ action: "openNewPromptDialog" });
  window.close(); // Close the popup
}

// Open the settings page
function openSettingsPage() {
  chrome.runtime.openOptionsPage();
  window.close(); // Close the popup
}

// Helper function to send a message to the active tab
function sendMessageToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    }
  });
}

// Open external pages
function openHelpPage() {
  chrome.tabs.create({ url: "https://example.com/chatgpt-toolbox/help" });
}

function openFeedbackPage() {
  chrome.tabs.create({ url: "https://example.com/chatgpt-toolbox/feedback" });
}

function openPrivacyPage() {
  chrome.tabs.create({ url: "https://example.com/chatgpt-toolbox/privacy" });
}
