import { db, auth } from "./firebase-config.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Subjects per department
const subjects = {
  CSE: ["GE3791 Human Values and Ethics", "GE3751 Principles of Management", "AI3021 IT in Agricultural System", "OHS352 Project Report Writing", "CS3711 Summer Internship"],
  IT: ["Web Tech", "Cloud Computing", "Cyber Security", "Big Data", "Java"],
  ECE: ["Electronics I", "Electronics II", "Signals", "VLSI", "Embedded"],
  EEE: ["Circuits", "Power Systems", "Machines", "Control Systems", "Microcontrollers"],
  ME: ["Thermodynamics", "Mechanics", "Manufacturing", "Fluid Dynamics", "Design"]
};

// ✅ Department name to code mapping
function getDeptCode(deptName) {
  const map = {
    "Computer Science and Engineering": "CSE",
    "Information Technology": "IT",
    "Electronics and Communication Engineering": "ECE",
    "Electrical and Electronics Engineering": "EEE",
    "Mechanical Engineering": "ME"
  };
  return map[deptName] || deptName;
}

function getStudentIDFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("studentID");
}

function downloadReport(studentID, studentData) {
  if (!studentData?.name || !studentData?.rollNo || !studentData?.department) {
    alert("⚠️ Student profile is incomplete.");
    return;
  }

  // Fill form fields
  document.getElementById("studentName").value = studentData.name;
  document.getElementById("rollNo").value = studentData.rollNo;
  document.getElementById("department").value = studentData.department;

  // Display summary
  document.getElementById("displayName").innerText = studentData.name;
  document.getElementById("displayRoll").innerText = studentData.rollNo;
  document.getElementById("displayDept").innerText = studentData.department;

  const gradesBody = document.getElementById("gradesBody");
  gradesBody.innerHTML = "";

  let found = false;

  get(ref(db, "marks")).then(snapshot => {
    if (!snapshot.exists()) {
      gradesBody.innerHTML = `<tr><td colspan="4">📭 No marks available yet.</td></tr>`;
      return;
    }

    const allMarks = snapshot.val();

    for (const subject in allMarks) {
      const subjectMarks = allMarks[subject];
      if (subjectMarks?.[studentID]) {
        const entry = subjectMarks[studentID];
        gradesBody.innerHTML += `
          <tr>
            <td>${subject}</td>
            <td>${entry.marks || "-"}</td>
            <td>${entry.grade || "-"}</td>
            <td>${entry.feedback || "No feedback"}</td>
          </tr>`;
        found = true;
      }
    }

    if (!found) {
      gradesBody.innerHTML = `<tr><td colspan="4">📭 No marks found for your subjects.</td></tr>`;
    }

    document.getElementById("gradeReport").style.display = "block";
  }).catch(error => {
    console.error("Error fetching marks:", error);
    alert("⚠️ Unable to load marks.");
  });
}


// Auth listener
onAuthStateChanged(auth, (user) => {
  const studentID = getStudentIDFromURL();

  if (studentID) {
    get(ref(db, `students/${studentID}`)).then(snapshot => {
      if (snapshot.exists()) {
        const studentData = snapshot.val();
        window.studentUID = studentID;
        window.studentData = studentData;
        downloadReport(studentID, studentData);
      } else {
        alert("⚠️ No student profile found.");
      }
    }).catch(error => {
      console.error("Error fetching student profile:", error);
      alert("⚠️ Unable to load student profile.");
    });
  } else if (user) {
    get(ref(db, "students")).then(snapshot => {
      const students = snapshot.val();
      if (!students) {
        alert("⚠️ No student records found.");
        return;
      }

      for (const [id, data] of Object.entries(students)) {
        if (data.uid === user.uid) {
          window.studentUID = id;
          window.studentData = data;
          downloadReport(id, data);
          return;
        }
      }

      // Removed unwanted alert here
      // alert("⚠️ No matching student profile found.");
    }).catch(error => {
      console.error("Error fetching student profile:", error);
      document.getElementById("gradesBody").innerHTML = `<tr><td colspan="4" style="color:#e11d48;">⚠️ No data available.</td></tr>`;
    });
  } else {
    window.location.href = "index.html";
  }
});

// Form validation
const nameInput = document.getElementById("studentName");
const rollInput = document.getElementById("rollNo");
const deptSelect = document.getElementById("department");
const submitBtn = document.getElementById("submitBtn");

function checkFormFilled() {
  submitBtn.disabled = !(nameInput.value && rollInput.value && deptSelect.value);
}

[nameInput, rollInput].forEach(input => input.addEventListener("input", checkFormFilled));
deptSelect.addEventListener("change", checkFormFilled);

// Manual submit
submitBtn.addEventListener("click", () => {
  const rollNo = rollInput.value.trim();
  get(ref(db, "students")).then(snapshot => {
    const students = snapshot.val();
    if (!students) {
      alert("⚠️ No student records found.");
      return;
    }

    for (const [id, data] of Object.entries(students)) {
      if (data.rollNo === rollNo) {
        window.studentUID = id;
        window.studentData = data;
        downloadReport(id, data);
        return;
      }
    }

    alert("📭 No student profile matches the entered roll number.");
  }).catch(error => {
    console.error("Error fetching student profile:", error);
    alert("⚠️ Unable to load student profile.");
  });
});

// Save marks
window.saveMarks = function () {
  const name = nameInput.value.trim();
  const rollNo = rollInput.value.trim();
  const department = deptSelect.value;
  const subject = document.getElementById("subject").value.trim();
  const marks = document.getElementById("marks").value.trim();
  const grade = document.getElementById("grade").value.trim();
  const feedback = document.getElementById("feedback").value.trim();

  if (!name || !rollNo || !department || !subject) {
    alert("⚠️ Please fill in all required fields.");
    return;
  }

  set(ref(db, `marks/${subject}/${rollNo}`), {
    name,
    roll: rollNo,
    department,
    marks,
    grade,
    feedback
  })
  .then(() => {
    alert("✅ Marks saved successfully!");
    downloadReport(rollNo, { name, rollNo, department });
  })
  .catch((error) => {
    console.error("Error saving marks:", error);
    alert("⚠️ Failed to save marks.");
  });
};

// Logout
window.logout = function () {
  signOut(auth).then(() => window.location.href = "index.html");
};

// Export PDF
window.exportPDF = function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const studentData = window.studentData;

  doc.text("Grade Report", 10, 10);
  doc.text(`Name: ${studentData.name}`, 10, 20);
  doc.text(`Roll No: ${studentData.rollNo}`, 10, 30);
  doc.text(`Department: ${studentData.department}`, 10, 40);

  let y = 50;
  document.querySelectorAll("#gradesBody tr").forEach(row => {
    doc.text(row.innerText, 10, y);
    y += 10;
  });

  doc.save("GradeReport.pdf");
};

// Export CSV
window.exportCSV = function () {
  let csv = "Subject,Marks,Grade,Feedback\n";
  document.querySelectorAll("#gradesBody tr").forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length > 0) {
      const line = Array.from(cells).map(cell => `"${cell.innerText}"`).join(",");
      csv += line + "\n";
    }
  });

  // Download CSV
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "GradeReport.csv";
  link.click();
};
