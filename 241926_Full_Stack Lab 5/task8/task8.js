// Rafi Ullah
// Reg No: 241926
// Task 8: Concurrent Academic API Aggregator with async/await

class HttpError extends Error {
  constructor(url, status, statusText) {
    super(`HTTP ${status} ${statusText} for ${url}`);
    this.name = "HttpError";
    this.status = status;
  }
}

class NetworkError extends Error {
  constructor(url, cause) {
    super(`Network failure for ${url}: ${cause.message}`);
    this.name = "NetworkError";
    this.cause = cause;
  }
}

class InvalidJsonError extends Error {
  constructor(url, cause) {
    super(`Invalid JSON from ${url}: ${cause.message}`);
    this.name = "InvalidJsonError";
    this.cause = cause;
  }
}

class TimeoutError extends Error {
  constructor(url, milliseconds) {
    super(`Request to ${url} timed out after ${milliseconds}ms`);
    this.name = "TimeoutError";
  }
}

const FAKE_DATA = {
  "/users": [
    { id: 1, name: "Ali", department: "CS" },
    { id: 2, name: "Sara", department: "CS" },
    { id: 3, name: "Usman", department: "SE" },
    { id: 4, name: "Hina", department: "AI" },
    { id: 5, name: "Ahmed", department: "SE" },
    { id: 6, name: "Zoya", department: "AI" },
  ],
  "/courses": [
    { code: "FSWD", title: "Full Stack Web Dev" },
    { code: "DSA", title: "Data Structures" },
  ],
  "/results": [
    { studentId: 1, course: "FSWD", marks: 82 },
    { studentId: 1, course: "DSA", marks: 78 },
    { studentId: 2, course: "FSWD", marks: 91 },
    { studentId: 2, course: "DSA", marks: 88 },
    { studentId: 3, course: "FSWD", marks: 47 },
    { studentId: 3, course: "DSA", marks: 40 },
    { studentId: 4, course: "FSWD", marks: 73 },
    { studentId: 4, course: "DSA", marks: 69 },
    { studentId: 5, course: "FSWD", marks: 64 },
    { studentId: 5, course: "DSA", marks: 58 },
    { studentId: 6, course: "FSWD", marks: 91 },
    { studentId: 6, course: "DSA", marks: 95 },
  ],
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

function fakeFetch(url, options = {}) {
  const { signal } = options;
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The operation was aborted.", "AbortError"));
      return;
    }

    const delay = url === "/slow" ? 800 : 150;

    const timerId = setTimeout(() => {
      if (url === "/network-fail") {
        reject(new TypeError("fetch failed"));
      } else if (url === "/error") {
        resolve(new FakeResponse(500, "Internal Server Error", "{}"));
      } else if (url === "/bad-json") {
        resolve(new FakeResponse(200, "OK", "{ this is not json"));
      } else if (url === "/slow") {
        resolve(
          new FakeResponse(
            200,
            "OK",
            JSON.stringify({ message: "slow but successful" })
          )
        );
      } else if (url in FAKE_DATA) {
        resolve(new FakeResponse(200, "OK", JSON.stringify(FAKE_DATA[url])));
      } else {
        resolve(new FakeResponse(404, "Not Found", "{}"));
      }
    }, delay);

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timerId);
          reject(new DOMException("The operation was aborted.", "AbortError"));
        },
        { once: true }
      );
    }
  });
}

async function readResponse(url, response) {
  if (!response.ok) {
    throw new HttpError(url, response.status, response.statusText);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new InvalidJsonError(url, error);
  }
}

async function getJSON(url, fetchImplementation) {
  let response;
  try {
    response = await fetchImplementation(url);
  } catch (error) {
    throw new NetworkError(url, error);
  }
  return await readResponse(url, response);
}

async function fetchWithTimeout(url, milliseconds) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), milliseconds);
  try {
    let response;
    try {
      response = await fakeFetch(url, { signal: controller.signal });
    } catch (error) {
      if (error.name === "AbortError")
        throw new TimeoutError(url, milliseconds);
      throw new NetworkError(url, error);
    }
    return await readResponse(url, response);
  } finally {
    clearTimeout(timerId);
  }
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function buildDashboard(users, courses, results) {
  const studentSummaries = users
    .map((user) => {
      const own = results.filter((r) => r.studentId === user.id);
      const average =
        own.length > 0
          ? own.reduce((sum, r) => sum + r.marks, 0) / own.length
          : null;
      return {
        id: user.id,
        name: user.name,
        department: user.department,
        average,
      };
    })
    .filter((s) => s.average !== null);

  const overallAverage =
    results.reduce((sum, r) => sum + r.marks, 0) / results.length;
  const topStudent = studentSummaries.reduce((best, s) =>
    s.average > best.average ? s : best
  );
  const failedStudents = studentSummaries.filter((s) => s.average < 50).length;

  const deptTotals = studentSummaries.reduce((acc, s) => {
    const d = acc[s.department] ?? { students: 0, sum: 0, highest: -Infinity };
    return {
      ...acc,
      [s.department]: {
        students: d.students + 1,
        sum: d.sum + s.average,
        highest: Math.max(d.highest, s.average),
      },
    };
  }, {});

  return {
    totalStudents: users.length,
    totalCourses: courses.length,
    overallAverageMarks: round2(overallAverage),
    highestPerformingStudent: {
      name: topStudent.name,
      average: round2(topStudent.average),
    },
    failedStudents,
    departmentStatistics: Object.fromEntries(
      Object.entries(deptTotals).map(([dept, d]) => [
        dept,
        {
          students: d.students,
          averageMarks: round2(d.sum / d.students),
          highestAverage: round2(d.highest),
        },
      ])
    ),
  };
}

async function loadDashboard(fetchImplementation) {
  const [users, courses, results] = await Promise.all([
    getJSON("/users", fetchImplementation),
    getJSON("/courses", fetchImplementation),
    getJSON("/results", fetchImplementation),
  ]);
  return buildDashboard(users, courses, results);
}

async function attempt(label, promise) {
  try {
    const value = await promise;
    console.log(`[${label}] OK ->`, JSON.stringify(value));
  } catch (error) {
    console.log(`[${label}] ${error.name}: ${error.message}`);
  }
}

async function main() {
  console.log("=== getJSON scenarios ===");
  await attempt("200 success", getJSON("/courses", fakeFetch));
  await attempt("404", getJSON("/missing", fakeFetch));
  await attempt("500", getJSON("/error", fakeFetch));
  await attempt("network failure", getJSON("/network-fail", fakeFetch));
  await attempt("invalid JSON", getJSON("/bad-json", fakeFetch));

  console.log("\n=== fetchWithTimeout ===");
  await attempt("slow, timeout 300ms", fetchWithTimeout("/slow", 300));
  await attempt("slow, timeout 2000ms", fetchWithTimeout("/slow", 2000));
  await attempt("fast success", fetchWithTimeout("/users", 1000));
  await attempt("404", fetchWithTimeout("/missing", 1000));
  await attempt("500", fetchWithTimeout("/error", 1000));
  await attempt("network failure", fetchWithTimeout("/network-fail", 1000));
  await attempt("invalid JSON", fetchWithTimeout("/bad-json", 1000));

  console.log("\n=== concurrent dashboard ===");
  const start = performance.now();
  const dashboard = await loadDashboard(fakeFetch);
  console.log(dashboard);
  console.log(
    `Loaded in ~${Math.round(
      performance.now() - start
    )}ms (3 concurrent calls, about 150ms)`
  );
}

main();
