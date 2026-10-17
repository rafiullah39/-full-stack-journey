// Rafi Ullah
// Reg No: 241926
// Task 1: Admission Decision and Data Sanitization Engine

const SELECTION_MERIT = 80;

function toNumber(value) {
  if (value === undefined || value === null) return NaN;
  const text = String(value).trim();
  if (text === "") return NaN;
  return Number(text);
}

function toBoolean(value) {
  const text = String(value).trim().toLowerCase();
  if (text === "true") return true;
  if (text === "false") return false;
  return null;
}

function readNumber(label, raw, min, max, errors) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    errors.push(`${label} is missing`);
    return NaN;
  }
  const num = toNumber(raw);
  if (Number.isNaN(num)) {
    errors.push(`${label} is not a valid number ("${raw}")`);
    return NaN;
  }
  if (num < min || num > max) {
    errors.push(`${label} must be between ${min} and ${max} (got ${num})`);
    return NaN;
  }
  return num;
}

function validateApplicant(applicant) {
  const errors = [];

  if (applicant === null || typeof applicant !== "object") {
    return {
      valid: false,
      errors: ["Applicant record is not an object"],
      clean: null,
    };
  }

  const id = applicant.id ? String(applicant.id).trim() : "";
  const name = typeof applicant.name === "string" ? applicant.name.trim() : "";
  if (!id) errors.push("id is missing");
  if (!name) errors.push("name is missing");

  const age = readNumber("age", applicant.age, 17, 30, errors);
  const matric = readNumber(
    "matricMarks",
    applicant.matricMarks,
    0,
    100,
    errors
  );
  const inter = readNumber(
    "intermediateMarks",
    applicant.intermediateMarks,
    0,
    100,
    errors
  );
  const entry = readNumber("entryTest", applicant.entryTest, 0, 100, errors);

  const program =
    typeof applicant.program === "string"
      ? applicant.program.trim().toUpperCase()
      : "";
  switch (program) {
    case "BSCS":
    case "BSSE":
    case "BSAI":
      break;
    default:
      errors.push(`program "${applicant.program}" is not supported`);
  }

  const feePaid = toBoolean(applicant.feePaid);
  if (feePaid === null)
    errors.push(`feePaid is invalid ("${applicant.feePaid}")`);

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    clean: valid
      ? { id, name, age, matric, inter, entry, program, feePaid }
      : null,
  };
}

function calculateMerit(matric, inter, entry) {
  return matric * 0.2 + inter * 0.3 + entry * 0.5;
}

function processApplicant(applicant) {
  const check = validateApplicant(applicant);

  if (!check.valid) {
    return {
      id: applicant?.id ?? "UNKNOWN",
      name: applicant?.name ?? "UNKNOWN",
      program:
        typeof applicant?.program === "string"
          ? applicant.program.trim().toUpperCase()
          : "UNKNOWN",
      merit: null,
      status: "INVALID DATA",
      errors: check.errors,
    };
  }

  const { id, name, program, matric, inter, entry, feePaid } = check.clean;
  const rawMerit = calculateMerit(matric, inter, entry);
  const eligible = rawMerit >= 70 && entry >= 60 && inter >= 60;

  let status;
  if (!eligible) {
    status = "REJECTED";
  } else {
    status = rawMerit >= SELECTION_MERIT && feePaid ? "SELECTED" : "WAITING";
  }

  return {
    id,
    name,
    program,
    merit: Math.round(rawMerit * 100) / 100,
    eligible,
    feePaid,
    status,
    errors: [],
  };
}

function summarize(processed) {
  const valid = processed.filter((p) => p.status !== "INVALID DATA");

  const applicantsPerProgram = {};
  for (const p of processed) {
    applicantsPerProgram[p.program] =
      (applicantsPerProgram[p.program] ?? 0) + 1;
  }

  let highest = null;
  let lowest = null;
  let total = 0;
  for (const p of valid) {
    total += p.merit;
    if (highest === null || p.merit > highest.merit) highest = p;
    if (lowest === null || p.merit < lowest.merit) lowest = p;
  }

  return {
    validApplicants: valid.length,
    invalidApplicants: processed.length - valid.length,
    highestMeritApplicant: highest
      ? { name: highest.name, merit: highest.merit }
      : null,
    lowestMeritAmongValid: lowest
      ? { name: lowest.name, merit: lowest.merit }
      : null,
    averageMerit:
      valid.length > 0 ? Math.round((total / valid.length) * 100) / 100 : 0,
    applicantsPerProgram,
  };
}

function processAll(applicants) {
  if (!Array.isArray(applicants))
    throw new TypeError("applicants must be an array");
  const processed = applicants.map(processApplicant);
  return { processed, summary: summarize(processed) };
}

const applicants = [
  {
    id: "A101",
    name: "Sara Khan",
    age: "19",
    matricMarks: "91",
    intermediateMarks: "87",
    entryTest: "78",
    program: "BSCS",
    feePaid: "true",
  },
  {
    id: "A102",
    name: "Ahmed Ali",
    age: "twenty",
    matricMarks: "88",
    intermediateMarks: "",
    entryTest: "72",
    program: "BSSE",
    feePaid: "false",
  },
  {
    id: "A103",
    name: "Hassan",
    age: "18",
    matricMarks: "76",
    intermediateMarks: "83",
    entryTest: "91",
    program: "BSAI",
    feePaid: "true",
  },
  {
    id: "A104",
    name: "Bilal",
    age: "20",
    matricMarks: "70",
    intermediateMarks: "70",
    entryTest: "72",
    program: "BSCS",
    feePaid: "true",
  },
  {
    id: "A105",
    name: "Mehwish",
    age: "21",
    matricMarks: "90",
    intermediateMarks: "90",
    entryTest: "90",
    program: "BSSE",
    feePaid: "false",
  },
  {
    id: "A106",
    name: "Kamran",
    age: "19",
    matricMarks: "95",
    intermediateMarks: "95",
    entryTest: "55",
    program: "BSCS",
    feePaid: "true",
  },
  {
    id: "A107",
    name: "Low Bound",
    age: "17",
    matricMarks: "0",
    intermediateMarks: "0",
    entryTest: "0",
    program: "BSAI",
    feePaid: "true",
  },
  {
    id: "A108",
    name: "High Bound",
    age: "30",
    matricMarks: "100",
    intermediateMarks: "100",
    entryTest: "100",
    program: "BSAI",
    feePaid: "true",
  },
  {
    id: "A109",
    name: "Merit 70 exact",
    age: "20",
    matricMarks: "70",
    intermediateMarks: "70",
    entryTest: "70",
    program: "BSCS",
    feePaid: "true",
  },
  {
    id: "A110",
    name: "Too Old",
    age: "31",
    matricMarks: "80",
    intermediateMarks: "80",
    entryTest: "80",
    program: "BSCS",
    feePaid: "true",
  },
  {
    id: "A111",
    name: "Bad Data",
    age: "20",
    matricMarks: "101",
    intermediateMarks: "-5",
    entryTest: "abc",
    program: "BSEE",
    feePaid: "maybe",
  },
  {
    name: "No Id",
    age: "20",
    matricMarks: "80",
    intermediateMarks: "80",
    entryTest: "80",
    program: "BSCS",
    feePaid: "true",
  },
  null,
];

const before = JSON.stringify(applicants);
const { processed, summary } = processAll(applicants);

for (const p of processed) {
  console.log(
    `${p.id} | ${p.name} | merit: ${p.merit} | ${p.status}${
      p.errors.length ? " -> " + p.errors.join("; ") : ""
    }`
  );
}
console.log("\nSUMMARY");
console.log(summary);
console.log("Source data unchanged:", before === JSON.stringify(applicants));
