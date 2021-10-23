/**
 * Helper to generate table rows
 * -----------------------------
 */

function generateRow(data, tbodyElement) {
    const row = document.createElement('tr');
    row.setAttribute('class', 'table-row');
    row.innerHTML = data.map(c => `<td>${c}</td>`).join('');
    tbodyElement.appendChild(row);
}

export { generateRow };
