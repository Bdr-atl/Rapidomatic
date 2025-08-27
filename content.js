(function rapidomatic() {
    const MAX_RETRIES = 3; // Maximum number of retries
    let retryCount = 0;    // Retry counter

    const initScript = () => {
        if (chrome.runtime && chrome.runtime.id) {
            console.log("Extension context is valid. Initializing script...");
            runMainLogic(); // Main script logic
        } else {
            console.error("Extension context is invalid. Retrying...");
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                setTimeout(initScript, 1000); // Retry after 1 second
            } else {
                console.error("Maximum retries reached. Script initialization failed.");
            }
        }
    };

    const runMainLogic = () => {

        const debounce = (func, wait) => {
            let timeout;
            return function () {
                const later = () => {
                    timeout = null;
                    func.apply(this, arguments);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        const formatTime = () => {
            const now = new Date();
            return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        };

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatText = (text) => {
    return typeof text === 'object' ? JSON.stringify(text) : text;
};

const insertTextAndDate = async () => {
    const focusedElement = document.activeElement;

    if (
        focusedElement &&
        (focusedElement.tagName.toLowerCase() === 'textarea' || 
        (focusedElement.tagName.toLowerCase() === 'input' && focusedElement.type === 'text')) &&
        !focusedElement.readOnly
    ) {
        console.log("Text Area: Selected");

        // Fetch replacements from Chrome storage
        const { textReplacements } = await chrome.storage.local.get('textReplacements') || {};
        if (!textReplacements) {
            console.log("No text replacements found.");
            return;
        }

        let currentValue = focusedElement.value;
        let replaced = false;

        // Loop through all text replacements
        for (const [pattern, replacement] of Object.entries(textReplacements)) {
            const regexPattern = new RegExp(`${escapeRegExp(pattern)}`, 'g'); // No word boundaries now
            const formattedReplacement = formatText(replacement);

            // Test if the pattern exists in the current value
            if (regexPattern.test(currentValue)) {
                currentValue = currentValue.replace(regexPattern, formattedReplacement);
                replaced = true;
            }
        }

        if (replaced) {
            focusedElement.value = currentValue;
            focusedElement.setSelectionRange(currentValue.length, currentValue.length);
            focusedElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            focusedElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            console.log("Text replaced in input/textarea.");
        } else {
            console.log("No patterns matched for replacement in input/textarea.");
        }

    } else {
        // No form element is focused, so apply replacement to the entire document body
        const emailBody = document.body;

        if (emailBody) {
            console.log("HTML Body: Found");

            // Fetch replacements from Chrome storage
            const { textReplacements } = await chrome.storage.local.get('textReplacements') || {};
            if (!textReplacements) {
                console.log("No text replacements found.");
                return;
            }

            let replaced = false;

            // Loop through all text replacements
            for (const [pattern, replacement] of Object.entries(textReplacements)) {
                const regexPattern = new RegExp(`${escapeRegExp(pattern)}`, 'g'); // Create the regex pattern
                const currentDate = new Date().toLocaleDateString(); // Get the current date
                const formattedReplacement = `${replacement} ${currentDate}`; // Append date to the replacement

                // Search for the pattern in the HTML body text (this works for text inside elements)
                if (regexPattern.test(emailBody.innerHTML)) {
                    // Replace the matching text with the formatted replacement
                    emailBody.innerHTML = emailBody.innerHTML.replace(regexPattern, formattedReplacement);
                    replaced = true;
                }
            }

            if (replaced) {
                console.log("Text replaced in HTML body.");
            } else {
                console.log("No patterns matched for replacement in the email body.");
            }
        }
    }
};

// Debounce typing to handle replacements efficiently
let typingTimer;
const doneTypingInterval = 300;

const handleKeyUp = async () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(async () => {
        const focusedElement = document.activeElement;

        if (!focusedElement || !('value' in focusedElement)) {
            console.log("Text Area: Not Found");
            return;
        }

        const currentValue = focusedElement.value || "";

        // Fetch replacements from storage
        const storageData = await chrome.storage.local.get('textReplacements');
        const textReplacements = storageData.textReplacements || {};

        if (!textReplacements || typeof textReplacements !== 'object') {
            console.log("No valid text replacements found.");
            return;
        }

        // Check for patterns in the current value
        for (const pattern in textReplacements) {
            if (typeof pattern !== "string") continue; // Ensure pattern is a string
            if (currentValue.includes(pattern)) {
                await insertTextAndDate();
                break;
            }
        }
    }, doneTypingInterval);
};


const handleKeyDown = () => {
    clearTimeout(typingTimer);
};

// Add event listeners for key events
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('keydown', handleKeyDown);


    // Convert these functions to async
    const insertCustomTextAndDate = async (storageKeyPrefix) => {
        const data = await chrome.storage.local.get(['customText1', 'customMessage1', 'customMessage2']);
        const customText1 = data.customText1 || 'Vos Initiales';
        const customMessage1 = data.customMessage1 || '';
        const customMessage2 = data.customMessage2 || '';
        const focusedElement = document.activeElement;

        if (focusedElement && (focusedElement.tagName.toLowerCase() === 'textarea' || (focusedElement.tagName.toLowerCase() === 'input' && focusedElement.type === 'text')) && !focusedElement.readOnly) {
            const currentDate = new Date().toLocaleDateString();
            const currentTime = formatTime();
            const template = `${customText1} le ${currentDate} à ${currentTime}`;

            const existingText = focusedElement.value;
            const lastInsertedPattern = existingText.match(/§(\d+)/g); // Find all §X occurrences
            let numberToInsert = 1;

            if (lastInsertedPattern) {
                const lastNumber = parseInt(lastInsertedPattern[lastInsertedPattern.length - 1].replace('§', ''), 10);
                numberToInsert = lastNumber + 1;
            }

            const textToInsert1 = customMessage1
                ? `[ §${numberToInsert} ]  ---[  ${template}  ]---\n${customMessage1}`
                : `[ §${numberToInsert} ]  ---[  ${template}  ]---\n`;

            const textToInsert2 = customMessage2
                ? `[ §${numberToInsert} ]  ---[  ${template}  ]---\n${customMessage2}`
                : `[ §${numberToInsert} ]  ---[  ${template}  ]---\n`;

            const textToInsert = storageKeyPrefix === 'customText1' ? textToInsert1 : textToInsert2;

            const startPos = focusedElement.selectionStart;
            const endPos = focusedElement.selectionEnd;

            focusedElement.value = focusedElement.value.substring(0, startPos) + textToInsert + focusedElement.value.substring(endPos);

            focusedElement.selectionStart = focusedElement.selectionEnd = startPos + textToInsert.length;

            focusedElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            focusedElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

            console.log(`Text inserted`);
        } else {
            console.log("Text Area: Not Found");
        }
    };

    const insertTextBasedOnModel = (model) => {
        if (model === 'model1') {
            insertCustomTextAndDate('customText1');
        } else if (model === 'model2') {
            insertCustomTextAndDate('customMessage2');
        }
    };

    const insertTextAndDate1 = () => insertTextBasedOnModel('model1');
    const insertTextAndDate2 = () => insertTextBasedOnModel('model2');

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'q') {
            console.log('Ctrl+Q detected');
            insertTextAndDate1();
        } else if (event.altKey && event.key === 'q') {
            console.log('Alt+Q detected');
            insertTextAndDate2();
        }
        });

    //    setTimeout(addEventListeners, 1000);
    };

    initScript();  // Initialize the script

  // Reload the script every 5 minutes (300000 ms)
setInterval(() => {
    console.log('Script logic reloaded after 5 minutes.');
    
    // Place your script's actual functionality here
    executeLogic();
}, 300000);

// Main logic function
function executeLogic() {
    console.log('Executing script logic...');
    // Your custom logic goes here
}
})();