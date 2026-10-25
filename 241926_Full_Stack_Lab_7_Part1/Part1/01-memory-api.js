// Rafi Ullah
// Reg No: 241926
// Lab Task 7 (Part 1): Student Management System, in-memory REST API.
// Modules: students, teachers, attendance, marks (full CRUD on each).
const http = require('node:http');

const isText = (v) => typeof v === 'string' && v.trim() !== '';
const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

const modules = {
  students: {
    items: [],
    nextId: 1,
    unique: 'rollNo',
    validate(b) {
      if (!isText(b.name)) return { error: 'name required' };
      if (!isText(b.rollNo)) return { error: 'rollNo required' };
      if (!isText(b.email)) return { error: 'email required' };
      if (!isText(b.department)) return { error: 'department required' };
      return { data: { name: b.name.trim(), rollNo: b.rollNo.trim(), email: b.email.trim(), department: b.department.trim() } };
    },
  },
  teachers: {
    items: [],
    nextId: 1,
    unique: 'email',
    validate(b) {
      if (!isText(b.name)) return { error: 'name required' };
      if (!isText(b.email)) return { error: 'email required' };
      if (!isText(b.subject)) return { error: 'subject required' };
      return { data: { name: b.name.trim(), email: b.email.trim(), subject: b.subject.trim() } };
    },
  },
  attendance: {
    items: [],
    nextId: 1,
    validate(b) {
      if (!Number.isInteger(b.studentId) || !studentExists(b.studentId)) return { error: 'valid studentId required' };
      if (!isDate(b.date)) return { error: 'date required (YYYY-MM-DD)' };
      if (!['present', 'absent', 'leave'].includes(b.status)) return { error: 'status must be present, absent or leave' };
      return { data: { studentId: b.studentId, date: b.date, status: b.status } };
    },
  },
  marks: {
    items: [],
    nextId: 1,
    validate(b) {
      if (!Number.isInteger(b.studentId) || !studentExists(b.studentId)) return { error: 'valid studentId required' };
      if (!isText(b.subject)) return { error: 'subject required' };
      if (typeof b.totalMarks !== 'number' || b.totalMarks <= 0) return { error: 'totalMarks must be a positive number' };
      if (typeof b.obtainedMarks !== 'number' || b.obtainedMarks < 0 || b.obtainedMarks > b.totalMarks) {
        return { error: 'obtainedMarks must be between 0 and totalMarks' };
      }
      return { data: { studentId: b.studentId, subject: b.subject.trim(), totalMarks: b.totalMarks, obtainedMarks: b.obtainedMarks } };
    },
  },
};

function studentExists(id) {
  return modules.students.items.some((s) => s.id === id);
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > 65536) throw new HttpError(413, 'Too large');
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'JSON object required');
  return body;
}

function checkUnique(mod, data, ignoreId) {
  if (!mod.unique) return;
  const clash = mod.items.some((x) => x.id !== ignoreId && x[mod.unique].toLowerCase() === data[mod.unique].toLowerCase());
  if (clash) throw new HttpError(409, `${mod.unique} already exists`);
}

// One generic CRUD handler is shared by all four modules.
async function handleCrud(req, res, mod, id, query, send) {
  if (id === null) {
    if (req.method === 'GET') {
      let list = mod.items;
      const sid = query.get('studentId');
      if (sid !== null) list = list.filter((x) => String(x.studentId) === sid);
      return send(200, list);
    }
    if (req.method === 'POST') {
      const { error, data } = mod.validate(await readJson(req));
      if (error) throw new HttpError(400, error);
      checkUnique(mod, data, null);
      const item = { id: mod.nextId++, ...data };
      mod.items.push(item);
      return send(201, item);
    }
    throw new HttpError(405, 'Method not allowed');
  }

  const index = mod.items.findIndex((x) => x.id === id);
  if (index === -1) throw new HttpError(404, 'Not found');

  if (req.method === 'GET') return send(200, mod.items[index]);
  if (req.method === 'PUT') {
    const { error, data } = mod.validate(await readJson(req));
    if (error) throw new HttpError(400, error);
    checkUnique(mod, data, id);
    mod.items[index] = { id, ...data };
    return send(200, mod.items[index]);
  }
  if (req.method === 'DELETE') {
    const [removed] = mod.items.splice(index, 1);
    // Deleting a student also removes that student's attendance and marks.
    if (mod === modules.students) {
      modules.attendance.items = modules.attendance.items.filter((a) => a.studentId !== id);
      modules.marks.items = modules.marks.items.filter((m) => m.studentId !== id);
    }
    return send(200, removed);
  }
  throw new HttpError(405, 'Method not allowed');
}

const server = http.createServer(async (req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  try {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);
    const mod = modules[parts[0]];
    if (!mod || parts.length > 2) return send(404, { error: 'Not found' });

    let id = null;
    if (parts.length === 2) {
      if (!/^\d+$/.test(parts[1])) return send(400, { error: 'id must be a number' });
      id = Number(parts[1]);
    }
    return await handleCrud(req, res, mod, id, url.searchParams, send);
  } catch (error) {
    if (error instanceof HttpError) return send(error.status, { error: error.message });
    console.error(error);
    return send(500, { error: 'Server error' });
  }
});

server.listen(3004, () => {
  console.log('Student Management API: http://localhost:3004');
  console.log('Endpoints: /students  /teachers  /attendance  /marks');
});
