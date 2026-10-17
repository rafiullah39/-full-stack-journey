// Rafi Ullah
// Reg No: 241926

// if the user is already logged in, go straight to home
if (getMe() != null) {
  window.location.href = 'home.html';
}

// fill the remembered username
var remembered = localStorage.getItem('rememberedUser');
if (remembered != null) {
  document.getElementById('username').value = remembered;
  document.getElementById('remember').checked = true;
}

function fillUser(name) {
  document.getElementById('username').value = name;
  document.getElementById('password').value = name + '123';
}

function togglePassword() {
  var box = document.getElementById('password');
  if (box.type == 'password') {
    box.type = 'text';
  } else {
    box.type = 'password';
  }
}

function checkLogin(event) {
  event.preventDefault();                       // stop the page from reloading

  var userBox = document.getElementById('username');
  var passBox = document.getElementById('password');
  var alertBox = document.getElementById('loginAlert');
  var name = userBox.value.trim().toLowerCase();
  var pass = passBox.value;
  var error = false;

  alertBox.classList.add('d-none');
  userBox.classList.remove('is-invalid');
  passBox.classList.remove('is-invalid');

  if (name == '') {
    userBox.classList.add('is-invalid');
    error = true;
  }
  if (pass.length < 6) {
    passBox.classList.add('is-invalid');
    error = true;
  }
  if (error) {
    return;
  }

  var user = findUser(name);
  if (user == null || user.password != pass) {
    alertBox.innerHTML = 'Wrong username or password. Please try again.';
    alertBox.classList.remove('d-none');
    return;
  }

  setLoginTime(user.username);                  // remember the login time (used to sort friends)
  sessionStorage.setItem('currentUser', user.username);

  if (document.getElementById('remember').checked) {
    localStorage.setItem('rememberedUser', user.username);
  } else {
    localStorage.removeItem('rememberedUser');
  }
  window.location.href = 'home.html';
}

document.getElementById('loginForm').addEventListener('submit', checkLogin);

// show a few members online on the right side
var stackHtml = '';
var onlineCount = 0;
for (var i = 0; i < users.length; i++) {
  if (isOnline(users[i].username)) {
    onlineCount = onlineCount + 1;
    if (onlineCount <= 4) {
      stackHtml += avatar(users[i], 34);
    }
  }
}
document.getElementById('onlineStack').innerHTML = stackHtml;
document.getElementById('onlineText').innerHTML = onlineCount + ' members online now';
