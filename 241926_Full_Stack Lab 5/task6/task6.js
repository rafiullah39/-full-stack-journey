// Rafi Ullah
// Reg No: 241926
// Task 6: Legacy Course Registration Service Using Callbacks

const students = [
  { id: 101, name: "Ali", completed: ["CS201", "CS301"] },
  { id: 102, name: "Sara", completed: ["CS201"] },
];
const prerequisites = { CS401: ["CS301"], CS402: ["CS201"], CS499: ["CS201"] };
const seats = { CS401: 2, CS402: 5, CS499: 0 };
const registrations = [{ studentId: 101, course: "CS402" }];

function loadStudent(studentId, callback) {
  setTimeout(() => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      callback(new Error(`Student ${studentId} does not exist`));
    } else {
      callback(null, student);
    }
  }, 100);
}

function checkPrerequisites(student, courseCode, callback) {
  setTimeout(() => {
    const required = prerequisites[courseCode];
    if (!required) {
      callback(new Error(`Course ${courseCode} does not exist`));
      return;
    }
    const missing = required.filter(
      (code) => !student.completed.includes(code)
    );
    if (missing.length > 0) {
      callback(new Error(`Prerequisite not completed: ${missing.join(", ")}`));
    } else {
      callback(null, true);
    }
  }, 100);
}

function checkSeats(courseCode, callback) {
  setTimeout(() => {
    if (seats[courseCode] > 0) {
      callback(null, seats[courseCode]);
    } else {
      callback(new Error(`Course ${courseCode} is full`));
    }
  }, 100);
}

function registerCourse(student, courseCode, callback) {
  setTimeout(() => {
    const already = registrations.some(
      (r) => r.studentId === student.id && r.course === courseCode
    );
    if (already) {
      callback(
        new Error(
          `Student ${student.id} is already registered in ${courseCode}`
        )
      );
    } else {
      registrations.push({ studentId: student.id, course: courseCode });
      seats[courseCode] -= 1;
      callback(null, {
        studentId: student.id,
        course: courseCode,
        status: "REGISTERED",
      });
    }
  }, 100);
}

function registerForCourse(studentId, courseCode, done) {
  loadStudent(studentId, (err, student) => {
    if (err) return done(err);

    checkPrerequisites(student, courseCode, (err2) => {
      if (err2) return done(err2);

      checkSeats(courseCode, (err3) => {
        if (err3) return done(err3);

        registerCourse(student, courseCode, (err4, confirmation) => {
          if (err4) return done(err4);
          done(null, confirmation);
        });
      });
    });
  });
}

function report(label, err, result) {
  if (err) console.log(`[${label}] FAILED  -> ${err.message}`);
  else console.log(`[${label}] SUCCESS ->`, result);
}

registerForCourse(101, "CS401", (err, res) =>
  report("success 101/CS401", err, res)
);
registerForCourse(999, "CS401", (err, res) =>
  report("student not found", err, res)
);
registerForCourse(102, "CS401", (err, res) =>
  report("prerequisite missing", err, res)
);
registerForCourse(102, "CS499", (err, res) => report("course full", err, res));
registerForCourse(101, "CS402", (err, res) =>
  report("already registered", err, res)
);
