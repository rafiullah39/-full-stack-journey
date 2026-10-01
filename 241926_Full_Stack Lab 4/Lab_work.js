const person = {
      Name:"Rafi",
      age : '22' ,
      address: {
            City: "Swat", 
            teh : "Matta" ,
            country: "Pakistan" , 
      }

}

for(const key in person)
 {
      console.log(person[key]);
 }

console.log(person.address.City)
 const Names = ['Rafi' , 1 , 33 , 'Shehzad' , 'Ahmed']
 for(const n of Names)
 {
      console.log(n);
 }