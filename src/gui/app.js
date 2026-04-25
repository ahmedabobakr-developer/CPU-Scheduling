document.addEventListener('DOMContentLoaded', function() {
    var processForm = document.getElementById('process-form');
    var pidInput = document.getElementById('pid');
    var arrivalTimeInput = document.getElementById('arrivalTime');
    var burstTimeInput = document.getElementById('burstTime');
    var quantumInput = document.getElementById('quantum');
    var processTableBody = document.getElementById('process-table-body');
    var runBtn = document.getElementById('run-btn');
    var clearBtn = document.getElementById('clear-btn');
    var resultsSection = document.getElementById('results-section');
    var emptyRow = document.getElementById('empty-row');

    processForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var pid = pidInput.value.trim();
        var at = parseInt(arrivalTimeInput.value);
        var bt = parseInt(burstTimeInput.value);

        // Validations
        if (!pid || isNaN(at) || isNaN(bt)) {
            showError('All fields are required.');
            return;
        }

        var exists = false;
        for (var i = 0; i < processes.length; i++) {
            if (processes[i].id === pid) {
                exists = true;
                break;
            }
        }

        if (exists === true) {
            showError("Process ID '" + pid + "' already exists.");
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

        var colorClass = 'color-' + (colorIndex % 10); // select color from colors array
        colorIndex++;

        processes.push(new Process(pid, at, bt, colorClass));

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

        for (var i = 0; i < processes.length; i++) {
            var p = processes[i];
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td><strong class="text-main" style="color:var(--accent-blue)">' + p.id + '</strong></td>' +
                '<td>' + p.at + '</td>' +
                '<td>' + p.bt + '</td>' +
                '<td><button class="btn btn-danger" onclick="removeProcess(\'' + p.id + '\')">Remove</button></td>';
            processTableBody.appendChild(tr);
        }
    }

    window.removeProcess = function(id) {
        var tempProcesses = [];
        for (var i = 0; i < processes.length; i++) {
            if (processes[i].id !== id) {
                tempProcesses.push(processes[i]);
            }
        }
        processes = tempProcesses;
        updateProcessTable();
        resultsSection.classList.add('hidden'); 
    };

    clearBtn.addEventListener('click', function() {
        processes = [];
        updateProcessTable();
        resultsSection.classList.add('hidden');
    });

    runBtn.addEventListener('click', function() {
        var quantum = parseInt(quantumInput.value);
        if (isNaN(quantum) || quantum <= 0) {
            showError('Time Quantum must be greater than 0.');
            return;
        }

        var procCopyRR = [];
        var procCopySJF = [];
        
        for (var i = 0; i < processes.length; i++) {
            procCopyRR.push(processes[i].clone());
            procCopySJF.push(processes[i].clone());
        }

        var rrResult = simulateRR(procCopyRR, quantum);
        var sjfResult = simulateSJF(procCopySJF);

        renderResults(rrResult, sjfResult);
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });
});
