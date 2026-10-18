// Rafi Ullah
// Reg No: 241926

const FAKE_ROUTES = {
  "/users/1": { id: 1, name: "Leanne Graham", email: "leanne@example.com" },
  "/users/2": { id: 2, name: "", email: "not-an-email" },
  "/users/3": {
    id: 3,
    name: "Clementine Bauch",
    email: "clementine@example.com",
  },
  "/users/1/posts": [
    { userId: 1, id: 1, title: "First post" },
    { userId: 1, id: 2, title: "Second post" },
  ],
  "/users/2/posts": [{ userId: 2, id: 3, title: "Valid post" }],
  "/users/3/posts": [{ userId: 3, id: 4 }],
};

class FakeResponse {
  constructor(status, statusText, bodyText) {
    this.status = status;
    this.statusText = statusText;
    this.bodyText = bodyText;
  }

  get ok() {
    return this.status >= 200 && this.status <= 299;
  }

  async json() {
    return JSON.parse(this.bodyText);
  }
}

function fakeFetch(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url in FAKE_ROUTES) {
        resolve(new FakeResponse(200, "OK", JSON.stringify(FAKE_ROUTES[url])));
      } else {
        resolve(new FakeResponse(404, "Not Found", "{}"));
      }
    }, 100);
  });
}

async function getJSON(url, fetchImplementation) {
  let response;
  try {
    response = await fetchImplementation(url);
  } catch (error) {
    throw new Error(`Network error: ${error.message}`);
  }
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} for ${url}`);
  }
  return await response.json();
}

async function fetchUserDetails(userId, baseUrl, fetchImplementation) {
  return await getJSON(`${baseUrl}/users/${userId}`, fetchImplementation);
}

async function fetchUserPosts(userId, baseUrl, fetchImplementation) {
  return await getJSON(`${baseUrl}/users/${userId}/posts`, fetchImplementation);
}

function isValidUser(user) {
  return (
    user !== null &&
    typeof user === "object" &&
    Number.isInteger(user.id) &&
    typeof user.name === "string" &&
    user.name.trim() !== "" &&
    typeof user.email === "string" &&
    user.email.includes("@")
  );
}

function isValidPosts(posts, userId) {
  return (
    Array.isArray(posts) &&
    posts.length > 0 &&
    posts.every(
      (p) =>
        p.userId === userId &&
        Number.isInteger(p.id) &&
        typeof p.title === "string" &&
        p.title.trim() !== ""
    )
  );
}

function loadUserDetails(
  userId,
  baseUrl = "https://jsonplaceholder.typicode.com",
  fetchImplementation = fetch
) {
  const bothFetches = Promise.all([
    fetchUserDetails(userId, baseUrl, fetchImplementation),
    fetchUserPosts(userId, baseUrl, fetchImplementation),
  ]);

  return bothFetches.then(([user, posts]) => {
    if (!isValidUser(user)) {
      throw new Error(`User ${userId} details are invalid`);
    }
    if (!isValidPosts(posts, userId)) {
      throw new Error(`User ${userId} posts are invalid`);
    }
    return { user, posts };
  });
}

function runCase(label, mainPromise) {
  return mainPromise
    .then(({ user, posts }) =>
      console.log(
        `[${label}] ACCEPTED -> ${user.name}, ${posts.length} post(s)`
      )
    )
    .catch((error) => console.log(`[${label}] REJECTED -> ${error.message}`));
}

runCase("both valid", loadUserDetails(1, "", fakeFetch))
  .then(() =>
    runCase("user invalid, posts valid", loadUserDetails(2, "", fakeFetch))
  )
  .then(() =>
    runCase("user valid, posts invalid", loadUserDetails(3, "", fakeFetch))
  )
  .then(() => runCase("fetch fails (404)", loadUserDetails(999, "", fakeFetch)))
  .then(() => console.log("\n--- real API (needs internet) ---"))
  .then(() => runCase("real user 1", loadUserDetails(1)))
  .then(() => runCase("real user 9999", loadUserDetails(9999)));
