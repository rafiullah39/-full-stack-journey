// Rafi Ullah
// Reg No: 241926
// Task 3: Safe Student Profile Update Service

const student = {
  id: 101,
  name: "Ali",
  marks: 0,
  scholarship: false,
  address: { city: "Islamabad", sector: "F-10" },
  contact: { email: "ali@university.edu" },
};

const update = {
  name: "Ali Khan",
  address: { city: "Rawalpindi" },
  contact: { phone: "03001234567" },
};

function updateStudent(current, changes = {}) {
  if (current === null || typeof current !== "object") {
    throw new TypeError("current student must be an object");
  }

  const {
    name: newName,
    marks: newMarks,
    scholarship: newScholarship,
    address: newAddress = {},
    contact: newContact = {},
    id: ignoredId,
    ...otherChanges
  } = changes;

  const name = newName ?? current.name;
  const marks = newMarks ?? current.marks;
  const scholarship = newScholarship ?? current.scholarship;

  return {
    ...current,
    ...otherChanges,
    name,
    marks,
    scholarship,
    address: { ...current.address, ...newAddress },
    contact: { ...current.contact, ...newContact },
  };
}

function describeStudent(s) {
  const {
    id,
    name: studentName,
    address: { city: homeCity = "Unknown", sector: homeSector = "N/A" } = {},
    contact: { email: mail = "no-email", phone = "no-phone" } = {},
  } = s;
  const cityViaChaining = s?.address?.city ?? "Unknown";
  return `#${id} ${studentName} | ${homeCity}/${homeSector} | ${mail} | ${phone} | chaining: ${cityViaChaining}`;
}

function applyUpdates(base, ...updates) {
  return updates.reduce((acc, u) => updateStudent(acc, u), base);
}

function arrayDestructuringDemo() {
  const [first, , third = "default-third", ...others] = [
    "a",
    "b",
    undefined,
    "d",
    "e",
  ];
  let x = 1;
  let y = 2;
  [x, y] = [y, x];
  return { first, third, others, x, y };
}

const originalSnapshot = JSON.stringify(student);
const updated = updateStudent(student, update);

console.log("Original:", student);
console.log("Updated :", updated);
console.log(
  "Original not modified:",
  originalSnapshot === JSON.stringify(student)
);

console.log(
  "\nFalsy valid values kept:",
  updateStudent(student, { marks: 0, scholarship: false, name: "" })
);
console.log("Empty update          :", updateStudent(student, {}));
console.log(
  "Missing nested data   :",
  describeStudent({ id: 1, name: "NoAddress" })
);
console.log("Updated described     :", describeStudent(updated));
console.log(
  "Rest parameters       :",
  applyUpdates(
    student,
    { marks: 55 },
    { scholarship: true },
    { address: { sector: "G-9" } }
  )
);
console.log("Array destructuring   :", arrayDestructuringDemo());

console.log("\nREFERENCE CHECK");
console.log(
  "original vs updated object  :",
  student === updated ? "EQUAL" : "DIFFERENT"
);
console.log(
  "original vs updated address :",
  student.address === updated.address ? "EQUAL" : "DIFFERENT"
);
console.log(
  "original vs updated contact :",
  student.contact === updated.contact ? "EQUAL" : "DIFFERENT"
);
