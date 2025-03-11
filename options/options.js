// Load saved settings
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('settings', (data) => {
        const settings = data.settings || {};
        
        // Set initial values
        document.getElementById('theme').value = settings.theme || 'auto';
        document.getElementById('defaultExportFormat').value = settings.defaultExportFormat || 'txt';
    });
});

// Save settings when changed
document.getElementById('theme').addEventListener('change', (e) => {
    chrome.storage.local.get('settings', (data) => {
        const settings = data.settings || {};
        settings.theme = e.target.value;
        chrome.storage.local.set({ settings });
    });
});

document.getElementById('defaultExportFormat').addEventListener('change', (e) => {
    chrome.storage.local.get('settings', (data) => {
        const settings = data.settings || {};
        settings.defaultExportFormat = e.target.value;
        chrome.storage.local.set({ settings });
    });
});