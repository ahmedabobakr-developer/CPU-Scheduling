// ==========================================
// GUI: UI Rendering
// Handles all DOM rendering: results, tables, Gantt charts
// ==========================================

function renderResults(rr, sjf) {
    // Averages
    document.getElementById('rr-avg-wt').textContent = rr.avgWt.toFixed(2);
    document.getElementById('rr-avg-tat').textContent = rr.avgTat.toFixed(2);
    document.getElementById('rr-avg-rt').textContent = rr.avgRt.toFixed(2);

    document.getElementById('sjf-avg-wt').textContent = sjf.avgWt.toFixed(2);
    document.getElementById('sjf-avg-tat').textContent = sjf.avgTat.toFixed(2);
    document.getElementById('sjf-avg-rt').textContent = sjf.avgRt.toFixed(2);

    // Highlight best metrics
    compareMetrics(rr.avgWt, sjf.avgWt, 'rr-avg-wt', 'sjf-avg-wt');
    compareMetrics(rr.avgTat, sjf.avgTat, 'rr-avg-tat', 'sjf-avg-tat');
    compareMetrics(rr.avgRt, sjf.avgRt, 'rr-avg-rt', 'sjf-avg-rt');

    // Tables
    renderTable('rr-result-body', rr.result);
    renderTable('sjf-result-body', sjf.result);

    // Gantt Charts
    renderGantt('rr-gantt', rr.gantt);
    renderGantt('sjf-gantt', sjf.gantt);
}

function renderTable(tbodyId, results) {
    var tbody = document.getElementById(tbodyId);
    tbody.innerHTML = '';

    results.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td>${p.at}</td>
            <td>${p.bt}</td>
            <td>${p.ct}</td>
            <td>${p.tat}</td>
            <td>${p.wt}</td>
            <td>${p.rt}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderGantt(containerId, ganttData) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const totalTime = ganttData[ganttData.length - 1].end;

    for (var i = 0; i < ganttData.length; i++) {
        var block = ganttData[i];
        var widthPercent = ((block.end - block.start) / totalTime) * 100;

        var div = document.createElement('div');
        var colorClass = "";
        if (block.id !== 'Idle') {
            colorClass = block.colorClass;
        }
        div.className = "gantt-block " + colorClass;
        
        if (block.id === 'Idle') {
            div.style.background = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)';
            div.style.color = 'rgba(255,255,255,0.5)';
        }
        
        div.style.width = widthPercent + "%";
        div.style.animationDelay = (i * 0.1) + "s";

        // Process ID
        const pidSpan = document.createElement('span');
        pidSpan.className = 'gantt-block-pid';
        pidSpan.textContent = block.id;

        // Start Time
        const startSpan = document.createElement('span');
        startSpan.className = 'gantt-time-start';
        startSpan.textContent = block.start;

        div.appendChild(pidSpan);
        div.appendChild(startSpan);

        // Add end time for the last block
        if (i === ganttData.length - 1) {
            const endSpan = document.createElement('span');
            endSpan.className = 'gantt-time-end';
            endSpan.textContent = block.end;
            div.appendChild(endSpan);
        }

        container.appendChild(div);
    };
}
