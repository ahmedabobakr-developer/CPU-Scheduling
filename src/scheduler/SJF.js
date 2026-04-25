function simulateSJF(procs) {
    let n = procs.length;
    let remaining = [];
    
    for (let i = 0; i < n; i++) {
        remaining.push(procs[i]);
    }

    let time = 0;
    let completed = 0;
    let gantt = [];
    let result = [];

    while (completed < n) {
        let available = [];
        
        for (let i = 0; i < n; i++) {
            let p = remaining[i];
            if (p.isCompleted === false && p.at <= time) {
                available.push(p);
            }
        }

        if (available.length === 0) {
            let uncompleted = [];
            for (let i = 0; i < n; i++) {
                if (remaining[i].isCompleted === false) {
                    uncompleted.push(remaining[i]);
                }
            }
            uncompleted.sort((a, b) => a.at - b.at);
            
            let nextArrival = uncompleted[0].at;
            gantt.push({ id: 'Idle', start: time, end: nextArrival, colorClass: '' });
            time = nextArrival;
            
            available = [];
            for (let i = 0; i < n; i++) {
                let p = remaining[i];
                if (p.isCompleted === false && p.at <= time) {
                    available.push(p);
                }
            }
        }

        available.sort((a, b) => {
            if (a.bt !== b.bt) return a.bt - b.bt;
            return a.at - b.at;
        });

        let p = available[0];
        let rt = time - p.at;
        let runTime = p.bt;

        gantt.push({ id: p.id, start: time, end: time + runTime, colorClass: p.colorClass });

        time += runTime;

        p.isCompleted = true;
        completed++;

        p.ct = time;
        p.tat = time - p.at;
        p.wt = p.tat - p.bt;
        p.rt = rt;
        result.push(p);
    }

    let avgWt = result.reduce((acc, p) => acc + p.wt, 0) / n;
    let avgTat = result.reduce((acc, p) => acc + p.tat, 0) / n;
    let avgRt = result.reduce((acc, p) => acc + p.rt, 0) / n;

    result.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));

    return { gantt, result, avgWt, avgTat, avgRt };
}
