let givenPrime = 11;
let nextNumber = givenPrime + 1;

while (true) {

    let isPrime = true;

    for (let i = 2; i < nextNumber; i++) {

        if (nextNumber % i === 0) {
            isPrime = false;
            break;
        }
    }

    if (isPrime) {
        console.log("Prime number after", givenPrime, "is", nextNumber);
        break;
    }

    nextNumber++;
}