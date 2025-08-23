import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Grade calculation
function calculateGrade(mark) {
  if (mark >= 60) return "A+";
  if (mark >= 50) return "A";
  if (mark >= 40) return "B+";
  if (mark >= 30) return "B";
  if (mark >= 20) return "C+";
  return "Fail";
}

// Auto-update grade when marks entered
document.addEventListener("input", function (e) {
  if (e.target.classList.contains("mark")) {
    let mark = parseInt(e.target.value);
    let gradeBox = e.target.parentElement.querySelector(".grade");
    gradeBox.value = (!isNaN(mark) && mark >= 0 && mark <= 100) ? calculateGrade(mark) : "";
  }
});

// Add another student dynamically
document.getElementById("addStudent").addEventListener("click", () => {
  let container = document.getElementById("studentList");
  let newRow = document.createElement("div");
  newRow.classList.add("student-row");
  newRow.innerHTML = `
    <input type="text" placeholder="Student Name" required>
    <input type="text" placeholder="Student ID" required>
    <input type="number" placeholder="0-100" class="mark" min="0" max="100" required>
    <input type="text" placeholder="Auto-calculated" class="grade" readonly>
    <textarea placeholder="Provide feedback for this student..."></textarea>
  `;
  container.insertBefore(newRow, document.getElementById("addStudent"));
});

// Save All Marks
async function saveAllMarks() {
  const subject = document.getElementById("subject")?.value;
  const department = document.getElementById("department")?.value;

  if (!subject || subject.trim() === "" || subject === "Choose a subject...") {
    return alert("⚠️ Please select a valid subject!");
  }

  if (!department || department === "Choose a department...") {
    return alert("⚠️ Please select a department!");
  }

  let validEntries = 0;
  let lastStudentID = null;

  const rows = document.querySelectorAll(".student-row");

  for (const row of rows) {
    const inputs = row.querySelectorAll("input, textarea");
    if (inputs.length < 5) continue;

    const studentName = inputs[0]?.value.trim();
    const studentID = inputs[1]?.value.trim();
    const mark = inputs[2]?.value.trim();
    const grade = inputs[3]?.value.trim();
    const feedback = inputs[4]?.value.trim();

    const numericMark = parseInt(mark);
    if (!studentID || !studentName || isNaN(numericMark) || numericMark < 0 || numericMark > 100) {
      console.warn(`Skipping invalid entry for ${studentID}`);
      continue;
    }

    lastStudentID = studentID;

    try {
      await set(ref(db, `marks/${subject}/${studentID}`), {
        name: studentName,
        roll: studentID,
        dept: department,
        marks: numericMark,
        grade: grade,
        feedback: feedback
      });

      await set(ref(db, `students/${studentID}`), {
        name: studentName,
        rollNo: studentID,
        department: department
      });

      validEntries++;
    } catch (error) {
      console.error(`❌ Failed to save data for ${studentID}`, error);
    }
  }

  if (validEntries > 0 && lastStudentID) {
    alert(`✅ Saved ${validEntries} student record(s) successfully!`);
    window.location.href = "teacher.html"; // Redirect to dashboard, not student.html
  } else {
    alert("⚠️ No valid student entries found.");
  }
}

// Preview Report
function previewReport() {
  alert("👁 Preview report feature coming soon!");
}

// Export to Excel (CSV)
function exportExcel() {
  let rows = [["Name", "ID", "Mark", "Grade", "Feedback"]];
  document.querySelectorAll(".student-row").forEach(row => {
    let inputs = row.querySelectorAll("input, textarea");
    if (inputs.length < 5) return;
    rows.push([
      inputs[0].value.trim(),
      inputs[1].value.trim(),
      inputs[2].value.trim(),
      inputs[3].value.trim(),
      inputs[4].value.trim()
    ]);
  });

  let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  let link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", "StudentMarks.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Clear All
function clearAll() {
  document.querySelectorAll(".student-row input, .student-row textarea").forEach(el => el.value = "");
}

// Expose functions to window
window.saveAllMarks = saveAllMarks;
window.previewReport = previewReport;
window.exportExcel = exportExcel;
window.clearAll = clearAll;

// DOMContentLoaded listener for buttons + subject update
document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveAllMarks);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          alert("✅ Logged out successfully!");
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Logout error:", error);
          alert("⚠️ Logout failed. Please try again.");
        });
    });
  }

  // ✅ Department-based subject update
const departmentSubjects = {
  CSE: [
    "GE3791 Human Values and Ethics",
    "GE3751 Principles of Management",
    "AI3021 IT in Agricultural System",
    "OHS352 Project Report Writing",
    "CS3711 Summer Internship"
  ],
  ECE: [
    "Electronics I",
    "Electronics II",
    "Signals",
    "VLSI",
    "Embedded Systems"
  ],
  EEE: [
    "Circuits",
    "Power Systems",
    "Machines",
    "Control Systems",
    "Microcontrollers"
  ],
  MECH: [
    "Thermodynamics",
    "Mechanics",
    "Manufacturing",
    "Fluid Dynamics",
    "Design Engineering"
  ],
  IT: [
    "IT3501 Web Technology",
    "IT3502 Software Engineering",
    "IT3503 Data Structures",
    "IT3504 Database Management Systems",
    "IT3505 Computer Networks"
  ]
};
  const departmentSelect = document.getElementById("department");
  const subjectSelect = document.getElementById("subject");

  departmentSelect.addEventListener("change", () => {
    const selectedDept = departmentSelect.value;
    const subjects = departmentSubjects[selectedDept] || [];

    subjectSelect.innerHTML = `<option>Choose a subject...</option>`;
    subjects.forEach(sub => {
      const option = document.createElement("option");
      option.textContent = sub;
      subjectSelect.appendChild(option);
    });
  });
});
