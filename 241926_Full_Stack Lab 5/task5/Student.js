// Rafi Ullah
// Reg No: 241926
// Task 5: Student class (default export)

export default class Student {
  constructor(id, name, courses = []) {
    this.id = id;
    this.name = name;
    this.courses = courses;
  }

  getMarks() {
    return this.courses.map((course) => course.marks);
  }
}
