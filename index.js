const api_url = 'https://www.cbr-xml-daily.ru/daily_json.js';

document.addEventListener('DOMContentLoaded', function() {
  const table_body = document.querySelector('#rates-body');
  const export_btn = document.querySelector('#export-btn');
  
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

  if (export_btn) {
    export_btn.addEventListener('click', function() {
      let csvContent = '\ufeff'; // Добавляем BOM для правильного определения кодировки
      const rows = document.querySelectorAll('#rates-table tr');
  
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        // Обрабатываем каждую ячейку строки
        const rowContent = Array.from(cells)
          .slice(0, 3) // Берём только первые три колонки
          .map(cell => `"${cell.textContent.replace(/"/g, '""')}"`) // Экранируем кавычки
          .join(';'); // Разделяем значения запятой
        csvContent += rowContent + '\n'; // Добавляем строку в CSV
      });
  
      const blob = new Blob([csvContent], { type: 'text/csv;charset=windows-1251;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'currency_rates.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  } else {
    console.error('Кнопка экспорта не найдена');
  } 
});
