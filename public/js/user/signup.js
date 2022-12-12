/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */
/* eslint-disable no-else-return */
/* eslint-disable indent */
const form = document.getElementById('signUpForm');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const gender = document.getElementById('gender');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

// eslint-disable-next-line consistent-return
form.addEventListener('submit', (event) => {
    let flag = 0;
    const firstNamevalue = firstName.value.trim();
    const lastNamevalue = lastName.value.trim();
    const gendervalue = gender.value.trim();
    const emailvalue = email.value.trim();
    const phonevalue = phone.value.trim();
    const passwordvalue = password.value.trim();
    const confirmPasswordvalue = confirmPassword.value.trim();

    if (firstNamevalue === '') {
        setError(firstName, 'Field is empty', 'firstnameerror');
        flag = 1;
    } else if (!onlyLetters(firstNamevalue)) {
        setError(firstName, 'Name should only contain letters', 'firstnameerror');
        flag = 1;
    } else {
        setSuccess(firstName, 'firstnameerror');
        flag = 0;
    }
    if (flag === 0) {
        if (lastNamevalue === '') {
            setError(lastName, 'Field is empty', 'lastnameerror');
            flag = 1;
        } else if (!onlyLettersunder(lastNamevalue)) {
            setError(lastName, 'should only contain letter, numbers, and _', 'lastnameerror');
            flag = 1;
        } else {
            setSuccess(lastName, 'lastnameerror');
            flag = 0;
        }
    }
    if (flag === 0) {
        if (gendervalue === '') {
            setError(gender, 'Field is empty', 'gendererror');
            flag = 1;
        } else {
            setSuccess(gender, 'gendererror');
            flag = 0;
        }
    }
    if (flag === 0) {
        if (emailvalue === '') {
            setError(email, 'Field is empty', 'emailerror');
            flag = 1;
        } else if (!emailvalidation(emailvalue)) {
            setError(email, 'Email ID is invalid', 'emailerror');
            flag = 1;
        } else {
            setSuccess(email, 'emailerror');
            flag = 0;
        }
    }
    if (flag === 0) {
        if (phonevalue === '') {
            setError(phone, 'Field is empty', 'phoneerror');
            flag = 1;
        } else if (phonevalue.toString().length !== 10 || isNaN(Number(phonevalue))) {
            setError(phone, 'Phone number is invalid', 'phoneerror');
            flag = 1;
        } else {
            setSuccess(phone, 'phoneerror');
            flag = 0;
        }
    }
    if (flag === 0) {
        if (passwordvalue === '') {
            setError(password, 'Field is empty', 'passworderror');
            flag = 1;
        } else if (passwordvalue.length < 8) {
            setError(password, 'Password length must be atleast 8 characters', 'passworderror');
            flag = 1;
        } else if (passwordvalue.length > 15) {
            setError(password, 'Password length must not exceed 15 characters', 'passworderror');
            flag = 1;
        } else {
            setSuccess(password, 'passworderror');
            flag = 0;
        }
    }
    if (flag === 0) {
        if (confirmPasswordvalue === '') {
            setError(confirmPassword, 'Field is empty', 'conpassworderror');
            flag = 1;
        } else if (passwordvalue !== confirmPasswordvalue) {
            setError(confirmPassword, 'Password do not match', 'conpassworderror');
            flag = 1;
        } else {
            setSuccess(confirmPassword, 'conpassworderror');
            flag = 0;
        }
    }

    if (flag === 1) {
        event.preventDefault();
    } else {
        return 0;
    }
});

function setError(element, message, id) {
    const inputControl = element.parentElement;
    document.getElementById(id).innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}

function setSuccess(element, id) {
    const inputControl = element.parentElement;
    document.getElementById(id).innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
}

function onlyLetters(str) {
    return /^[a-zA-Z]+$/.test(str);
}

// function addressPat(str) {
//     return /^[a-z0-9\s,.'-]*$/i.test(str);
// }

function onlyLettersunder(str) {
    return /^\w+$/.test(str);
}

function emailvalidation(Email) {
    return String(Email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
}

// eslint-disable-next-line no-unused-vars
function myFunction() {
    const x = document.getElementById('password');
    const y = document.getElementById('confirmPassword');
    if (x.type === 'password' && y.type === 'password') {
        x.type = 'text';
        y.type = 'text';
    } else {
        x.type = 'password';
        y.type = 'password';
    }
}
