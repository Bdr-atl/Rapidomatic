document.addEventListener('DOMContentLoaded', () => {
    // Function to update version from manifest.json
    const updateVersion = () => {
        const versionElement = document.querySelector('.version');
        if (versionElement) {
            const manifestData = chrome.runtime.getManifest();
            versionElement.textContent = `Version: ${manifestData.version}`;
        }
    };

    updateVersion(); // Call the function to set the version on load

    // Utility to save a key-value pair to chrome.storage.local
    const saveToStorage = (key, value) => {
        chrome.storage.local.set({ [key]: value }, () => {
            console.log(`Saved ${key}:`, value);
        });
    };

    // Utility to load a key from chrome.storage.local
    const loadFromStorage = (keys, callback) => {
        chrome.storage.local.get(keys, callback);
    };

    // Initialize form fields with saved data
    const initializeFields = () => {
        loadFromStorage(
            ['customText1', 'customMessage1', 'customMessage2', 'selectedModel', 'textReplacements', 'fileLoaded'],
            (data) => {
                document.getElementById('customText1').value = data.customText1 || '';
                document.getElementById('customMessage1').value = data.customMessage1 || '';
                document.getElementById('customMessage2').value = data.customMessage2 || '';

                const selectedModel = data.selectedModel || 'model1';
                switchModel(selectedModel);

                updateFileLoadedState(data.fileLoaded);
                updateReplacementsList(data.textReplacements);
            }
        );
    };

    // Update UI for file loaded state
    const updateFileLoadedState = (fileLoaded) => {
        const fileLoadedMessage = document.getElementById('fileLoadedMessage');
        const uploadButton = document.getElementById('uploadExcel');
        if (fileLoaded) {
            fileLoadedMessage.style.display = 'block';
            uploadButton.classList.add('disabled');
        } else {
            fileLoadedMessage.style.display = 'none';
            uploadButton.classList.remove('disabled');
        }
    };

    // Update text replacements list
    const updateReplacementsList = (replacements) => {
        const replacementsList = document.getElementById('replacementsList');
        if (replacementsList) {
            replacementsList.innerHTML = replacements
                ? Object.entries(replacements).map(([key, value]) => `<li>${key} → ${value}</li>`).join('')
                : '<li>No replacements found. Please upload an Excel file.</li>';
        }
    };

    // Switch between models
    const switchModel = (model) => {
        document.getElementById('model1').classList.toggle('active', model === 'model1');
        document.getElementById('model2').classList.toggle('active', model === 'model2');
        document.getElementById('model1Button').classList.toggle('active', model === 'model1');
        document.getElementById('model2Button').classList.toggle('active', model === 'model2');

        saveToStorage('selectedModel', model);
    };

    // Handle Excel file upload
    const handleExcelUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const parsedData = parseExcel(data);
            const replacements = processExcelData(parsedData);

            saveToStorage('textReplacements', replacements);
            saveToStorage('fileLoaded', true);

            updateFileLoadedState(true);
            updateReplacementsList(replacements);
        };

        reader.readAsBinaryString(file);
    };

    // Parse Excel data
    const parseExcel = (data) => {
        const workbook = XLSX.read(data, { type: 'binary' });
        return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
    };

    // Process Excel data into a key-value map
    const processExcelData = (data) => {
        const replacements = {};
        for (let i = 1; i < data.length; i++) {
            const [key, value] = data[i];
            if (key && value) {
                replacements[key] = value;
            }
        }
        return replacements;
    };

    // Event listener for text input and textarea changes
    const addInputListeners = () => {
        ['customText1', 'customMessage1', 'customMessage2'].forEach((id) => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('input', () => saveToStorage(id, field.value));
            }
        });
    };

    // Event listener for model switching
    const addModelSwitchListeners = () => {
        document.getElementById('model1Button').addEventListener('click', () => switchModel('model1'));
        document.getElementById('model2Button').addEventListener('click', () => switchModel('model2'));
    };

    // Event listener for viewing replacements
let aideMemoireWindow = null; // Global reference to the popup window

const addViewReplacementsListener = () => {
    document.getElementById('viewReplacementsButton').addEventListener('click', () => {
        chrome.storage.local.get(['textReplacements'], (result) => {
            if (result.textReplacements && Object.keys(result.textReplacements).length > 0) {
                // Check if the popup is already open
                if (aideMemoireWindow && !aideMemoireWindow.closed) {
                    aideMemoireWindow.focus(); // Bring existing window to front
                    return;
                }

                // Open a new popup
                aideMemoireWindow = window.open(
                    'aide-memoire.html',
                    'aideMemoirePopup',
                    'width=400,height=500,top=100,left=100,resizable=yes'
                );

                // Resize dynamically after loading
                setTimeout(() => {
                    if (aideMemoireWindow) {
                        aideMemoireWindow.resizeTo(
                            aideMemoireWindow.document.body.scrollWidth + 20,
                            aideMemoireWindow.document.body.scrollHeight + 20
                        );
                    }
                }, 500);
            } else {
                alert('No text replacements found. Please upload an Excel file first.');
            }
        });
    });
};

    // Initialize everything
    initializeFields();
    addInputListeners();
    addModelSwitchListeners();
    addViewReplacementsListener();

    // Ensure file upload event listener is added only if the element exists
    const uploadExcel = document.getElementById('uploadExcel');
    if (uploadExcel) {
        uploadExcel.addEventListener('change', handleExcelUpload);
    }
});
