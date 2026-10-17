// Rafi Ullah
// Reg No: 241926
// Task 4: University User Hierarchy and Dynamic this

class Person {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  introduce() {
    return `Hi, I am ${this.name} (${this.email})`;
  }
}

class Student extends Person {
  constructor(name, email, rollNo, marks) {
    super(name, email);
    this.rollNo = rollNo;
    this.marks = marks;
  }

  introduce() {
    return `${super.introduce()} | Student, Roll No: ${this.rollNo}`;
  }

  getResult() {
    return this.marks >= 50 ? `${this.name}: PASS (${this.marks})` : `${this.name}: FAIL (${this.marks})`;
  }
}

class FacultyMember extends Person {
  constructor(name, email, employeeId, department) {
    super(name, email);
    this.employeeId = employeeId;
    this.department = department;
  }

  introduce() {
    return `${super.introduce()} | Faculty, ID: ${this.employeeId}, Dept: ${this.department}`;
  }
}

const users = [
  new Student('Ali', 'ali@uni.edu', 'F24-001', 82),
  new FacultyMember('Dr. Sana', 'sana@uni.edu', 'E-100', 'CS'),
  new Student('Sara', 'sara@uni.edu', 'F24-002', 41),
  new FacultyMember('Dr. Omar', 'omar@uni.edu', 'E-101', 'SE')
];

users.forEach(user => console.log(user.introduce()));

console.log('\ninstanceof');
console.log('users[0] instanceof Student       :', users[0] instanceof Student);
console.log('users[0] instanceof Person        :', users[0] instanceof Person);
console.log('users[0] instanceof FacultyMember :', users[0] instanceof FacultyMember);
console.log('users[1] instanceof FacultyMember :', users[1] instanceof FacultyMember);
console.log('users[1] instanceof Person        :', users[1] instanceof Person);
users.filter(u => u instanceof Student).forEach(s => console.log(s.getResult()));

const guest = { name: 'Dr. Ahmed', email: 'ahmed@example.com' };
console.log('\ncall():', Person.prototype.introduce.call(guest));

const student = users[0];
const fn = student.introduce;
try {
  console.log(fn());
} catch (error) {
  console.log('Detached fn() failed ->', error.name + ':', error.message);
}

const safeIntroduce = student.introduce.bind(student);
console.log('bind():', safeIntroduce());