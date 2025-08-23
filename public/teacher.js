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
    <input type="text" placeholder="Student Name">
    <input type="text" placeholder="Student ID">
    <input type="number" placeholder="0-100" class="mark" min="0" max="100">
    <input type="text" placeholder="Auto-calculated" class="grade" readonly>
    <textarea placeholder="Provide feedback for this student..."></textarea>
  `;
  container.insertBefore(newRow, document.getElementById("addStudent"));
});

// Save All Marks
function saveAllMarks() {
  const subject = document.getElementById("subject")?.value;
  const department = document.getElementById("department")?.value;

  // Validate subject and department
  if (!subject || subject.trim() === "" || subject === "Choose a subject...") {
    return alert("⚠️ Please select a valid subject!");
  }

  if (!department || department === "Choose a department...") {
    return alert("⚠️ Please select a department!");
  }

  let validEntries = 0;

  document.querySelectorAll(".student-row").forEach(row => {
    const inputs = row.querySelectorAll("input, textarea");
    if (inputs.length < 5) {
      console.warn("Skipping incomplete row:", row);
      return;
    }

    const studentName = inputs[0]?.value.trim();
    const studentID = inputs[1]?.value.trim();
    const mark = inputs[2]?.value.trim();
    const grade = inputs[3]?.value.trim();
    const feedback = inputs[4]?.value.trim();

    if (!studentID || !studentName) return;

    // Save marks under marks/subject/studentUID
    set(ref(db, `marks/${subject}/${studentID}`), {
      name: studentName,
      roll: studentID,
      dept: department,
      marks: mark,
      grade: grade,
      feedback: feedback
    });


    // Save basic student info under students/studentID
set(ref(db, `students/${studentID}`), {
  name: studentName,
  rollNo: studentID,
  department: department
});


    validEntries++;
  });

  if (validEntries > 0) {
    alert(`✅ Saved ${validEntries} student record(s) successfully!`);
    window.location.href = `student.html?studentID=${studentID}`;
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

// Logout function
document.addEventListener("DOMContentLoaded", () => {
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
});

// Expose functions to window
window.saveAllMarks = saveAllMarks;
window.previewReport = previewReport;
window.exportExcel = exportExcel;
window.clearAll = clearAll;
