document.addEventListener('DOMContentLoaded', () => {
    const replacementsTableBody = document.querySelector('#replacementsTable tbody');
    const messageDiv = document.getElementById('message');

    // Fetch text replacements from Chrome storage
    chrome.storage.local.get(['textReplacements'], (result) => {
        const replacements = result.textReplacements;

        if (replacements && Object.keys(replacements).length > 0) {
            // Populate the table with replacements
            Object.entries(replacements).forEach(([pattern, replacement]) => {
                const row = document.createElement('tr');
                const patternCell = document.createElement('td');
                const replacementCell = document.createElement('td');

                patternCell.textContent = pattern;
                replacementCell.textContent = replacement;

                row.appendChild(patternCell);
                row.appendChild(replacementCell);
                replacementsTableBody.appendChild(row);
            });
        } else {
            // Show message if no replacements are found
            messageDiv.textContent = 'No text replacements found. Please upload an Excel file.';
            messageDiv.style.color = 'red';
        }
    });
});
