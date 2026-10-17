// Rafi Ullah
// Reg No: 241926
// Task 2: Academic Performance Intelligence Engine

const results = [
  { id: 1, name: "Ali", department: "CS", course: "FSWD", marks: 82 },
  { id: 2, name: "Sara", department: "CS", course: "FSWD", marks: 91 },
  { id: 3, name: "Usman", department: "SE", course: "FSWD", marks: 47 },
  { id: 4, name: "Hina", department: "AI", course: "FSWD", marks: 73 },
  { id: 5, name: "Ahmed", department: "SE", course: "FSWD", marks: 64 },
  { id: 6, name: "Zoya", department: "AI", course: "FSWD", marks: 91 },
];

const GRADE_SCALE = [
  { min: 85, grade: "A", points: 4.0 },
  { min: 80, grade: "A-", points: 3.67 },
  { min: 75, grade: "B+", points: 3.33 },
  { min: 70, grade: "B", points: 3.0 },
  { min: 65, grade: "B-", points: 2.67 },
  { min: 60, grade: "C+", points: 2.33 },
  { min: 50, grade: "C", points: 2.0 },
  { min: 0, grade: "F", points: 0.0 },
];

function isValidMarks(marks) {
  return (
    typeof marks === "number" &&
    !Number.isNaN(marks) &&
    marks >= 0 &&
    marks <= 100
  );
}

function processResults(list) {
  return list.map((student) => {
    if (!isValidMarks(student.marks)) {
      return { ...student, grade: "N/A", gradePoints: 0, status: "INVALID" };
    }
    const band = GRADE_SCALE.find((b) => student.marks >= b.min);
    return {
      ...student,
      grade: band.grade,
      gradePoints: band.points,
      status: student.marks >= 50 ? "PASS" : "FAIL",
    };
  });
}

function rankedMeritList(list) {
  return [...list].sort(
    (a, b) => b.marks - a.marks || a.name.localeCompare(b.name)
  );
}

function departmentStats(list) {
  const totals = list.reduce((acc, s) => {
    const d = acc[s.department] ?? {
      students: 0,
      sum: 0,
      highest: -Infinity,
      passed: 0,
    };
    return {
      ...acc,
      [s.department]: {
        students: d.students + 1,
        sum: d.sum + s.marks,
        highest: Math.max(d.highest, s.marks),
        passed: d.passed + (s.marks >= 50 ? 1 : 0),
      },
    };
  }, {});

  return Object.fromEntries(
    Object.entries(totals).map(([dept, d]) => [
      dept,
      {
        students: d.students,
        average: Math.round((d.sum / d.students) * 100) / 100,
        highest: d.highest,
        passed: d.passed,
      },
    ])
  );
}

function academicQueries(list) {
  const average = list.reduce((sum, s) => sum + s.marks, 0) / list.length;
  return {
    firstScoringAbove85: list.find((s) => s.marks > 85) ?? null,
    indexOfFirstFailed: list.findIndex((s) => s.marks < 50),
    atLeastOneFailed: list.some((s) => s.marks < 50),
    everyMarksValid: list.every((s) => isValidMarks(s.marks)),
    overallAverage: Math.round(average * 100) / 100,
    aboveAverage: list.filter((s) => s.marks > average).map((s) => s.name),
    topThreeNames: rankedMeritList(list)
      .slice(0, 3)
      .map((s) => s.name),
  };
}

const snapshot = JSON.stringify(results);

console.log("A. Result processing");
processResults(results).forEach((s) =>
  console.log(
    `${s.name}: ${s.marks} | ${s.grade} | ${s.gradePoints} | ${s.status}`
  )
);

console.log("\nB. Ranked merit list");
rankedMeritList(results).forEach((s, i) =>
  console.log(`${i + 1}. ${s.name} (${s.marks})`)
);

console.log("\nC. Department statistics");
console.log(departmentStats(results));
console.log(
  "New department DS:",
  departmentStats([
    ...results,
    { id: 7, name: "Dania", department: "DS", course: "FSWD", marks: 88 },
  ]).DS
);

console.log("\nD. Academic queries");
console.log(academicQueries(results));

console.log("\nBoundary and invalid marks");
const boundaryMarks = [
  100,
  85,
  84,
  80,
  79,
  75,
  74,
  70,
  69,
  65,
  64,
  60,
  59,
  50,
  49,
  0,
  101,
  -1,
  "abc",
];
processResults(
  boundaryMarks.map((m, i) => ({
    id: i,
    name: `T${i}`,
    department: "X",
    course: "T",
    marks: m,
  }))
).forEach((s) =>
  console.log(`marks ${s.marks} -> ${s.grade}, ${s.gradePoints}, ${s.status}`)
);

console.log(
  "\nOriginal results unchanged:",
  snapshot === JSON.stringify(results)
);
