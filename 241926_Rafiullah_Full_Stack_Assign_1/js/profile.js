// Rafi Ullah
// Reg No: 241926

// profile.html shows my profile, profile.html?user=sarim shows Sarim's profile
var profileName = getUrlValue('user');

function infoRow(icon, label, value) {
  return '<div class="d-flex gap-3 py-2 border-bottom"><i class="bi ' + icon + ' text-grad"></i>' +
         '<div class="lh-sm"><div class="text-secondary" style="font-size:.72rem">' + label + '</div>' +
         '<div class="fw-semibold small">' + esc(value) + '</div></div></div>';
}

function countPosts(username) {
  var posts = getPosts();
  var total = 0;
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].author == username) {
      total = total + 1;
    }
  }
  return total;
}

function refreshPage() {
  showNavbar('profile');
  var me = getMe();
  var box = document.getElementById('profileBox');

  if (profileName == null) {
    profileName = me.username;
  }
  var u = findUser(profileName);
  if (u == null) {
    box.innerHTML = '<div class="card-soft p-4"><div class="ignore-box">Member not found. <a href="profile.html">Go to my profile</a></div></div>';
    return;
  }

  var isMe = (u.username == me.username);
  var isFriend = (getFriends(me.username).indexOf(u.username) != -1);
  var friends = sortFriendsByLogin(getFriends(u.username));
  var counts = countRatings(u.username);
  var totalRatings = counts[1] + counts[2] + counts[3];
  var trust = 0;
  if (totalRatings > 0) {
    trust = Math.round(counts[3] * 100 / totalRatings);
  }

  var tag = 'Member';
  if (isMe) {
    tag = 'This is you';
  } else if (isFriend) {
    tag = 'Friend';
  }

  var html = '';

  /* ---------- top card: picture, name, bio, numbers ---------- */
  html += '<div class="card-soft mb-4 overflow-hidden"><div class="top-strip" style="border-radius:0"></div>';
  html += '<div class="p-4 p-md-4 d-flex flex-wrap align-items-center gap-4">';
  html += avatar(u, 130, 'square', isOnline(u.username));
  html += '<div class="flex-grow-1" style="min-width:240px">';
  html += '<div class="d-flex align-items-center gap-2 flex-wrap"><h2 class="fw-bold mb-0">' + esc(u.name) + '</h2><span class="chip">' + tag + '</span></div>';
  html += '<div class="text-secondary my-2">' + esc(u.bio) + '</div>';
  html += '<div class="small text-secondary"><i class="bi bi-geo-alt-fill text-grad"></i> ' + esc(u.city) + ' &nbsp;•&nbsp; <i class="bi bi-briefcase-fill text-grad"></i> ' + esc(u.job) + '</div>';
  if (!isMe) {
    html += '<div class="mt-3 d-flex flex-wrap align-items-center gap-3">';
    html += '<a href="messages.html?user=' + u.username + '" class="btn btn-grad rounded-pill px-4"><i class="bi bi-chat-dots"></i> Message</a>';
    if (isFriend) {
      html += '<span class="rate-box">' + ratingButtons(me.username, u.username, true) + '</span>';
    }
    html += '</div>';
  }
  html += '</div>';
  html += '<div class="d-flex gap-2">';
  html += '<div class="stat"><b class="text-deep">' + friends.length + '</b><span class="small text-secondary">Friends</span></div>';
  html += '<div class="stat"><b class="text-grad">' + trust + '%</b><span class="small text-secondary">Trust</span></div>';
  html += '<div class="stat"><b style="color:#b45309">' + countPosts(u.username) + '</b><span class="small text-secondary">Posts</span></div>';
  html += '</div></div></div>';

  html += '<div class="row g-4">';

  /* ---------- left: friends network ---------- */
  html += '<div class="col-lg-8"><h4 class="fw-bold mb-0">Friends Network <span class="chip align-middle">' + friends.length + ' friends</span></h4>';
  if (isMe) {
    html += '<div class="small text-secondary mb-3">Rate your friends: 🤪 Stupid, 😎 Cool or 🤝 Trustworthy.</div>';
  } else {
    html += '<div class="small text-secondary mb-3">Friends of ' + esc(u.name.split(' ')[0]) + ', latest login first.</div>';
  }
  html += '<div class="row g-3">';
  for (var i = 0; i < friends.length; i++) {
    var f = findUser(friends[i]);
    var mine = getRating(me.username, f.username);
    html += '<div class="col-md-6"><div class="card-soft hoverable p-3 h-100">';
    html += '<div class="d-flex align-items-center gap-3">' + avatar(f, 52, 'round', isOnline(f.username));
    html += '<div class="flex-grow-1 lh-sm"><a href="profile.html?user=' + f.username + '" class="fw-bold text-dark text-decoration-none">' + esc(f.name) + '</a>';
    html += '<div class="small text-secondary">' + esc(f.job) + '</div>';
    html += '<div class="text-secondary" style="font-size:.72rem">Active ' + timeAgo(getLoginTime(f.username)) + '</div></div>';
    if (f.username != me.username) {
      html += '<a href="messages.html?user=' + f.username + '" class="btn btn-sm btn-light rounded-circle"><i class="bi bi-chat-dots"></i></a>';
    }
    html += '</div>';
    if (isMe) {
      html += '<div class="rate-box mt-3 d-flex align-items-center flex-wrap"><span class="text-secondary fw-bold me-2" style="font-size:.65rem">RATING</span>' + ratingButtons(me.username, f.username, false) + '</div>';
    } else if (mine != 0) {
      html += '<div class="mt-3 small">You rated: <span class="chip">' + ratingIcons[mine] + ' ' + ratingNames[mine] + '</span></div>';
    }
    html += '</div></div>';
  }
  if (friends.length == 0) {
    html += '<div class="col-12"><div class="card-soft p-4 text-center text-secondary">No friends to show yet.</div></div>';
  }
  html += '</div></div>';

  /* ---------- right: personal info, ratings, invite ---------- */
  html += '<div class="col-lg-4">';
  html += '<div class="card-soft p-4 mb-4"><h6 class="fw-bold">Personal Information</h6>';
  html += infoRow('bi-person', 'Full name', u.name);
  html += infoRow('bi-at', 'Username', '@' + u.username);
  html += infoRow('bi-envelope', 'Email', u.email);
  html += infoRow('bi-geo-alt', 'City', u.city);
  html += infoRow('bi-briefcase', 'Work / Study', u.job);
  html += infoRow('bi-clock-history', 'Last login', timeAgo(getLoginTime(u.username)));
  html += '</div>';

  html += '<div class="card-soft p-4 mb-4"><h6 class="fw-bold">Ratings Received</h6><div class="row text-center g-2">';
  for (var v = 1; v <= 3; v++) {
    html += '<div class="col-4"><div class="stat px-1"><div class="fs-3">' + ratingIcons[v] + '</div><b style="font-size:1.2rem">' + counts[v] + '</b><span class="text-secondary" style="font-size:.65rem">' + ratingNames[v] + '</span></div></div>';
  }
  html += '</div></div>';

  if (isMe) {
    html += '<div class="card-soft p-4 mb-4"><h6 class="fw-bold mb-1">Invite Friend</h6>';
    html += '<div class="small text-secondary mb-3">Connect with someone new to share updates.</div>';
    html += '<input type="text" id="inviteName" class="form-control input-soft mb-2" placeholder="@username">';
    html += '<button class="btn btn-grad w-100 rounded-3 fw-semibold" onclick="inviteFromProfile()"><i class="bi bi-send"></i> Send Friend Request</button>';
    html += '<div id="inviteResult" class="mt-3 small d-none"></div></div>';

    html += '<div class="card-soft p-4"><h6 class="fw-bold mb-1">Ignore List Rule</h6><div class="small text-secondary mb-2">Boundary enforcement</div>';
    html += '<div class="ignore-box small"><b><i class="bi bi-slash-circle"></i> Cannot send friend request</b><br>If a member has put you on their ignore list, your request is blocked. Try inviting <b>zainab</b> to see it.</div></div>';
  }
  html += '</div></div>';

  box.innerHTML = html;
}

/* invite box on my profile page */
function inviteFromProfile() {
  var result = sendInvite(document.getElementById('inviteName').value);
  var box = document.getElementById('inviteResult');

  if (result.ok) {
    box.className = 'ok-box small mt-3';
    box.innerHTML = '<i class="bi bi-check-circle"></i> ' + esc(result.text);
  } else if (result.blocked) {
    box.className = 'ignore-box small mt-3';
    box.innerHTML = '<b><i class="bi bi-slash-circle"></i> Cannot send friend request</b><br>' + esc(result.text);
  } else {
    box.className = 'warn-box small mt-3';
    box.innerHTML = esc(result.text);
  }
}

if (requireLogin()) {
  refreshPage();
}
