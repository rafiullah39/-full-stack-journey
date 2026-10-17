# Lab 5 - CampusFlow Report
Rafi Ullah | Reg No: 241926

## Task 1 - Status rules
- INVALID DATA: missing/non-numeric values, marks outside 0-100, age outside 17-30, unsupported program, invalid feePaid.
- REJECTED: valid data but Merit < 70, or Entry Test < 60, or Intermediate < 60.
- SELECTED: eligible AND Merit >= 80 AND fee paid.
- WAITING: eligible but Merit between 70 and 80, or fee not paid.
- Merit is calculated only after the data is confirmed valid (guard clauses return early for invalid data).

## Task 2 - Notes
- sort() mutates the array, so a copy ([...list]) is sorted and the original stays unchanged.
- Mutating methods: sort, reverse, push, pop, shift, unshift, splice, fill. Non-mutating: map, filter, find, findIndex, reduce, some, every, slice, forEach.
- Department stats use reduce with computed keys, so a new department like DS works automatically.

## Task 3 - Reference challenge
original vs updated object: DIFFERENT. Objects are compared by reference, and the spread syntax creates a new object.
original vs updated address: DIFFERENT. { ...current.address, ...newAddress } creates a new address object, so city changes only in the new one and sector is copied.
original vs updated contact: DIFFERENT. { ...current.contact, ...newContact } creates a new contact object, so email is copied and phone is added only in the new one.
Because every level is copied, changing the updated student can never change the original.
?? is used instead of || so valid values 0, false and '' are not replaced.

## Task 4 - Concepts
- constructor: special method that initializes a new object; this refers to the new object.
- new: creates an empty object, links it to the class prototype, runs the constructor and returns the object.
- this: decided by how a function is called (the object before the dot), not where it is written.
- extends: sets up the prototype chain so Student and FacultyMember inherit from Person.
- super: super(...) calls the parent constructor (required before using this); super.introduce() reuses the parent method.
- method overriding: Student and FacultyMember define their own introduce().
- runtime polymorphism: users.forEach(user => user.introduce()) runs the version belonging to each object's actual class.
- instanceof: checks the prototype chain, so a Student is also a Person but not a FacultyMember.
- call(): runs a function immediately with a chosen this (guest used Person's introduce).
- detached method: const fn = student.introduce loses the object, so fn() has this = undefined (class code is strict mode) and throws a TypeError.
- bind(): returns a new function with this permanently fixed to the student, so it works safely.

## Task 5 - Notes
- Student.js uses a default export; gradeUtils.js uses named exports; calculateGrade is imported with an alias.
- Error types: SyntaxError for malformed JSON, TypeError for wrong types, RangeError for marks outside 0-100, Error for missing/duplicate IDs and missing course codes.

## Task 6 - Why callbacks become hard to maintain
- Nesting: every new dependent step goes one level deeper (pyramid of doom), so code becomes hard to read, change and reorder.
- Error handling: every level needs its own if (err) return done(err); missing one lets the workflow continue with bad data or hides the error.
- try/catch cannot catch errors thrown inside a later setTimeout callback, so error handling cannot be centralized.
- Callbacks can accidentally be called twice or never.

## Task 7 - Combinator justification
- Promise.allSettled (Part B): the three services are independent and the status of each is needed even if one fails. Promise.all would reject as soon as SMS fails.
- Promise.any (Part C): needs the first SUCCESSFUL result. Promise.race settles with the first result even if it is a failure, so a fast failing server would break it. Promise.any ignores failures and rejects (AggregateError) only if all servers fail.
- Every .then() returns its value/promise so the next stage receives the data.

## Task 8 - Notes
- Promise.all is used because users, courses and results are independent, so all three start together and the total time is about the slowest call, not the sum.
- fetchWithTimeout clears the timer in finally, so it is cleaned up on success and on failure.
- Failure types are distinguished by HttpError, NetworkError, InvalidJsonError and TimeoutError.
- failed student = a student whose average marks are below 50.