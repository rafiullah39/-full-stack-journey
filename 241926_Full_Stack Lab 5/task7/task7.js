// Rafi Ullah
// Reg No: 241926
// Task 7: Promise-Based Multi-Service Registration Engine

const students = [
  { id: 101, name: "Ali", completed: ["CS201", "CS301"] },
  { id: 102, name: "Sara", completed: ["CS201"] },
];
const courses = [
  { code: "CS401", title: "Advanced Web", prerequisites: ["CS301"], seats: 2 },
  { code: "CS499", title: "Capstone", prerequisites: ["CS201"], seats: 0 },
];
const registrations = [];

function getStudent(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = students.find((s) => s.id === id);
      if (student) resolve(student);
      else reject(new Error(`Student ${id} does not exist`));
    }, 50);
  });
}

function getCourse(code) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const course = courses.find((c) => c.code === code);
      if (course) resolve(course);
      else reject(new Error(`Course ${code} does not exist`));
    }, 50);
  });
}

function checkPrerequisites(student, course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const missing = course.prerequisites.filter(
        (p) => !student.completed.includes(p)
      );
      if (missing.length > 0)
        reject(new Error(`Prerequisite not completed: ${missing.join(", ")}`));
      else resolve({ student, course });
    }, 50);
  });
}

function checkSeats(student, course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (course.seats > 0) resolve({ student, course });
      else reject(new Error(`Course ${course.code} is full`));
    }, 50);
  });
}

function registerStudent(student, course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const already = registrations.some(
        (r) => r.studentId === student.id && r.course === course.code
      );
      if (already) {
        reject(
          new Error(
            `Student ${student.id} is already registered in ${course.code}`
          )
        );
        return;
      }
      registrations.push({ studentId: student.id, course: course.code });
      course.seats -= 1;
      resolve({
        studentId: student.id,
        course: course.code,
        status: "REGISTERED",
      });
    }, 50);
  });
}

function sendEmail(confirmation) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(`Email sent for ${confirmation.course}`), 40)
  );
}

function sendSMS(confirmation) {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("SMS gateway down")), 30)
  );
}

function writeAuditLog(confirmation) {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve(`Audit written for student ${confirmation.studentId}`),
      20
    )
  );
}

function registrationChain(studentId, courseCode) {
  return getStudent(studentId)
    .then((student) =>
      getCourse(courseCode).then((course) => ({ student, course }))
    )
    .then(({ student, course }) => checkPrerequisites(student, course))
    .then(({ student, course }) => checkSeats(student, course))
    .then(({ student, course }) => registerStudent(student, course));
}

function postRegistrationServices(confirmation) {
  const names = ["Email", "SMS", "Audit"];
  return Promise.allSettled([
    sendEmail(confirmation),
    sendSMS(confirmation),
    writeAuditLog(confirmation),
  ]).then((outcomes) =>
    outcomes.map((o, i) => ({ service: names[i], status: o.status }))
  );
}

function serverA() {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Server A down")), 50)
  );
}

function serverB() {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ code: "CS401", title: "Advanced Web", from: "Server B" }),
      150
    )
  );
}

function serverC() {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Server C down")), 80)
  );
}

function runPartC() {
  console.log("--- Part C ---");
  return Promise.race([serverA(), serverB()])
    .then(
      (r) => console.log("race:", r),
      (e) => console.log("race rejected:", e.message)
    )
    .then(() => Promise.any([serverA(), serverB()]))
    .then((r) => console.log("any :", r))
    .then(() => Promise.any([serverA(), serverC()]))
    .catch((e) =>
      console.log(
        "any, all servers down:",
        e.constructor.name,
        e.errors.map((x) => x.message)
      )
    );
}

function runRegistration(label, studentId, courseCode) {
  console.log(`--- ${label} ---`);
  return registrationChain(studentId, courseCode)
    .then((confirmation) => {
      console.log("Registered:", confirmation);
      return postRegistrationServices(confirmation);
    })
    .then((report) => console.log("Post-registration report:", report))
    .catch((error) => console.log("Registration failed:", error.message))
    .finally(() => console.log(`(${label} finished)\n`));
}

runRegistration("success", 101, "CS401")
  .then(() => runRegistration("student does not exist", 999, "CS401"))
  .then(() => runRegistration("prerequisite not completed", 102, "CS401"))
  .then(() => runRegistration("course full", 102, "CS499"))
  .then(() => runRegistration("already registered", 101, "CS401"))
  .then(() => runPartC());
