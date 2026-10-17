// Rafi Ullah
// Reg No: 241926

/* If the browser still has data saved by an OLDER version of this project (old usernames),
   it would break the pages. So we clear it once whenever the data version changes. */
var DATA_VERSION = 'v3';
if (localStorage.getItem('dataVersion') != DATA_VERSION) {
  localStorage.clear();
  localStorage.setItem('dataVersion', DATA_VERSION);
}

/* ================= DATA (no server, so everything is written here) ================= */

var users = [
  // photo: put a picture in the images folder and write its path here, for example 'images/rafi.jpg'. Empty = coloured initials.
  // friends = people who are friends with this user. ignore = people this user has blocked from sending requests.

  // ----- me and my friends -----
  { username: 'rafi', password: 'rafi123', name: 'Rafi Ullah', job: 'BS Computer Science, Air University', city: 'Swat, Pakistan',
    email: 'rafi@connecfriend.com', bio: 'Flutter and web developer in the making. Coffee, code and cricket.', color: '#068562', photo: '', minutesAgo: 2,
    friends: ['sarim', 'ahmed', 'shehzad', 'usman', 'ali'], ignore: [] },
  { username: 'sarim', password: 'sarim123', name: 'Sarim Khan', job: 'Web Developer', city: 'Islamabad, Pakistan',
    email: 'sarim@connecfriend.com', bio: 'Loves clean code and clean UI.', color: '#0e7490', photo: '', minutesAgo: 1,
    friends: ['rafi', 'ahmed'], ignore: [] },
  { username: 'ahmed', password: 'ahmed123', name: 'Ahmed Raza', job: 'Flutter Developer', city: 'Lahore, Pakistan',
    email: 'ahmed@connecfriend.com', bio: 'Building apps that people actually enjoy using.', color: '#b45309', photo: '', minutesAgo: 8,
    friends: ['rafi', 'sarim'], ignore: [] },
  { username: 'shehzad', password: 'shehzad123', name: 'Shehzad Mehboob', job: 'Software Engineer', city: 'Peshawar, Pakistan',
    email: 'shehzad@connecfriend.com', bio: 'APIs, chai and late-night debugging.', color: '#7c3aed', photo: '', minutesAgo: 22,
    friends: ['rafi'], ignore: [] },
  { username: 'usman', password: 'usman123', name: 'Usman', job: 'CS Student', city: 'Islamabad, Pakistan',
    email: 'usman@connecfriend.com', bio: 'Always up for a cricket match after class.', color: '#be123c', photo: '', minutesAgo: 60,
    friends: ['rafi'], ignore: [] },
  { username: 'ali', password: 'ali123', name: 'Ali', job: 'CS Student', city: 'Swat, Pakistan',
    email: 'ali@connecfriend.com', bio: 'Mountains, music and mobile apps.', color: '#2563eb', photo: '', minutesAgo: 180,
    friends: ['rafi'], ignore: [] },

  // ----- other members (not friends yet) -----
  { username: 'ayesha', password: 'ayesha123', name: 'Ayesha Noor', job: 'Data Science Student', city: 'Islamabad, Pakistan',
    email: 'ayesha@connecfriend.com', bio: 'Numbers, tea and long walks.', color: '#047857', photo: '', minutesAgo: 15,
    friends: ['hina'], ignore: [] },
  { username: 'hina', password: 'hina123', name: 'Hina Yousaf', job: 'Content Creator', city: 'Lahore, Pakistan',
    email: 'hina@connecfriend.com', bio: 'Stories, reels and good lighting.', color: '#c2410c', photo: '', minutesAgo: 300,
    friends: ['ayesha', 'zainab'], ignore: [] },
  { username: 'zainab', password: 'zainab123', name: 'Zainab Shah', job: 'Marketing Lead', city: 'Multan, Pakistan',
    email: 'zainab@connecfriend.com', bio: 'Keeps her circle small and private.', color: '#4f46e5', photo: '', minutesAgo: 600,
    friends: ['hina'], ignore: ['rafi'] },          // Zainab has put Rafi on her ignore list
  { username: 'talha', password: 'talha123', name: 'Talha Mehmood', job: 'Mobile Developer', city: 'Faisalabad, Pakistan',
    email: 'talha@connecfriend.com', bio: 'Flutter fan. Sent you a friend request!', color: '#0369a1', photo: '', minutesAgo: 90,
    friends: [], ignore: [] }
];

var ratingNames = ['', 'Stupid', 'Cool', 'Trustworthy'];
var ratingIcons = ['', '🤪', '😎', '🤝'];

/* ================= SAVE / LOAD (localStorage) ================= */

function loadData(key, defaultValue) {
  var text = localStorage.getItem(key);
  if (text == null) {
    return defaultValue;
  }
  return JSON.parse(text);
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function minutesBefore(m) {
  return Date.now() - m * 60000;
}

/* posts */
function getPosts() {
  var posts = loadData('posts', null);
  if (posts == null) {
    posts = [
      { id: 1, author: 'ahmed', text: 'Just shipped my first Flutter app to the Play Store! Months of late nights finally paid off 🚀 Thank you all for the support.', time: minutesBefore(15), audience: 'all', likes: ['sarim', 'shehzad', 'usman'], dislikes: ['ali'] },
      { id: 2, author: 'shehzad', text: 'Exciting news! I have started a small study group for data structures and algorithms. Everyone is welcome ✨', time: minutesBefore(40), audience: 'all', likes: ['rafi', 'sarim', 'ahmed', 'usman', 'ali'], dislikes: [] },
      { id: 3, author: 'ali', text: 'Only my closest circle sees this one: I am working on a new mobile app idea 📱 Want a sneak peek?', time: minutesBefore(200), audience: ['rafi'], likes: ['rafi'], dislikes: [] },
      { id: 4, author: 'sarim', text: 'Anyone up for a code review session this weekend? Bring your messy projects 💻', time: minutesBefore(5), audience: 'all', likes: ['ahmed'], dislikes: [] },
      { id: 5, author: 'usman', text: 'Quick question: which state management do you prefer for Flutter apps, Provider or Riverpod?', time: minutesBefore(70), audience: 'all', likes: [], dislikes: [] },
      { id: 6, author: 'ali', text: 'Golden hour in the valley today. Nature never runs out of colours 🏔️', time: minutesBefore(1500), audience: 'all', likes: ['rafi', 'sarim'], dislikes: [] }
    ];
    saveData('posts', posts);
  }
  return posts;
}

/* messages */
function getMessages() {
  var messages = loadData('messages', null);
  if (messages == null) {
    messages = [
      { from: 'shehzad', to: 'rafi', text: 'Hey Rafi! Did you get a chance to look at the notes I shared for the study group?', time: minutesBefore(32) },
      { from: 'rafi', to: 'shehzad', text: 'Yes bro, they were really helpful. Thanks!', time: minutesBefore(27) },
      { from: 'ahmed', to: 'rafi', text: 'Did you see the feedback count on my post?', time: minutesBefore(9) },
      { from: 'usman', to: 'rafi', text: 'Send me that Flutter project link when you are free.', time: minutesBefore(130) },
      { from: 'zainab', to: 'rafi', text: 'Hi Rafi, interested in collaborating on a small project?', time: minutesBefore(2880) }
    ];
    saveData('messages', messages);
  }
  return messages;
}

/* friend requests: { from: 'talha', to: 'rafi' } */
function getRequests() {
  var requests = loadData('requests', null);
  if (requests == null) {
    requests = [{ from: 'talha', to: 'rafi' }];
    saveData('requests', requests);
  }
  var clean = [];
  for (var i = 0; i < requests.length; i++) {
    if (findUser(requests[i].from) != null && findUser(requests[i].to) != null) {
      clean.push(requests[i]);
    }
  }
  return clean;
}

/* friend lists (so accepted friends are remembered) */
function getFriends(username) {
  var saved = loadData('friends_' + username, null);
  if (saved == null) {
    return findUser(username).friends;
  }
  var clean = [];                       // keep only friends that really exist
  for (var i = 0; i < saved.length; i++) {
    if (findUser(saved[i]) != null) {
      clean.push(saved[i]);
    }
  }
  return clean;
}

function addFriend(username, friend) {
  var list = getFriends(username);
  if (list.indexOf(friend) == -1) {
    list.push(friend);
  }
  saveData('friends_' + username, list);
}

/* ratings: key looks like "rafi>ayesha" and value is 1, 2 or 3 */
function getAllRatings() {
  var ratings = loadData('ratings', null);
  if (ratings == null) {
    ratings = { 'rafi>sarim': 3, 'rafi>ahmed': 2, 'rafi>shehzad': 3, 'rafi>usman': 2, 'rafi>ali': 3,
                'ahmed>rafi': 3, 'shehzad>rafi': 3, 'sarim>rafi': 2, 'usman>rafi': 1, 'ali>rafi': 3 };
    saveData('ratings', ratings);
  }
  return ratings;
}

// 0 means not rated yet
function getRating(rater, target) {
  var value = getAllRatings()[rater + '>' + target];
  if (value == undefined) {
    return 0;
  }
  return value;
}

function setRating(rater, target, value) {
  var ratings = getAllRatings();
  if (value == 0) {
    delete ratings[rater + '>' + target];
  } else {
    ratings[rater + '>' + target] = value;
  }
  saveData('ratings', ratings);
}

// how many people gave each rating to this user: counts[1] = Stupid, counts[2] = Cool, counts[3] = Trustworthy
function countRatings(target) {
  var ratings = getAllRatings();
  var counts = [0, 0, 0, 0];
  for (var key in ratings) {
    var parts = key.split('>');
    if (parts[1] == target) {
      counts[ratings[key]] = counts[ratings[key]] + 1;
    }
  }
  return counts;
}

/* last login time of every user */
function getAllLoginTimes() {
  var times = loadData('loginTimes', null);
  if (times == null) {
    times = {};
    for (var i = 0; i < users.length; i++) {
      times[users[i].username] = minutesBefore(users[i].minutesAgo);
    }
    saveData('loginTimes', times);
  }
  return times;
}

function getLoginTime(username) {
  return getAllLoginTimes()[username];
}

function setLoginTime(username) {
  var times = getAllLoginTimes();
  times[username] = Date.now();
  saveData('loginTimes', times);
}

/* ================= FINDING USERS ================= */

function findUser(username) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].username == username) {
      return users[i];
    }
  }
  return null;
}

function getMe() {
  var name = sessionStorage.getItem('currentUser');
  if (name == null) {
    return null;
  }
  return findUser(name);
}

// every page calls this first. If nobody is logged in it goes to login page
function requireLogin() {
  if (getMe() == null) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// put friends in order of login, latest login first
function sortFriendsByLogin(list) {
  var result = list.slice();
  for (var i = 0; i < result.length; i++) {
    for (var j = i + 1; j < result.length; j++) {
      if (getLoginTime(result[j]) > getLoginTime(result[i])) {
        var temp = result[i];
        result[i] = result[j];
        result[j] = temp;
      }
    }
  }
  return result;
}

// read ?user=ayesha from the address bar
function getUrlValue(name) {
  var query = window.location.search.substring(1);
  var parts = query.split('&');
  for (var i = 0; i < parts.length; i++) {
    var pair = parts[i].split('=');
    if (pair[0] == name) {
      return pair[1];
    }
  }
  return null;
}

/* ================= SMALL HELPERS ================= */

// stops people from typing html inside posts and messages
function esc(text) {
  text = String(text);
  text = text.replace(/&/g, '&amp;');
  text = text.replace(/</g, '&lt;');
  text = text.replace(/>/g, '&gt;');
  text = text.replace(/"/g, '&quot;');
  return text;
}

function timeAgo(time) {
  var mins = Math.floor((Date.now() - time) / 60000);
  if (mins < 1) {
    return 'just now';
  }
  if (mins < 60) {
    return mins + ' min ago';
  }
  var hours = Math.floor(mins / 60);
  if (hours < 24) {
    return hours + (hours == 1 ? ' hour ago' : ' hours ago');
  }
  var days = Math.floor(hours / 24);
  return days + (days == 1 ? ' day ago' : ' days ago');
}

// profile picture. If the user has a photo it is shown, otherwise a coloured circle with the initials.
// shape: 'round' or 'square'. online: true shows a green dot.
function avatar(user, size, shape, online) {
  var words = user.name.split(' ');
  var initials = words[0].substring(0, 2);          // one word name: first two letters
  if (words.length > 1) {
    initials = words[0].charAt(0) + words[1].charAt(0);
  }
  var look = 'width:' + size + 'px; height:' + size + 'px; font-size:' + (size / 2.6) + 'px;';
  var cls = 'avatar';
  if (shape == 'square') {
    cls = cls + ' avatar-sq';
  }
  var inside = initials;
  if (user.photo != '') {
    look += "background-image:url('" + user.photo + "');";
    inside = '';
  } else {
    look += 'background:linear-gradient(135deg,' + user.color + ',#013F4A);';
  }
  var html = '<div class="' + cls + '" style="' + look + '">' + inside + '</div>';
  if (online == undefined) {
    return html;
  }
  var dot = 'dot-off';
  if (online) {
    dot = 'dot-on';
  }
  return '<span class="avatar-wrap">' + html + '<span class="dot ' + dot + '"></span></span>';
}

// true if this person logged in during the last hour
function isOnline(username) {
  return (Date.now() - getLoginTime(username)) < 3600000;
}

// small card message that shows at the bottom right for 2.5 seconds
function showToast(text, type) {
  var box = document.getElementById('toastBox');
  if (box == null) {
    box = document.createElement('div');
    box.id = 'toastBox';
    box.className = 'position-fixed bottom-0 end-0 p-3';
    box.style.zIndex = '2000';
    document.body.appendChild(box);
  }
  var item = document.createElement('div');
  item.className = 'alert alert-' + type + ' py-2 mb-2 shadow border-0 rounded-4';
  item.innerHTML = esc(text);
  box.appendChild(item);
  setTimeout(function () {
    box.removeChild(item);
  }, 2500);
}

/* ================= RATING BUTTONS (used on 3 pages) ================= */

// withLabels = true shows the word too (Stupid, Cool, Trustworthy), otherwise only the icon
function ratingButtons(me, target, withLabels) {
  var mine = getRating(me, target);
  var html = '';
  for (var v = 1; v <= 3; v++) {
    var cls = 'rate-pill';
    if (mine == v) {
      cls = cls + ' on-' + v;
    }
    var label = ratingIcons[v];
    if (withLabels) {
      label = ratingIcons[v] + ' ' + ratingNames[v];
    }
    html += '<button type="button" class="' + cls + '" title="' + v + ': ' + ratingNames[v] + '" ' +
            'onclick="rateFriend(\'' + target + '\', ' + v + ')">' + label + '</button>';
  }
  return html;
}

function rateFriend(target, value) {
  var me = getMe();
  if (getFriends(me.username).indexOf(target) == -1) {
    showToast('You can only rate your friends.', 'danger');
    return;
  }
  if (getRating(me.username, target) == value) {
    setRating(me.username, target, 0);                 // same icon again = remove rating
    showToast('Rating removed', 'secondary');
  } else {
    setRating(me.username, target, value);
    showToast('You rated ' + findUser(target).name + ' as ' + ratingNames[value] + ' ' + ratingIcons[value], 'success');
  }
  refreshPage();                                       // every page has its own refreshPage()
}

/* ================= FRIEND INVITATION ================= */

function hasRequest(from, to) {
  var requests = getRequests();
  for (var i = 0; i < requests.length; i++) {
    if (requests[i].from == from && requests[i].to == to) {
      return true;
    }
  }
  return false;
}

// returns { ok: true/false, blocked: true/false, text: 'message' }
function sendInvite(typedName) {
  var me = getMe();
  var name = typedName.trim().toLowerCase();

  if (name.charAt(0) == '@') {
    name = name.substring(1);
  }
  if (name == '') {
    return { ok: false, blocked: false, text: 'Please type a username first.' };
  }
  var target = findUser(name);
  if (target == null) {
    return { ok: false, blocked: false, text: 'No member found with username "' + name + '".' };
  }
  if (target.username == me.username) {
    return { ok: false, blocked: false, text: 'You cannot invite yourself.' };
  }
  if (getFriends(me.username).indexOf(target.username) != -1) {
    return { ok: false, blocked: false, text: 'You and ' + target.name + ' are already friends.' };
  }
  // the ignore list check from the assignment
  if (target.ignore.indexOf(me.username) != -1) {
    return { ok: false, blocked: true, text: target.name + ' has put you on the ignore list, so your request cannot be sent.' };
  }
  if (hasRequest(me.username, target.username)) {
    return { ok: false, blocked: false, text: 'You already invited ' + target.name + '.' };
  }
  if (hasRequest(target.username, me.username)) {
    return { ok: false, blocked: false, text: target.name + ' already invited you. Accept it from pending invites.' };
  }

  var requests = getRequests();
  requests.push({ from: me.username, to: target.username });
  saveData('requests', requests);
  return { ok: true, blocked: false, text: 'Invitation sent to ' + target.name + '.' };
}

function answerInvite(from, accept) {
  var me = getMe();
  var requests = getRequests();
  var keep = [];
  for (var i = 0; i < requests.length; i++) {
    if (!(requests[i].from == from && requests[i].to == me.username)) {
      keep.push(requests[i]);
    }
  }
  saveData('requests', keep);
  if (accept) {
    addFriend(me.username, from);
    addFriend(from, me.username);
  }
}

/* ================= NAVBAR (same on every page) ================= */

function navLink(page, active, label, badge) {
  var cls = '';
  if (page == active) {
    cls = 'active';
  }
  return '<a class="' + cls + '" href="' + page + '.html">' + label + badge + '</a>';
}

function showNavbar(active) {
  var me = getMe();
  var requests = getRequests();
  var pending = 0;
  for (var i = 0; i < requests.length; i++) {
    if (requests[i].to == me.username) {
      pending = pending + 1;
    }
  }
  var badge = '';
  if (pending > 0) {
    badge = ' <span class="badge rounded-pill bg-danger">' + pending + '</span>';
  }

  var html = '<nav class="navbar navbar-expand-md navbar-cf sticky-top py-2"><div class="container-xl">';
  html += '<a class="navbar-brand d-flex align-items-center gap-2 m-0" href="home.html"><span class="logo-box">CF</span><span class="brand brand-md">ConnecFriend</span></a>';
  html += '<button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#menu"><span class="navbar-toggler-icon"></span></button>';
  html += '<div class="collapse navbar-collapse justify-content-between" id="menu">';
  html += '<span class="d-none d-md-block" style="width:150px"></span>';
  html += '<div class="pill-nav my-2 my-md-0">' + navLink('home', active, 'Home', badge) + navLink('profile', active, 'Profile', '') + navLink('messages', active, 'Messages', '') + '</div>';
  html += '<div class="d-flex align-items-center gap-3">';
  html += '<div class="text-end lh-sm"><div class="small fw-bold">' + esc(me.name.split(' ')[0]) + '</div><div class="text-success" style="font-size:.7rem">● Online</div></div>';
  html += avatar(me, 40, 'round', true);
  html += '<button class="btn btn-sm btn-outline-secondary rounded-pill" title="Sign out" onclick="logout()"><i class="bi bi-box-arrow-right"></i><span class="d-none d-xl-inline"> Sign out</span></button>';
  html += '</div></div></div></nav>';

  document.getElementById('navbar').innerHTML = html;
}
