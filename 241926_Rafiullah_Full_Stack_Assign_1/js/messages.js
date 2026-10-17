// Rafi Ullah
// Reg No: 241926

var chatWith = '';          // username of the person I am chatting with
var currentTab = 'friends'; // friends or others
var searchText = '';

/* all messages between me and one person, oldest first */
function getChat(a, b) {
  var all = getMessages();
  var chat = [];
  for (var i = 0; i < all.length; i++) {
    if ((all[i].from == a && all[i].to == b) || (all[i].from == b && all[i].to == a)) {
      chat.push(all[i]);
    }
  }
  return chat;
}

function clockTime(time) {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dayName(time) {
  var day = new Date(time).toDateString();
  if (day == new Date().toDateString()) {
    return 'Today';
  }
  if (day == new Date(Date.now() - 86400000).toDateString()) {
    return 'Yesterday';
  }
  return day;
}

/* ---------- left side: list of members ---------- */
function showMembers() {
  var me = getMe();
  var myFriends = getFriends(me.username);
  var html = '';
  var shown = 0;
  var friendTotal = 0;
  var otherTotal = 0;

  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (u.username == me.username) continue;

    var isFriend = (myFriends.indexOf(u.username) != -1);
    if (isFriend) {
      friendTotal = friendTotal + 1;
    } else {
      otherTotal = otherTotal + 1;
    }
    if (currentTab == 'friends' && !isFriend) continue;
    if (currentTab == 'others' && isFriend) continue;
    if (searchText != '' && u.name.toLowerCase().indexOf(searchText) == -1) continue;

    var chat = getChat(me.username, u.username);
    var preview = 'Say hello 👋';
    var when = '';
    if (chat.length > 0) {
      preview = chat[chat.length - 1].text;
      when = timeAgo(chat[chat.length - 1].time);
    }
    var cls = 'convo d-flex gap-3 align-items-center mb-1';
    if (u.username == chatWith) {
      cls = cls + ' active';
    }

    html += '<button type="button" class="' + cls + '" onclick="openChat(\'' + u.username + '\')">' + avatar(u, 46, 'round', isOnline(u.username));
    html += '<div class="flex-grow-1 text-truncate lh-sm"><div class="d-flex justify-content-between">';
    html += '<span class="fw-semibold small">' + esc(u.name) + '</span><span class="text-grad fw-semibold" style="font-size:.7rem">' + when + '</span></div>';
    html += '<div class="small text-secondary text-truncate">' + esc(preview) + '</div></div></button>';
    shown = shown + 1;
  }
  if (shown == 0) {
    html = '<div class="small text-secondary p-3 text-center">No members found.</div>';
  }
  document.getElementById('memberList').innerHTML = html;
  document.getElementById('friendTotal').innerHTML = friendTotal;
  document.getElementById('otherTotal').innerHTML = otherTotal;
}

/* ---------- right side: chat ---------- */
function showChat() {
  var me = getMe();
  var header = document.getElementById('chatHeader');
  var box = document.getElementById('chatBox');

  if (chatWith == '') {
    header.innerHTML = '<div class="text-secondary py-2">Select a member to start chatting.</div>';
    box.innerHTML = '<div class="text-center text-secondary mt-5"><i class="bi bi-chat-heart fs-1 text-grad"></i><div>Your private messages will appear here.</div></div>';
    return;
  }
  var u = findUser(chatWith);
  var isFriend = (getFriends(me.username).indexOf(u.username) != -1);

  var h = '<div class="d-flex flex-wrap align-items-center gap-3">' + avatar(u, 52, 'round', isOnline(u.username));
  h += '<div class="flex-grow-1 lh-sm"><div class="d-flex align-items-center gap-2"><a href="profile.html?user=' + u.username + '" class="fw-bold text-dark text-decoration-none">' + esc(u.name) + '</a>';
  if (isFriend) {
    h += '<span class="chip">FRIEND</span>';
  } else {
    h += '<span class="chip chip-warm">MEMBER</span>';
  }
  h += '</div><div class="small text-secondary">Active ' + timeAgo(getLoginTime(u.username)) + '</div></div>';
  if (isFriend) {
    h += '<div class="rate-box d-flex align-items-center flex-wrap"><span class="text-secondary fw-bold me-2" style="font-size:.65rem">RATING</span>' + ratingButtons(me.username, u.username, true) + '</div>';
  } else {
    h += '<button class="btn btn-sm btn-grad rounded-pill px-3" onclick="inviteThisPerson()"><i class="bi bi-person-plus"></i> Send friend invite</button>';
  }
  h += '</div>';
  header.innerHTML = h;

  var chat = getChat(me.username, chatWith);
  var html = '';
  var lastDay = '';
  for (var i = 0; i < chat.length; i++) {
    var m = chat[i];
    var day = dayName(m.time);
    if (day != lastDay) {
      html += '<div class="text-center mb-3"><span class="day-chip">' + day + '</span></div>';
      lastDay = day;
    }
    if (m.from == me.username) {
      html += '<div class="d-flex justify-content-end mb-3"><div><div class="bubble-me px-3 py-2 ms-auto">' + esc(m.text) +
              '</div><div class="text-secondary text-end mt-1" style="font-size:.68rem">' + clockTime(m.time) + ' <i class="bi bi-check2-all text-success"></i></div></div></div>';
    } else {
      html += '<div class="d-flex gap-2 mb-3">' + avatar(u, 30) + '<div><div class="bubble-them px-3 py-2">' + esc(m.text) +
              '</div><div class="text-secondary mt-1" style="font-size:.68rem">' + clockTime(m.time) + '</div></div></div>';
    }
  }
  if (chat.length == 0) {
    html = '<div class="text-center text-secondary mt-5">No messages yet. Say hi 👋</div>';
  }
  box.innerHTML = html;
  box.scrollTop = box.scrollHeight;            // scroll down to the newest message
}

function refreshPage() {
  showNavbar('messages');
  showMembers();
  showChat();
}

/* ---------- actions ---------- */

function openChat(username) {
  chatWith = username;
  refreshPage();
}

function changeTab(tab) {
  currentTab = tab;
  var names = ['friends', 'others'];
  for (var i = 0; i < names.length; i++) {
    var button = document.getElementById('tab_' + names[i]);
    if (names[i] == tab) {
      button.className = 'active';
    } else {
      button.className = '';
    }
  }
  if (tab == 'friends') {
    document.getElementById('tabChip').innerHTML = 'Friends';
  } else {
    document.getElementById('tabChip').innerHTML = 'Members';
  }
  showMembers();
}

function inviteThisPerson() {
  var result = sendInvite(chatWith);
  if (result.ok) {
    showToast(result.text, 'success');
  } else {
    showToast(result.text, 'danger');
  }
}

function sendMessage(event) {
  event.preventDefault();
  var input = document.getElementById('msgInput');
  var error = document.getElementById('msgError');
  var text = input.value.trim();

  error.classList.add('d-none');
  if (chatWith == '') {
    error.innerHTML = 'Pick a member from the list first.';
    error.classList.remove('d-none');
    return;
  }
  if (text == '') {
    error.innerHTML = 'You cannot send an empty message.';
    error.classList.remove('d-none');
    return;
  }

  var all = getMessages();
  all.push({ from: getMe().username, to: chatWith, text: text, time: Date.now() });
  saveData('messages', all);
  input.value = '';
  refreshPage();
}

/* ---------- start ---------- */

if (requireLogin()) {
  document.getElementById('searchBox').addEventListener('input', function () {
    searchText = this.value.trim().toLowerCase();
    showMembers();
  });
  document.getElementById('msgForm').addEventListener('submit', sendMessage);

  // no fake replies. When the other person really answers (logged in on another tab), this page updates by itself
  window.addEventListener('storage', function () {
    refreshPage();
  });

  // open the chat from a link like messages.html?user=sarim
  var wanted = getUrlValue('user');
  var myName = getMe().username;
  if (wanted != null && findUser(wanted) != null && wanted != myName) {
    chatWith = wanted;
  } else {
    // otherwise open the chat with the latest message
    var all = getMessages();
    var latest = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].from == myName || all[i].to == myName) {
        if (latest == null || all[i].time > latest.time) {
          latest = all[i];
        }
      }
    }
    if (latest != null) {
      chatWith = (latest.from == myName) ? latest.to : latest.from;
    }
  }
  // if this person is not my friend, start on the Other Members tab
  if (chatWith != '' && getFriends(myName).indexOf(chatWith) == -1) {
    currentTab = 'others';
    document.getElementById('tab_friends').className = '';
    document.getElementById('tab_others').className = 'active';
    document.getElementById('tabChip').innerHTML = 'Members';
  }
  refreshPage();
}
