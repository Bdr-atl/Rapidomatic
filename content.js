// Immediately Invoked Function Expression (IIFE) to encapsulate the script
(function() {
	// règles:
	// pas de .r .net .com etc ( pensez aux effets de bord) 
	// minimum 2 carractère après le carratère spécial 
	// faire les raccourcis en minuscules
    const textReplacementsCTCLRY = {
        '.cz': "Code PIN:\nAdresse  mail:\nCause de l'appel:\nVersion app:\nOS Téléphone:\nModèle de Box:\nNom réseau wifi:\nDistance de la box:\nFréquence:\n",
	'.chod': "Date de mise en service:\nPosé à la:\nAlimenté en:\nPlus d'EC depuis:\nEtat des voyants:\nEntretien:\nPrésence d'un limiteur:\nPrésence d'un adoucisseur:\nApizee:",
	'.cet': "Date de mise en service:\nCause de l'appel:\nType de gainage:\nEntretien PAC:\nHistorique des erreurs:\n",
        '.test': "test CTC",
	'.ge': "Merci d'envoyer en GE + Coupon T :\n\n\nStock ok\nAdresse ok\n",
	//'.301': "T\n1x ref: \n\nStock ok\nAdresse ok\n",
	//'.503': "",
	'.avg': "Merci d'envoyer en AVG + Coupon T :\n\n\nStock ok\nAdresse ok\n",
        '.ko': "3 appels, pas de réponse \nLaissé message\n",
        '.sinistre': "Date d'installation: \nDate du sinistre: \nType de câble alimentation et section : \nType de borne de raccordement : \nInstallation neuve ou remplacement : \nType de logement: \nLocalisation du chauffe-eau dans le logement: \nEntretien oui/non, date: \nSi Adouccisseur oui/non et réglage: \nBac de rétention Oui/Non:\n Faire notif Valérie Moreau + photo et/ou Apizee",
        '.diag': "Date de Mise en service: \nProblème depuis: \nCause: \nDiagnostique: \n\n\nSTP envoyer  + Coupon T \n\nStock ok\nAdresse ok\n"
    };

    const textReplacementsCRCGPLRY = {
        '.cz': "Code PIN: \nAdresse mail du client: \nCode Produit: \n",
        '.test': "test CRC GP",
	'.rap': "Tech, Merci de Rappeler SVP sur portable",
        '.sinistre': "Date d'installation: \nDate du sinistre: \nType de câble alimentation et section : \nType de borne de raccordement : \nInstallation neuve ou remplacement : \nType de logement: \nLocalisation du chauffe-eau dans le logement: \nEntretien oui/non, date: \nSi Adouccisseur oui/non et réglage: \nBac de rétention Oui/Non:\n Faire notif Valérie Moreau + photo et/ou Apizee",
    };

    const textReplacementsCRCPROLRY = {
        '.coz': "Code PIN: \nAdresse mail du client: \nProduit: \n",
        '.test': "test CRC PRO",
	'.ge': "Envoi en GE \nAdresse OK \n",
	'.rap': "Tech, Merci de Rappeler SVP sur portable",
        '.sinistre': "Date d'installation: \nDate du sinistre: \nType de câble alimentation et section : \nType de borne de raccordement : \nInstallation neuve ou remplacement : \nType de logement: \nLocalisation du chauffe-eau dans le logement: \nEntretien oui/non, date: \nSi Adouccisseur oui/non et réglage: \nBac de rétention Oui/Non:\n Faire notif Valérie Moreau + photo et/ou Apizee",
    };
    const textReplacementsATLCONSOLRY = {
        '.coz': "Code PIN: \nAdresse mail du client: \nProduit: \n",
        '.test': "test CONSO",
        '.ko': "3 appels, pas de réponse \nLaissé message\n",
    };
	chrome.storage.local.set({
  	  textReplacementsCTCLRY,
  	  textReplacementsCRCGPLRY,
  	  textReplacementsCRCPROLRY,
  	  textReplacementsATLCONSOLRY
	});

    // Function to format time in HH:MM
    const formatTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    // Function to insert text and date based on patterns
    const insertTextAndDate = () => {
        console.log("insertTextAndDate function called...");

        const focusedElement = document.activeElement;
        if (focusedElement && (focusedElement.tagName.toLowerCase() === 'textarea' || (focusedElement.tagName.toLowerCase() === 'input' && focusedElement.type === 'text')) && !focusedElement.readOnly) {
            console.log("Focused element is a valid input/textarea...");

            chrome.storage.local.get(['selectedTeam'], (data) => {
                const team = data.selectedTeam || 'textReplacementsCTCLRY';
                const textReplacements = {
                    'textReplacementsCTCLRY': textReplacementsCTCLRY,
                    'textReplacementsCRCGPLRY': textReplacementsCRCGPLRY,
                    'textReplacementsCRCPROLRY': textReplacementsCRCPROLRY,
		    'textReplacementsATLCONSOLRY': textReplacementsATLCONSOLRY
                }[team];

                let currentValue = focusedElement.value;
                let replaced = false;

                for (const [pattern, customText] of Object.entries(textReplacements)) {
                    if (currentValue.includes(pattern)) {
                        currentValue = currentValue.replace(new RegExp(escapeRegExp(pattern), 'g'), customText);
                        replaced = true;
                        console.log(`Pattern '${pattern}' replaced with custom text.`);
                        break; // Stop after the first replacement
                    }
                }

                if (replaced) {
                    focusedElement.value = currentValue;
                    focusedElement.setSelectionRange(currentValue.length, currentValue.length);
                    focusedElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                    focusedElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                    console.log(`Text inserted: ${currentValue}`);
                } else {
                    console.log("No replacement made. Patterns not found.");
                }
            });
        } else {
            console.log("Focused element is not a valid input/textarea or is read-only.");
        }
    };

    // Escape special characters for regex
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Handle key events
    let typingTimer;
    const doneTypingInterval = 300;

    const handleKeyUp = () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(insertTextAndDate, doneTypingInterval);
    };

    const handleKeyDown = () => {
        clearTimeout(typingTimer);
    };

    // Add event listeners to textareas and inputs
    const addEventListeners = () => {
        console.log("Adding event listeners to textareas and inputs...");
        document.querySelectorAll('textarea.slds-textarea, input[type="text"]').forEach(input => {
            input.removeEventListener('keyup', handleKeyUp);
            input.removeEventListener('keydown', handleKeyDown);
            input.addEventListener('keyup', handleKeyUp);
            input.addEventListener('keydown', handleKeyDown);
        });
        console.log("Event listeners added.");
    };

    // Observe DOM changes
    const observer = new MutationObserver(() => {
        console.log("Mutation detected...");
        addEventListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM content loaded...");
        addEventListeners();
    });

    setTimeout(addEventListeners, 1000);

    // Add event listener for key combinations
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'q') {
            console.log('Ctrl+Q detected');
            insertTextAndDate1();
        } else if (event.altKey && event.key === 'q') {
            console.log('Alt+Q detected');
            insertTextAndDate2();
        }
    });

    // Function to insert custom text and date
    const insertCustomTextAndDate = (storageKeyPrefix) => {
        chrome.storage.local.get(['customText1', 'customMessage1', 'customMessage2'], (data) => {
            const customText1 = data.customText1 || 'Vos Initiales';
            const customMessage1 = data.customMessage1 || '';
            const customMessage2 = data.customMessage2 || '';
            const focusedElement = document.activeElement;

            if (focusedElement && (focusedElement.tagName.toLowerCase() === 'textarea' || (focusedElement.tagName.toLowerCase() === 'input' && focusedElement.type === 'text')) && !focusedElement.readOnly) {
                const currentDate = new Date().toLocaleDateString();
                const currentTime = formatTime();
                const template = `${customText1} le ${currentDate} à ${currentTime}`;
                const textToInsert1 = customMessage1
                    ? `\n---[  ${template}  ]---\n${customMessage1}\n`
                    : `\n---[  ${template}  ]---\nDate de Mise en service: \nProblème depuis: \nCause: \nDiagnostique:`;
                const textToInsert2 = customMessage2
                    ? `\n---[  ${template}  ]---\n${customMessage2}\n`
                    : `\n---[  ${template}  ]---\n`;

                const textToInsert = storageKeyPrefix === 'customText1' ? textToInsert1 : textToInsert2;
                console.log(`Inserting text: ${textToInsert}`);
                focusedElement.value += textToInsert;
                focusedElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                focusedElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                console.log(`Text added: ${textToInsert} in field with class: ${focusedElement.className}`);
            } else {
                console.log("Focused element is not a valid input/textarea or is read-only.");
            }
        });
    };

    // Function to insert text based on model selection
    const insertTextBasedOnModel = (model) => {
        if (model === 'model1') {
            insertCustomTextAndDate('customText1');
        } else if (model === 'model2') {
            insertCustomTextAndDate('customMessage2');
        }
    };

    // Insert custom text and date based on model
    const insertTextAndDate1 = () => insertTextBasedOnModel('model1');
    const insertTextAndDate2 = () => insertTextBasedOnModel('model2');
})();
