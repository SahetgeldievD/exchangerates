const api_url = 'https://www.cbr-xml-daily.ru/daily_json.js';

document.addEventListener('DOMContentLoaded', function() {
  const table_body = document.querySelector('#rates-body');
  if (table_body) {
    fetch(api_url)
      .then(response => response.json())
      .then(data => {
        const rates = data.Valute;
        Object.keys(rates).forEach(key => {
          const rate = rates[key];
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${rate.CharCode}</td>
            <td>${rate.Name}</td>
            <td>${rate.Value}</td>
            <td>
              ${rate.Value > rate.Previous ? '<span style="color: green;">▲</span>' : '<span style="color: red;">▼</span>'}
            </td>
          `;
          table_body.appendChild(row);
        });
      })
      .catch(error => console.error(error));
  } else {
    console.error('Элемент #rates-body не найден');
  }
});