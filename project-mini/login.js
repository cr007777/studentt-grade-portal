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
    if ((role === 'teacher' && uid !== 'bmlbgnsxNlRIayU1gCbV4GE0c6o2') ||
        (role === 'student' && uid !== 'wnkP4CQ3Whe3cOsiCKYOQ5BrvWD2')) {
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
    showToast("❌ Invalid Email or Password", "error");
  }
});
