document.addEventListener('DOMContentLoaded', () => {
    const processForm = document.getElementById('process-form');
    const pidInput = document.getElementById('pid');
    const arrivalTimeInput = document.getElementById('arrivalTime');
    const burstTimeInput = document.getElementById('burstTime');
    const quantumInput = document.getElementById('quantum');
    const processTableBody = document.getElementById('process-table-body');
    const errorMsg = document.getElementById('error-message');
    const runBtn = document.getElementById('run-btn');
    const clearBtn = document.getElementById('clear-btn');
    const resultsSection = document.getElementById('results-section');
    const emptyRow = document.getElementById('empty-row');

    let processes = [];
    let colorIndex = 0;

    // Show Error Message
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');
        setTimeout(() => {
            errorMsg.classList.add('hidden');
        }, 3000);
    }

    // Add Process
    processForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const pid = pidInput.value.trim();
        const at = parseInt(arrivalTimeInput.value);
        const bt = parseInt(burstTimeInput.value);

        // Validations
        if (!pid || isNaN(at) || isNaN(bt)) {
            showError('All fields are required.');
            return;
        }

        if (processes.some(p => p.id === pid)) {
            showError(`Process ID '${pid}' already exists.`);
            return;
        }

        if (at < 0) {
            showError('Arrival Time cannot be negative.');
            return;
        }

        if (bt <= 0) {
            showError('Burst Time must be greater than 0.');
            return;
        }

        const colorClass = `color-${colorIndex % 10}`;
        colorIndex++;

        processes.push({ id: pid, at, bt, colorClass });
        
        updateProcessTable();
        processForm.reset();
        pidInput.focus();
    });

    // Update the Process Table
    function updateProcessTable() {
        processTableBody.innerHTML = '';
        if (processes.length === 0) {
            processTableBody.appendChild(emptyRow);
            runBtn.disabled = true;
            return;
        }

        runBtn.disabled = false;

        processes.forEach((p, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong class="text-main" style="color:var(--accent-blue)">${p.id}</strong></td>
                <td>${p.at}</td>
                <td>${p.bt}</td>
                <td><button class="btn btn-danger" onclick="removeProcess('${p.id}')">Remove</button></td>
            `;
            processTableBody.appendChild(tr);
        });
    }

    // Remove Process
    window.removeProcess = function(id) {
        processes = processes.filter(p => p.id !== id);
        updateProcessTable();
        resultsSection.classList.add('hidden'); // hide results if process changed
    };

    // Clear All
    clearBtn.addEventListener('click', () => {
        processes = [];
        updateProcessTable();
        resultsSection.classList.add('hidden');
    });

    // Run Simulation
    runBtn.addEventListener('click', () => {
        const quantum = parseInt(quantumInput.value);
        if (isNaN(quantum) || quantum <= 0) {
            showError('Time Quantum must be greater than 0.');
            return;
        }

        // Clone processes to prevent mutations
        const procCopyRR = JSON.parse(JSON.stringify(processes));
        const procCopySJF = JSON.parse(JSON.stringify(processes));

        const rrResult = simulateRR(procCopyRR, quantum);
        const sjfResult = simulateSJF(procCopySJF);

        renderResults(rrResult, sjfResult);
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });

    // ==========================================
    // Round Robin Logic
    // ==========================================
    function simulateRR(procs, quantum) {
        let n = procs.length;
        // add remaining burst time
        let remainingBT = procs.map(p => ({ ...p, rem: p.bt }));
        // sort by Arrival Time
        remainingBT.sort((a, b) => a.at - b.at);

        let time = 0;
        let completed = 0;
        let gantt = [];
        let readyQueue = [];
        let result = [];
        let startTimes = {};
        let idx = 0;

        // initial enqueue
        while (idx < n && remainingBT[idx].at <= time) {
            readyQueue.push(remainingBT[idx]);
            idx++;
        }

        while (completed < n) {
            if (readyQueue.length === 0) {
                // CPU is Idle
                if (idx < n) {
                    let nextArrival = remainingBT[idx].at;
                    gantt.push({ id: 'Idle', start: time, end: nextArrival, colorClass: '' });
                    time = nextArrival;
                    while (idx < n && remainingBT[idx].at <= time) {
                        readyQueue.push(remainingBT[idx]);
                        idx++;
                    }
                }
            } else {
                let p = readyQueue.shift();
                
                if (startTimes[p.id] === undefined) {
                    startTimes[p.id] = time;
                }

                let runTime = Math.min(p.rem, quantum);
                
                // If previous block in Gantt is same process, merge them
                if (gantt.length > 0 && gantt[gantt.length - 1].id === p.id) {
                    gantt[gantt.length - 1].end += runTime;
                } else {
                    gantt.push({ id: p.id, start: time, end: time + runTime, colorClass: p.colorClass });
                }

                time += runTime;
                p.rem -= runTime;

                // newly arrived processes join the queue FIRST
                while (idx < n && remainingBT[idx].at <= time) {
                    readyQueue.push(remainingBT[idx]);
                    idx++;
                }

                // then the currently executing process joins if it's not finished
                if (p.rem > 0) {
                    readyQueue.push(p);
                } else {
                    completed++;
                    let tat = time - p.at;
                    let wt = tat - p.bt;
                    let rt = startTimes[p.id] - p.at;
                    result.push({ ...p, ct: time, tat, wt, rt });
                }
            }
        }

        // Calculate averages
        let avgWt = result.reduce((acc, p) => acc + p.wt, 0) / n;
        let avgTat = result.reduce((acc, p) => acc + p.tat, 0) / n;
        let avgRt = result.reduce((acc, p) => acc + p.rt, 0) / n;

        // Sort results by ID to display nicely
        result.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));

        return { gantt, result, avgWt, avgTat, avgRt };
    }

    // ==========================================
    // Shortest Job First (Non-Preemptive) Logic
    // ==========================================
    function simulateSJF(procs) {
        let n = procs.length;
        let remaining = procs.map(p => ({ ...p, isCompleted: false }));
        let time = 0;
        let completed = 0;
        let gantt = [];
        let result = [];

        while (completed < n) {
            let available = remaining.filter(p => !p.isCompleted && p.at <= time);

            if (available.length === 0) {
                // CPU is Idle
                let uncompleted = remaining.filter(p => !p.isCompleted).sort((a, b) => a.at - b.at);
                let nextArrival = uncompleted[0].at;
                gantt.push({ id: 'Idle', start: time, end: nextArrival, colorClass: '' });
                time = nextArrival;
                available = remaining.filter(p => !p.isCompleted && p.at <= time);
            }

            // Select job with shortest burst time (tie-breaker: arrival time)
            available.sort((a, b) => {
                if (a.bt !== b.bt) return a.bt - b.bt;
                return a.at - b.at; 
            });

            let p = available[0];
            let rt = time - p.at;
            let runTime = p.bt;

            gantt.push({ id: p.id, start: time, end: time + runTime, colorClass: p.colorClass });
            
            time += runTime;
            
            // update original reference
            let originalP = remaining.find(x => x.id === p.id);
            originalP.isCompleted = true;
            completed++;

            let tat = time - p.at;
            let wt = tat - p.bt;
            result.push({ ...p, ct: time, tat, wt, rt });
        }

        // Calculate averages
        let avgWt = result.reduce((acc, p) => acc + p.wt, 0) / n;
        let avgTat = result.reduce((acc, p) => acc + p.tat, 0) / n;
        let avgRt = result.reduce((acc, p) => acc + p.rt, 0) / n;

        // Sort results by ID
        result.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));

        return { gantt, result, avgWt, avgTat, avgRt };
    }

    // ==========================================
    // UI Rendering
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

    function compareMetrics(val1, val2, id1, id2) {
        const el1 = document.getElementById(id1);
        const el2 = document.getElementById(id2);
        
        el1.style.color = '';
        el2.style.color = '';

        if (val1 < val2) {
            el1.style.color = 'var(--accent-green)';
            el2.style.color = 'var(--accent-red)';
        } else if (val2 < val1) {
            el1.style.color = 'var(--accent-red)';
            el2.style.color = 'var(--accent-green)';
        }
    }

    function renderTable(tbodyId, results) {
        const tbody = document.getElementById(tbodyId);
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

        ganttData.forEach((block, index) => {
            const widthPercent = ((block.end - block.start) / totalTime) * 100;
            
            const div = document.createElement('div');
            div.className = `gantt-block ${block.id === 'Idle' ? '' : block.colorClass}`;
            if(block.id === 'Idle') {
                div.style.background = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)';
                div.style.color = 'rgba(255,255,255,0.5)';
            }
            div.style.width = `${widthPercent}%`;
            // stagger animation
            div.style.animationDelay = `${index * 0.1}s`;

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
            if (index === ganttData.length - 1) {
                const endSpan = document.createElement('span');
                endSpan.className = 'gantt-time-end';
                endSpan.textContent = block.end;
                div.appendChild(endSpan);
            }

            container.appendChild(div);
        });
    }
});
