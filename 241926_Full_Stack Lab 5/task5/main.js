// Rafi Ullah
// Reg No: 241926
// Task 5: caller demonstrating try, catch and finally

import Student from "./Student.js";
import { calculateGrade as gradeOf } from "./gradeUtils.js";
import { processTranscripts as processTranscript } from "./transcriptService.js";

const goodData = `
[
  { "id": 101, "name": "Ali", "courses": [ { "code": "CS301", "marks": 81 }, { "code": "CS302", "marks": 74 } ] },
  { "id": 102, "name": "Sara", "courses": [ { "code": "CS301", "marks": 92 }, { "code": "CS302", "marks": 55 } ] }
]`;

const testCases = [
  { label: "valid data", raw: goodData },
  { label: "malformed JSON", raw: '[ { "id": 1, "name": "Ali", ' },
  { label: "not a string", raw: 12345 },
  { label: "missing id", raw: '[{ "name": "Ali", "courses": [] }]' },
  {
    label: "duplicate id",
    raw: '[{"id":1,"name":"A","courses":[]},{"id":1,"name":"B","courses":[]}]',
  },
  {
    label: "marks above 100",
    raw: '[{"id":1,"name":"A","courses":[{"code":"CS1","marks":101}]}]',
  },
  {
    label: "marks below 0",
    raw: '[{"id":1,"name":"A","courses":[{"code":"CS1","marks":-1}]}]',
  },
  {
    label: "missing course code",
    raw: '[{"id":1,"name":"A","courses":[{"marks":50}]}]',
  },
  {
    label: "marks as string",
    raw: '[{"id":1,"name":"A","courses":[{"code":"CS1","marks":"80"}]}]',
  },
];

for (const test of testCases) {
  console.log(`\n--- ${test.label} ---`);
  try {
    const { report, json } = processTranscript(test.raw);
    console.log("Students in report:", report.totalStudents);
    console.log("JSON report:\n" + json);
  } catch (error) {
    console.log(`${error.name}: ${error.message}`);
  } finally {
    console.log(`(finished: ${test.label})`);
  }
}

const direct = new Student(7, "Direct", [{ code: "CS999", marks: 88 }]);
console.log("\nDirect Student:", direct.name, "| grade of 88 =", gradeOf(88));
