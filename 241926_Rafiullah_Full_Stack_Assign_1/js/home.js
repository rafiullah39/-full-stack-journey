// Rafi Ullah
// Reg No: 241926

/* can I see this post? Only my own posts, or posts of my friends that are for everyone / for me */
function canSee(post, me) {
  if (findUser(post.author) == null) {
    return false;
  }
  if (post.author == me.username) {
    return true;
  }
  if (getFriends(me.username).indexOf(post.author) == -1) {
    return false;
  }
  if (post.audience == 'all') {
    return true;
  }
  if (post.audience.indexOf(me.username) != -1) {
    return true;
  }
  return false;
}

/* ---------- left side: friends list, latest login first ---------- */
function showFriends() {
  var me = getMe();
  var list = sortFriendsByLogin(getFriends(me.username));
  var html = '';
  var active = 0;

  for (var i = 0; i < list.length; i++) {
    var f = findUser(list[i]);
    var rating = getRating(me.username, f.username);
    var icon = '';
    if (rating != 0) {
      icon = ratingIcons[rating];
    }
    if (isOnline(f.username)) {
      active = active + 1;
    }
    html += '<div class="d-flex align-items-center gap-2 p-2 rounded-4 mb-2 card-tint">';
    html += avatar(f, 42, 'round', isOnline(f.username));
    html += '<div class="flex-grow-1 lh-sm">';
    html += '<a href="profile.html?user=' + f.username + '" class="fw-semibold small text-dark text-decoration-none">' + esc(f.name) + '</a>';
    html += '<div class="text-secondary" style="font-size:.72rem">' + timeAgo(getLoginTime(f.username)) + '</div></div>';
    html += '<span class="fs-5">' + icon + '</span>';
    html += '<a href="messages.html?user=' + f.username + '" class="btn btn-sm btn-light rounded-circle"><i class="bi bi-chat-dots"></i></a>';
    html += '</div>';
  }
  if (list.length == 0) {
    html = '<div class="small text-secondary">No friends yet. Send some invites!</div>';
  }
  document.getElementById('friendList').innerHTML = html;
  document.getElementById('activeCount').innerHTML = active;
  document.getElementById('friendCount').innerHTML = list.length;
}

/* checkboxes shown when sharing with some friends */
function showPickList() {
  var me = getMe();
  var list = getFriends(me.username);
  var html = '';
  for (var i = 0; i < list.length; i++) {
    html += '<div class="col"><div class="form-check">';
    html += '<input class="form-check-input pick-box" type="checkbox" value="' + list[i] + '" id="pick_' + list[i] + '">';
    html += '<label class="form-check-label small" for="pick_' + list[i] + '">' + esc(findUser(list[i]).name) + '</label>';
    html += '</div></div>';
  }
  document.getElementById('pickList').innerHTML = html;
}

/* ---------- middle: news feed ---------- */
function showFeed() {
  var me = getMe();
  var posts = getPosts();
  var visible = [];

  for (var i = 0; i < posts.length; i++) {
    if (canSee(posts[i], me)) {
      visible.push(posts[i]);
    }
  }
  // newest post first
  for (var a = 0; a < visible.length; a++) {
    for (var b = a + 1; b < visible.length; b++) {
      if (visible[b].time > visible[a].time) {
        var temp = visible[a];
        visible[a] = visible[b];
        visible[b] = temp;
      }
    }
  }

  var html = '';
  for (var j = 0; j < visible.length; j++) {
    var p = visible[j];
    var author = findUser(p.author);
    var mine = (p.author == me.username);
    var rating = getRating(me.username, author.username);

    var who = 'All Friends';
    if (p.audience != 'all') {
      who = 'Selected Friends (' + p.audience.length + ')';
    }
    var likeStyle = 'react-btn';
    if (p.likes.indexOf(me.username) != -1) {
      likeStyle = 'react-btn like-on';
    }
    var dislikeStyle = 'react-btn';
    if (p.dislikes.indexOf(me.username) != -1) {
      dislikeStyle = 'react-btn dislike-on';
    }

    html += '<article class="card-soft hoverable p-3 p-md-4 mb-3">';
    html += '<div class="d-flex align-items-center gap-3 mb-3">';
    html += avatar(author, 52, 'round', isOnline(author.username));
    html += '<div class="flex-grow-1 lh-sm">';
    html += '<a href="profile.html?user=' + author.username + '" class="fw-bold text-dark text-decoration-none">' + esc(author.name) + '</a>';
    if (!mine && rating != 0) {
      html += ' <span class="chip ' + (rating == 1 ? 'chip-rose' : rating == 2 ? 'chip-warm' : '') + '">' + ratingIcons[rating] + ' ' + ratingNames[rating] + ' (' + rating + '/3)</span>';
    }
    html += '<div class="small text-secondary mt-1">Last login: ' + timeAgo(getLoginTime(author.username)) + ' • <i class="bi bi-globe2"></i> ' + who + '</div>';
    html += '</div>';
    if (mine) {
      html += '<button class="btn btn-sm btn-light rounded-circle" title="Delete post" onclick="deletePost(' + p.id + ')"><i class="bi bi-trash"></i></button>';
    }
    html += '</div>';

    html += '<p class="mb-3" style="font-size:1.02rem">' + esc(p.text) + '</p>';

    html += '<div class="d-flex flex-wrap align-items-center gap-2 border-top pt-3">';
    html += '<button class="' + likeStyle + '" onclick="reactToPost(' + p.id + ', \'like\')"><i class="bi bi-hand-thumbs-up"></i> ' + p.likes.length + '</button>';
    html += '<button class="' + dislikeStyle + '" onclick="reactToPost(' + p.id + ', \'dislike\')"><i class="bi bi-hand-thumbs-down"></i> ' + p.dislikes.length + '</button>';
    html += '<span class="small text-secondary">' + timeAgo(p.time) + '</span>';
    if (!mine) {
      html += '<span class="ms-auto rate-box d-flex align-items-center"><span class="small fw-semibold me-2">Rate ' + esc(author.name.split(' ')[0]) + '</span>' + ratingButtons(me.username, author.username, false) + '</span>';
    }
    html += '</div></article>';
  }
  if (visible.length == 0) {
    html = '<div class="card-soft p-4 text-center text-secondary">No news yet. Add friends or post something!</div>';
  }
  document.getElementById('feed').innerHTML = html;
}

/* ---------- right side: invitations ---------- */
function showInvites() {
  var me = getMe();
  var requests = getRequests();
  var pendingHtml = '';
  var pending = 0;
  var sent = [];

  for (var i = 0; i < requests.length; i++) {
    if (requests[i].to == me.username) {
      var u = findUser(requests[i].from);
      pending = pending + 1;
      pendingHtml += '<div class="d-flex align-items-center gap-2 mb-2">' + avatar(u, 38);
      pendingHtml += '<div class="flex-grow-1 small fw-semibold">' + esc(u.name) + '</div>';
      pendingHtml += '<button class="btn btn-sm btn-grad rounded-circle" title="Accept" onclick="answer(\'' + u.username + '\', true)"><i class="bi bi-check-lg"></i></button> ';
      pendingHtml += '<button class="btn btn-sm btn-outline-danger rounded-circle" title="Decline" onclick="answer(\'' + u.username + '\', false)"><i class="bi bi-x-lg"></i></button></div>';
    }
    if (requests[i].from == me.username) {
      sent.push(findUser(requests[i].to).name);
    }
  }
  if (pending == 0) {
    pendingHtml = '<div class="small text-secondary">No pending invites.</div>';
  }
  document.getElementById('pendingList').innerHTML = pendingHtml;
  document.getElementById('pendingCount').innerHTML = pending;

  if (sent.length > 0) {
    document.getElementById('sentList').innerHTML = 'Sent to: ' + esc(sent.join(', '));
  } else {
    document.getElementById('sentList').innerHTML = '';
  }

  // people you may know = not friends and no invite between us
  var sugHtml = '';
  for (var k = 0; k < users.length; k++) {
    var s = users[k];
    if (s.username == me.username) continue;
    if (getFriends(me.username).indexOf(s.username) != -1) continue;
    if (hasRequest(me.username, s.username)) continue;
    if (hasRequest(s.username, me.username)) continue;
    sugHtml += '<div class="d-flex align-items-center gap-2 mt-3">' + avatar(s, 38);
    sugHtml += '<div class="flex-grow-1 lh-sm"><div class="small fw-semibold">' + esc(s.name) + '</div><div class="text-secondary" style="font-size:.72rem">@' + s.username + '</div></div>';
    sugHtml += '<button class="btn btn-sm btn-outline-success rounded-circle" onclick="invite(\'' + s.username + '\')"><i class="bi bi-person-plus"></i></button></div>';
  }
  if (sugHtml == '') {
    sugHtml = '<div class="small text-secondary mt-2">No suggestions right now.</div>';
  }
  document.getElementById('suggestList').innerHTML = sugHtml;
}

/* redraw everything (also called by the rating buttons) */
function refreshPage() {
  showNavbar('home');
  showFriends();
  showFeed();
  showInvites();
}

/* ---------- actions ---------- */

function showPostError(text) {
  var box = document.getElementById('postError');
  box.innerHTML = text;
  box.classList.remove('d-none');
}

function addPost() {
  var me = getMe();
  var text = document.getElementById('postText').value.trim();
  var audience = 'all';

  if (text == '') {
    showPostError('Write something before posting.');
    return;
  }
  if (text.length < 3) {
    showPostError('Your post is too short (minimum 3 characters).');
    return;
  }
  if (document.getElementById('audience').value == 'some') {
    audience = [];
    var boxes = document.getElementsByClassName('pick-box');
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].checked) {
        audience.push(boxes[i].value);
      }
    }
    if (audience.length == 0) {
      showPostError('Tick at least one friend, or choose "all friends".');
      return;
    }
  }

  var posts = getPosts();
  posts.push({ id: Date.now(), author: me.username, text: text, time: Date.now(), audience: audience, likes: [], dislikes: [] });
  saveData('posts', posts);

  document.getElementById('postText').value = '';
  document.getElementById('charCount').innerHTML = '0';
  document.getElementById('audience').value = 'all';
  document.getElementById('pickBox').classList.add('d-none');
  document.getElementById('postError').classList.add('d-none');
  showPickList();
  refreshPage();
  showToast('Your update has been shared!', 'success');
}

function reactToPost(id, type) {
  var me = getMe().username;
  var posts = getPosts();

  for (var i = 0; i < posts.length; i++) {
    if (posts[i].id == id) {
      var p = posts[i];
      var likeAt = p.likes.indexOf(me);
      var dislikeAt = p.dislikes.indexOf(me);

      if (type == 'like') {
        if (likeAt != -1) {
          p.likes.splice(likeAt, 1);              // click again = remove my like
        } else {
          p.likes.push(me);
          if (dislikeAt != -1) {
            p.dislikes.splice(dislikeAt, 1);      // cannot like and dislike together
          }
        }
      } else {
        if (dislikeAt != -1) {
          p.dislikes.splice(dislikeAt, 1);
        } else {
          p.dislikes.push(me);
          if (likeAt != -1) {
            p.likes.splice(likeAt, 1);
          }
        }
      }
    }
  }
  saveData('posts', posts);
  refreshPage();
}

function deletePost(id) {
  if (!confirm('Delete this post?')) {
    return;
  }
  var posts = getPosts();
  var keep = [];
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].id != id) {
      keep.push(posts[i]);
    }
  }
  saveData('posts', keep);
  refreshPage();
  showToast('Post deleted', 'secondary');
}

function invite(username) {
  var result = sendInvite(username);
  var box = document.getElementById('inviteResult');

  if (result.ok) {
    box.className = 'ok-box small';
    box.innerHTML = '<i class="bi bi-check-circle"></i> ' + esc(result.text);
    document.getElementById('inviteName').value = '';
    refreshPage();
  } else if (result.blocked) {
    box.className = 'ignore-box small';
    box.innerHTML = '<b><i class="bi bi-slash-circle"></i> Cannot send friend request</b><br>' + esc(result.text);
  } else {
    box.className = 'warn-box small';
    box.innerHTML = esc(result.text);
  }
}

function inviteFromBox() {
  invite(document.getElementById('inviteName').value);
}

function answer(from, accept) {
  answerInvite(from, accept);
  showPickList();
  refreshPage();
  if (accept) {
    showToast('Friend request accepted', 'success');
  } else {
    showToast('Request declined', 'secondary');
  }
}

/* ---------- start ---------- */

if (requireLogin()) {
  document.getElementById('welcomeName').innerHTML = esc(getMe().name.split(' ')[0]);
  document.getElementById('meAvatar').innerHTML = avatar(getMe(), 48, 'round', true);

  document.getElementById('audience').addEventListener('change', function () {
    if (this.value == 'some') {
      document.getElementById('pickBox').classList.remove('d-none');
    } else {
      document.getElementById('pickBox').classList.add('d-none');
    }
  });
  document.getElementById('postText').addEventListener('input', function () {
    document.getElementById('charCount').innerHTML = this.value.length;
    document.getElementById('postError').classList.add('d-none');
  });
  document.getElementById('inviteName').addEventListener('keydown', function (e) {
    if (e.key == 'Enter') {
      inviteFromBox();
    }
  });

  showPickList();
  refreshPage();

  // update by itself when another logged in tab changes something (new invite, like, post)
  window.addEventListener('storage', function () {
    refreshPage();
  });
}
