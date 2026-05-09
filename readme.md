# CPU Scheduling Simulator

A modern, web-based CPU Scheduling Simulator built with vanilla HTML, CSS, and JavaScript. This tool visually compares the performance of **Round Robin (RR)** and **Shortest Job First (SJF) (Non-Preemptive)** scheduling algorithms.

## Features

- **Process Management**: Easily add and remove processes with custom Arrival Times and Burst Times.
- **Dynamic Time Quantum**: Adjust the Time Quantum specifically for the Round Robin algorithm.
- **Visualized Results**: 
  - Generates clear **Gantt Charts** illustrating the timeline of process execution for both algorithms.
  - Side-by-side performance comparison showing Average Waiting Time (WT), Average Turnaround Time (TAT), and Average Response Time (RT).
  - Detailed results table displaying individual metrics for each process: Arrival Time (AT), Burst Time (BT), Completion Time (CT), Turnaround Time (TAT), Waiting Time (WT), and Response Time (RT).
- **Modern UI**: Features a sleek, responsive design with glassmorphism effects for a premium user experience.

## Project Structure

The codebase is organized modularly for maintainability:

- `index.html`: The main entry point and UI layout.
- `assets/style.css`: Contains all styling, animations, and responsive design rules.
- `src/`
  - `model/`: Data structures (`process.js`, `state.js` track the state and model processes).
  - `scheduler/`: Core algorithm implementations (`RR.js` for Round Robin, `SJF.js` for Shortest Job First).
  - `gui/`: User interface and interaction logic (`app.js` for events, `ui.js` for rendering charts and tables).
  - `metrics/`: Helper logic for calculating performance metrics (`metrics.js`).
  - `util/`: Shared utility functions (`helpers.js`).
- `test-cases/`: Contains documented scenarios for testing the simulator (`RR_vs_SJF Senarios.docx`).
- `screenshots/`: Visual examples of the application in action.

## Usage

1. Open `index.html` in any modern web browser.
2. In the **Control Panel**, enter the **Arrival Time** and **Burst Time** for a new process and click "Add Process".
3. Adjust the **Time Quantum** if needed (this only applies to Round Robin).
4. Review your added processes in the **Process Queue** section. You can remove processes if you made a mistake or clear all to start over.
5. Click **Run Simulation** to compute the schedules.
6. Scroll down to view the **Performance Comparison**, **Gantt Charts**, and **Detailed Result Tables** for both algorithms.

## Technical Details

- **Round Robin (RR)**: Implemented with a dynamic ready queue that handles process arrivals and quantum-based preemption. Calculates start times to accurately determine response times.
- **Shortest Job First (SJF)**: Implemented as a non-preemptive algorithm. It selects the available process with the shortest burst time at any given moment. In case of idle CPU time, it fast-forwards to the next process arrival.

## Development

This project uses standard web technologies without external framework dependencies (no React, Vue, or build tools required). Simply clone the repository and open `index.html` to run or modify the code directly.
