function absMe(...numbers) {

    if (numbers.length === 0) {
        return 0;
    }

    if (numbers.length === 1) {
        return Math.abs(numbers[0]);
    }

    let result = [];

    for (let i = 0; i < numbers.length; i++) {
        result[i] = Math.abs(numbers[i]);
    }

    return result;
}

console.log(absMe());
console.log(absMe(-5));
console.log(absMe(-5, 7, -10));