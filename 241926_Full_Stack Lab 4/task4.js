function roundMe(...numbers) {

    if (numbers.length === 0) {
        return 0;
    }

    if (numbers.length === 1) {
        return Math.round(numbers[0]);
    }

    let roundedNumbers = [];

    for (let i = 0; i < numbers.length; i++) {
        roundedNumbers[i] = Math.round(numbers[i]);
    }

    return roundedNumbers;
}

console.log(roundMe());
console.log(roundMe(4.7));
console.log(roundMe(4.7, 4.4));