function phNo(numbers) {

    let phoneNumber = "(";

    for (let i = 0; i < 3; i++) {
        phoneNumber = phoneNumber + numbers[i];
    }

    phoneNumber = phoneNumber + ") ";

    for (let i = 3; i < 6; i++) {
        phoneNumber = phoneNumber + numbers[i];
    }

    phoneNumber = phoneNumber + "-";

    for (let i = 6; i < 10; i++) {
        phoneNumber = phoneNumber + numbers[i];
    }

    return phoneNumber;
}

let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

console.log(phNo(numbers));