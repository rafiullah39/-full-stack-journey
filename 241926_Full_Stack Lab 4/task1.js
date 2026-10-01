var myname = "Rafi Khan";
var age = 22;
var isStudent = true;
var semester = 5; 
var university = "Air University";

console.log("----- My Biography -----");
console.log("My name is " + myname );
console.log("I am " + age + " years old.");
console.log("I am a student: " + isStudent);
console.log("I am studying in", semester, "semester");
console.log("My university is " + university);

var biography = {
      myname: "Rafi Khan",
      age: 22,
      isStudent: true,

      address: {
            city: "Swat",
            teh: "Matta",
            country: "Pakistan"
      },

      degreeProgram: {
            degree: "BSCS",
            semester: 5,
            university: "Air University"

      }

}
console.log("\n----- Biography From Object -----");

console.log("Name: " + biography.myname);
console.log("Age: " + biography.age);
console.log("Student: " + biography.isStudent);

console.log("City: " + biography.address.city);
console.log("Tehsil: " + biography.address.teh);
console.log("Country: " + biography.address.country);

console.log("Degree: " + biography.degreeProgram.degree);
console.log("Semester: " + biography.degreeProgram.semester);
console.log("University: " + biography.degreeProgram.university);