function simulateRR(procs, quantum) {
    let n = procs.length;
    let remainingBT = [];
    
    for (let i = 0; i < n; i++) {
        remainingBT.push(procs[i]);
    }

    remainingBT.sort((a, b) => a.at - b.at);

    let time = 0;
    let completed = 0;
    let gantt = [];
    let readyQueue = [];
    let result = [];
    let startTimes = {};
    let idx = 0;

    while (idx < n && remainingBT[idx].at <= time) {
        readyQueue.push(remainingBT[idx]);
        idx++;
    }

    while (completed < n) {
        if (readyQueue.length === 0 && idx < n) {
            let nextArrival = remainingBT[idx].at;
            gantt.push({ id: 'Idle', start: time, end: nextArrival, colorClass: '' });
            time = nextArrival;
            while (idx < n && remainingBT[idx].at <= time) {
                readyQueue.push(remainingBT[idx]);
                idx++;
            }
        } 
        else {
            let p = readyQueue.shift(); // shift -> first element in readyQueue Save in p and remove it from readyQueue

            if (startTimes[p.id] === undefined) {
                startTimes[p.id] = time;
            }

            let runTime = Math.min(p.rem, quantum);

            if (gantt.length > 0 && gantt[gantt.length - 1].id === p.id) {
                gantt[gantt.length - 1].end += runTime;
            } else {
                gantt.push({ id: p.id, start: time, end: time + runTime, colorClass: p.colorClass });
            }

            time += runTime;
            p.rem -= runTime;

            while (idx < n && remainingBT[idx].at <= time) {
                readyQueue.push(remainingBT[idx]);
                idx++;
            }

            if (p.rem > 0) {
                readyQueue.push(p);
            } 
            else {
                completed++;
                p.ct = time;
                p.tat = time - p.at;
                p.wt = p.tat - p.bt;
                p.rt = startTimes[p.id] - p.at;
                result.push(p);
            }
        }
    }

    let avgWt = result.reduce((acc, p) => acc + p.wt, 0) / n;
    let avgTat = result.reduce((acc, p) => acc + p.tat, 0) / n;
    let avgRt = result.reduce((acc, p) => acc + p.rt, 0) / n;
    result.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));

    return { gantt, result, avgWt, avgTat, avgRt };
}
