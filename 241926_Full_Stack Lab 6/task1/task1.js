// Rafi Ullah
// Reg No: 241926

const FAKE_ROUTES = {
  "/users/1": { id: 1, name: "Leanne Graham", email: "leanne@example.com" },
  "/users/2": { id: 2, name: "", email: "not-an-email" },
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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url === "/network-fail") {
        reject(new TypeError("fetch failed"));
      } else if (url === "/server-error") {
        resolve(new FakeResponse(500, "Internal Server Error", "{}"));
      } else if (url === "/bad-json") {
        resolve(new FakeResponse(200, "OK", "{ not json"));
      } else if (url in FAKE_ROUTES) {
        resolve(new FakeResponse(200, "OK", JSON.stringify(FAKE_ROUTES[url])));
      } else {
        resolve(new FakeResponse(404, "Not Found", "{}"));
      }
    }, 100);
  });
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

async function fetchUser(url, fetchImplementation = fetch) {
  let response;
  try {
    response = await fetchImplementation(url);
  } catch (error) {
    throw new Error(`Network error: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} ${response.statusText}`);
  }

  let user;
  try {
    user = await response.json();
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }

  if (!isValidUser(user)) {
    throw new TypeError("Invalid user data received");
  }
  return user;
}

async function runCase(label, promise) {
  try {
    const user = await promise;
    console.log(
      `[${label}] SUCCESS -> ${user.id} | ${user.name} | ${user.email}`
    );
  } catch (error) {
    console.log(`[${label}] ERROR   -> ${error.name}: ${error.message}`);
  }
}

async function main() {
  console.log("--- fake API ---");
  await runCase("valid user", fetchUser("/users/1", fakeFetch));
  await runCase("invalid user data", fetchUser("/users/2", fakeFetch));
  await runCase("404 not found", fetchUser("/users/999", fakeFetch));
  await runCase("500 server error", fetchUser("/server-error", fakeFetch));
  await runCase("network failure", fetchUser("/network-fail", fakeFetch));
  await runCase("invalid JSON", fetchUser("/bad-json", fakeFetch));

  console.log("\n--- real API (needs internet) ---");
  await runCase(
    "real user 1",
    fetchUser("https://jsonplaceholder.typicode.com/users/1")
  );
  await runCase(
    "real user 9999",
    fetchUser("https://jsonplaceholder.typicode.com/users/9999")
  );
}

main();
