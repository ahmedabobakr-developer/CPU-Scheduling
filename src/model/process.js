class Process {

    constructor(id, arrivalTime, burstTime, colorClass) {

        this.id = id;
        this.at = arrivalTime;
        this.bt = burstTime;
        this.colorClass = colorClass;
        
        // Scheduling state variables
        this.rem = burstTime;      // Remaining burst time for preemptive algorithms
        this.isCompleted = false;  // Completion flag
        this.ct = 0;               // Completion Time
        this.tat = 0;              // Turnaround Time
        this.wt = 0;               // Waiting Time
        this.rt = 0;               // Response Time
    }

    clone() {

        const copy = new Process(this.id, this.at, this.bt, this.colorClass);
        copy.rem = this.rem;
        copy.isCompleted = this.isCompleted;
        copy.ct = this.ct;
        copy.tat = this.tat;
        copy.wt = this.wt;
        copy.rt = this.rt;

        return copy;
    }
}
