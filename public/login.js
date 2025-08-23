import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { ref, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Role selection
const roleButtons = document.querySelectorAll('.role-pill');
roleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    roleButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// Password toggle
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
togglePassword.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
});

// Toast
function showToast(message, type="info") {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = passwordInput.value;
  const selectedRole = document.querySelector('.role-pill.selected');

  if (!selectedRole) {
    showToast('⚠️ Please select a role (Teacher or Student)', "error");
    return;
  }

  const role = selectedRole.id === 'teacherBtn' ? 'teacher' : 'student';

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Role check using your provided UIDs
    const validTeacherUIDs = ['6Jk2TkaGG9ZSTCpS4dI4N2QKAPC2'];
const validStudentUIDs = [ 
                        'pbBK7Po1mRTsk1qJwyCIUc50PQD2',  
                        '5dfFpRNpWreQmSymigSb1q7L6Tt2', 
                        '53lt1FZAyEcTkKBXE9JGhpLwqfZ2', 
                        'UUjIJfqKlwVb6bHB2Vm2Dw5qCHo2',
                        'WXnllhH4iabAN7brAMhHDHuusMd2',
                        '4j9m6A4B5jUff1ErmmHuNvyo8oZ2',
                        'sHoDsnzL4ES0Td1522RR2q3Kptl2',
                        ];

if ((role === 'teacher' && !validTeacherUIDs.includes(uid)) ||
    (role === 'student' && !validStudentUIDs.includes(uid))) {
  showToast("⚠️ Role mismatch or unauthorized user", "error");
  return;
}


    showToast("✅ Login Successful!", "success");
    setTimeout(() => {
      if (role === 'teacher') window.location.href = 'teacher.html';
      else window.location.href = 'student.html';
    }, 1000);

  } catch (err) {
    console.error(err);
    showToast("⚠️ Invalid Email or Password", "error");
  }
});