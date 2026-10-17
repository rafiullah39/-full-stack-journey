// const person = {
//   name: "Ali",
//   address: {
//     city: "Islamabad"
//   }
// };

// const {name} = person;
// name = "Ahmed";
// console.log(person);
// const { address } = person;
// console.log(typeof(address))
// address.city = "Lahore";

// console.log(person);

const a = [1, 2];
const b = [3, 4];


function show(x, y, z, w) {
  console.log(x, y, z, w);
}

show(...a, ...b);