// Rafi Ullah
// Reg No: 241926
// Task 5: transcript processing and fault-tolerant JSON

import Student from "./Student.js";
import {
  calculateAverage,
  calculateGPA,
  calculateGrade as gradeOf,
} from "./gradeUtils.js";

export function parseTranscriptJson(rawText) {
  if (typeof rawText !== "string") {
    throw new TypeError("Transcript data must be a JSON string");
  }
  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new SyntaxError(`Malformed JSON: ${error.message}`);
  }
}

export function validateStudents(data) {
  if (!Array.isArray(data))
    throw new TypeError("Transcript root must be an array of students");

  const seenIds = new Set();
  const students = [];

  for (const record of data) {
    if (record === null || typeof record !== "object") {
      throw new TypeError("Each student record must be an object");
    }
    const { id, name, courses } = record;

    if (id === undefined || id === null || id === "") {
      throw new Error(`Missing student ID (student: ${name ?? "unknown"})`);
    }
    if (seenIds.has(id)) throw new Error(`Duplicate student ID: ${id}`);
    seenIds.add(id);

    if (typeof name !== "string" || name.trim() === "") {
      throw new TypeError(`Student ${id} has an invalid name`);
    }
    if (!Array.isArray(courses)) {
      throw new TypeError(`Student ${id} must have a courses array`);
    }

    for (const course of courses) {
      if (!course?.code || typeof course.code !== "string") {
        throw new Error(`Student ${id} has a course with a missing code`);
      }
      if (typeof course.marks !== "number" || Number.isNaN(course.marks)) {
        throw new TypeError(
          `Student ${id}, course ${course.code}: marks must be a number`
        );
      }
      if (course.marks < 0 || course.marks > 100) {
        throw new RangeError(
          `Student ${id}, course ${course.code}: marks ${course.marks} out of range 0-100`
        );
      }
    }

    students.push(new Student(id, name.trim(), courses));
  }
  return students;
}

export function buildReport(students) {
  return {
    totalStudents: students.length,
    students: students.map((student) => {
      const marks = student.getMarks();
      return {
        id: student.id,
        name: student.name,
        average: calculateAverage(marks),
        gpa: calculateGPA(marks),
        courses: student.courses.map((c) => ({
          code: c.code,
          marks: c.marks,
          grade: gradeOf(c.marks),
        })),
      };
    }),
  };
}

export function reportToJson(report) {
  return JSON.stringify(report, null, 2);
}

export function processTranscripts(rawText) {
  const data = parseTranscriptJson(rawText);
  const students = validateStudents(data);
  const report = buildReport(students);
  return { report, json: reportToJson(report) };
}
