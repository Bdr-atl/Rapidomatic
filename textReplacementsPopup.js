document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const team = urlParams.get('team');

    chrome.storage.local.get(team, (data) => {
        const replacements = data[team];

        const replacementsContainer = document.getElementById('replacementsContainer');

        if (replacements) {
            for (const key in replacements) {
                if (replacements.hasOwnProperty(key)) {
                    const div = document.createElement('div');
                    div.className = 'replacement';
                    div.innerHTML = `<strong>${key}</strong><br>${replacements[key].replace(/\n/g, '<br>')}`;
                    replacementsContainer.appendChild(div);
                }
            }
        } else {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'reload-message';
            messageDiv.innerHTML = '<strong>Veuillez recharger la page Salesforce.</strong>';
            replacementsContainer.appendChild(messageDiv);
        }
    });
});