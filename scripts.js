// scripts.js

// Save log date to localStorage
function addLog(date) {
    if (!date) return;
    
    // Get existing logs from localStorage or initialize an empty array
    let logs = JSON.parse(localStorage.getItem("logs")) || [];
    
    // Add the new log date at the beginning
    logs.unshift(date);
    
    // Save updated logs array back to localStorage
    localStorage.setItem("logs", JSON.stringify(logs));
  }
  
  // Retrieve all logs from localStorage
  function getLogs() {
    return JSON.parse(localStorage.getItem("logs")) || [];
  }
  
  // Function to calculate cycle status
  function calculateCycleStatus() {
    const logs = getLogs();
    if (logs.length < 2) {
      return "Not enough data to calculate period cycle.";
    }
  
    const date1 = new Date(logs[1]);
    const date2 = new Date(logs[0]);
    const differenceInDays = Math.ceil((date2 - date1) / (1000 * 60 * 60 * 24));
  
    if (differenceInDays >= 26 && differenceInDays <= 33) {
      return `Regular Period: ${differenceInDays} days cycle.`;
    } else {
      return `Irregular Period: ${differenceInDays} days cycle. Please consult a doctor.`;
    }
  }
  