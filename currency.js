 const alert = (info) => window.alert(info);

 const query = (baseCurrency, targetCurrency, fromDate, toDate) =>
     fetch(`https://api.frankfurter.app/${fromDate}..${toDate}?from=${baseCurrency}&to=${targetCurrency}`)
     .then(response => response.json())
     .then(({ error, rates }) => {

         if (error) {
             throw new Error(error);
         }

         return Object
             .entries(rates)
             .map(([date, rate]) => ({ date: new Date(date), rate: Math.floor(1000 * rate[targetCurrency]) / 1000 }))
             .sort(({ date: x }, { date: y }) => x < y ? -1 : x > y ? 1 : 0)
     });
 const renderGraph = (baseCurrency, targetCurrency, fromDate, toDate) => {
     if (!baseCurrency || !targetCurrency || !fromDate || !toDate) {
         return;
     }

     const svg = d3.select("#graph-container").select('svg');
     svg.attr('width', null).attr('height', null);
     svg.selectAll('*').remove();

     query(baseCurrency, targetCurrency, fromDate, toDate)
         .then(dataset => {
             let
                 width = document.getElementById('graph-container').clientWidth,
                 height = document.getElementById('graph-container').clientHeight,
                 padding = 50;

             if (height > width) {

                 height = width;
             }

             const
                 xScale = d3
                 .scaleTime()
                 .domain([d3.min(dataset, ({ date }) => date), d3.max(dataset, ({ date }) => date)])
                 .range([padding, width - padding]),
                 yScale = d3
                 .scaleLinear()
                 .domain([d3.min(dataset, ({ rate }) => rate), d3.max(dataset, ({ rate }) => rate)])
                 .range([height - padding, padding]);

             svg.attr("width", width).attr("height", height);

             svg
                 .append("g")
                 .attr("transform", `translate(0,${height - padding})`)
                 .call(d3.axisBottom(xScale));

             svg
                 .append("g")
                 .attr("transform", `translate(${padding},0)`)
                 .call(d3.axisLeft(yScale));

             svg
                 .append("path")
                 .datum(dataset)
                 .attr("fill", "none")
                 .attr("stroke", "green")
                 .attr("stroke-width", 5.0)
                 .attr("stroke-linejoin", "milter")
                 .attr("stroke-linecap", "round")
                 .attr("d", d3.line().x(({ date }) => xScale(date)).y(({ rate }) => yScale(rate)));

             const tooltip = svg.append('g').attr('display', 'none');

             const tooltipRatio = 0.8;

             tooltip
                 .append('rect')
                 .attr('width', 220 * tooltipRatio)
                 .attr('height', 60 * tooltipRatio)
                 .attr('fill', 'rgba(255, 255, 255, 0.9)')
                 .attr('stroke', 'black')
                 .attr('stroke-width', 1)
                 .attr('x', -110 * tooltipRatio)
                 .attr('y', -30 * tooltipRatio);

             tooltip
                 .append('line')
                 .attr('x1', 0)
                 .attr('y1', -30 * tooltipRatio)
                 .attr('x2', 0)
                 .attr('y2', -10000)
                 .attr('stroke-width', 1.0)
                 .attr('stroke', 'black')
                 .attr('stroke-dasharray', '5,5');

             tooltip
                 .append('line')
                 .attr('x1', 0)
                 .attr('y1', 30 * tooltipRatio)
                 .attr('x2', 0)
                 .attr('y2', 10000)
                 .attr('stroke-width', 1.0)
                 .attr('stroke', 'black')
                 .attr('stroke-dasharray', '5,5');

             tooltip
                 .append('line')
                 .attr('x1', -110 * tooltipRatio)
                 .attr('y1', 0)
                 .attr('x2', -10000)
                 .attr('y2', 0)
                 .attr('stroke-width', 1.0)
                 .attr('stroke', 'black')
                 .attr('stroke-dasharray', '5,5');

             tooltip
                 .append('line')
                 .attr('x1', 110 * tooltipRatio)
                 .attr('y1', 0)
                 .attr('x2', 10000)
                 .attr('y2', 0)
                 .attr('stroke-width', 1.0)
                 .attr('stroke', 'black')
                 .attr('stroke-dasharray', '5,5');

             const tooltipTextRows = [
                 tooltip
                 .append('text')
                 .attr('x', -103 * tooltipRatio)
                 .attr('y', -7 * tooltipRatio)
                 .attr('font-size', 16 * tooltipRatio),
                 tooltip
                 .append('text')
                 .attr('x', -103 * tooltipRatio)
                 .attr('y', 23 * tooltipRatio)
                 .attr('font-size', 16 * tooltipRatio),
             ];

             svg.on("touchmove mousemove", () => {

                 const mouseX = d3.mouse(d3.event.currentTarget)[0];

                 let minDistance = Infinity,
                     minOrder = null;

                 dataset.forEach(({ date, rate }, order) => {

                     const currentDistance = Math.abs(xScale(date) - mouseX);

                     if (currentDistance < minDistance) {

                         minDistance = currentDistance;
                         minOrder = order;
                     }
                 });

                 if (minOrder !== null) {

                     const { date, rate } = dataset[minOrder];

                     tooltip

                         .attr('display', '')
                         .attr('transform', `translate(${xScale(date)}, ${yScale(rate)})`);

                     tooltipTextRows[0].text(`1 ${baseCurrency} = ${rate} ${targetCurrency}`);
                     tooltipTextRows[1].text(`${date.toDateString()}`);
                 }
             });
         })
         .catch(err => {
             alert(err);
         });
 };

 document.addEventListener('DOMContentLoaded', () => {

     const inputs = {
         baseCurrency: document.getElementById('base-currency'),
         targetCurrency: document.getElementById('target-currency'),
         fromDate: document.getElementById('from-date'),
         toDate: document.getElementById('to-date'),
     };

     const refreshGraph = () => {

         const
             baseCurrency = inputs.baseCurrency.value,
             targetCurrency = inputs.targetCurrency.value,
             fromDate = inputs.fromDate.value,
             toDate = inputs.toDate.value;

         window.localStorage.formData = JSON.stringify({
             baseCurrency,
             targetCurrency,
             fromDate,
             toDate
         });

         renderGraph(baseCurrency, targetCurrency, fromDate, toDate);
     }

     Object
         .values(inputs)
         .forEach(input => input.addEventListener('change', refreshGraph));

     window.addEventListener('resize', refreshGraph);

     const inputArea = document.getElementById('input-area');

     const toggleInputArea = () => {

         if (inputArea.style.height === '0px') {

             window.localStorage.showInput = inputArea.style.height = null;
         } else {

             window.localStorage.showInput = inputArea.style.height = '0px';
         }

         refreshGraph();
     };

     if (window.localStorage.showInput !== '0px') {

         inputArea.style.height = null;
     }

     if (window.localStorage.formData) {

         try {
             const { baseCurrency, targetCurrency, fromDate, toDate } = JSON.parse(window.localStorage.formData);

             inputs.baseCurrency.value = baseCurrency;
             inputs.targetCurrency.value = targetCurrency;
             inputs.fromDate.value = fromDate;
             inputs.toDate.value = toDate;

             renderGraph(baseCurrency, targetCurrency, fromDate, toDate);
         } catch (error) {

             console.error(error);
         }
     } else {

         try {
             const baseCurrency = 'NZD';
             const targetCurrency = 'CNY';

             const fromDate = new Date(Date.now() - 1000 * 3600 * 24 * 365)
                 .toISOString().substr(0, 10);

             const toDate = new Date(Date.now())
                 .toISOString().substr(0, 10);

             inputs.baseCurrency.value = baseCurrency;
             inputs.targetCurrency.value = targetCurrency;
             inputs.fromDate.value = fromDate;
             inputs.toDate.value = toDate;

             renderGraph(baseCurrency, targetCurrency, fromDate, toDate);
         } catch (error) {

             console.error(error);
         }

     }
 });

 document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('export-btn');
    const graphContainer = document.getElementById('graph-container');
    
    const exportGraphAsImage = () => {
        html2canvas(graphContainer, {
            allowTaint: true,
            useCORS: true,
            logging: true
        }).then(function (canvas) {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png'); // Создаем изображение в формате PNG
            link.download = 'graph.png'; // Имя файла для скачивания
            link.click(); // Имитируем клик по ссылке для начала загрузки
        });
    };
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportGraphAsImage);
    }
});
