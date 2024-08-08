document.addEventListener('DOMContentLoaded', () => {
    // Load existing values
    chrome.storage.local.get(['customText1', 'customMessage1', 'customMessage2', 'selectedTeam'], (data) => {
        document.getElementById('customText1').value = data.customText1 || '';
        document.getElementById('customMessage1').value = data.customMessage1 || '';
        document.getElementById('customMessage2').value = data.customMessage2 || '';

        // Set the selected option in the dropdown
        const teamSelector = document.getElementById('teamSelector');
        teamSelector.value = data.selectedTeam || 'textReplacementsCTCLRY';

        // Set the active model based on saved selection
        const selectedModel = data.selectedModel || 'model1';
        switchModel(selectedModel);
    });

    // Initialize model buttons and contents
    const model1Button = document.getElementById('model1Button');
    const model2Button = document.getElementById('model2Button');
    const model1Content = document.getElementById('model1');
    const model2Content = document.getElementById('model2');

    // Function to switch between models
    const switchModel = (model) => {
        if (model === 'model1') {
            model1Content.classList.add('active');
            model2Content.classList.remove('active');
            model1Button.classList.add('active');
            model2Button.classList.remove('active');
        } else if (model === 'model2') {
            model2Content.classList.add('active');
            model1Content.classList.remove('active');
            model2Button.classList.add('active');
            model1Button.classList.remove('active');
        }
    };

    model1Button.addEventListener('click', () => switchModel('model1'));
    model2Button.addEventListener('click', () => switchModel('model2'));

    document.getElementById('saveButton').addEventListener('click', () => {
        const activeModel = document.querySelector('.model-content.active').id;
        const customText1 = document.getElementById('customText1').value;
        const customMessage1 = document.getElementById('customMessage1').value;
        const customMessage2 = document.getElementById('customMessage2').value;
        const selectedTeam = document.getElementById('teamSelector').value;

        let storageData = { 
            selectedModel: activeModel,
            selectedTeam: selectedTeam // Save the selected team
        };
        if (activeModel === 'model1') {
            storageData.customText1 = customText1;
            storageData.customMessage1 = customMessage1;
        } else if (activeModel === 'model2') {
            storageData.customMessage2 = customMessage2;
        }

        // Save values to storage
        chrome.storage.local.set(storageData, () => {
            console.log('Custom texts and messages saved:', storageData);

            // Change button color and reset after 500ms
            const saveButton = document.getElementById('saveButton');
            saveButton.classList.add('clicked');
            setTimeout(() => saveButton.classList.remove('clicked'), 500);
        });
    });

    // Store the popup window ID
    let popupWindowId = null;

    // Open text replacements popup
    document.getElementById('viewReplacementsButton').addEventListener('click', () => {
        chrome.storage.local.get('selectedTeam', (data) => {
            const selectedTeam = data.selectedTeam || 'textReplacementsCTCLRY';
            const popupUrl = `textReplacementsPopup.html?team=${selectedTeam}`;

            if (popupWindowId) {
                chrome.windows.get(popupWindowId, (window) => {
                    if (chrome.runtime.lastError || !window) {
                        // If the window does not exist, create a new one
                        createPopupWindow(popupUrl);
                    } else {
                        // If the window exists, bring it to focus
                        chrome.windows.update(popupWindowId, { focused: true });
                    }
                });
            } else {
                // Create a new popup window
                createPopupWindow(popupUrl);
            }
        });
    });

    const createPopupWindow = (url) => {
        chrome.windows.create({
            url: url,
            type: 'popup',
            width: 400,
            height: 600
        }, (window) => {
            popupWindowId = window.id;
        });
    };
});
