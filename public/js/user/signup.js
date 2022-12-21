/* eslint-disable linebreak-style */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
const form = document.getElementById('sign_form');
const FirstName = document.getElementById('firstName');
const LastName = document.getElementById('lastName');
const Gender = document.getElementById('gender');
const Email = document.getElementById('email');
const Phone = document.getElementById('phone');
const Password = document.getElementById('password');
const ConfirmPassword = document.getElementById('confirmPassword');

// eslint-disable-next-line consistent-return
form.addEventListener('submit', (event) => {
  let flag = 0;
  const firstNamevalue = FirstName.value.trim();
  console.log(firstNamevalue.trim());
  const lastNamevalue = LastName.value.trim();
  const gendervalue = Gender.value.trim();
  const emailvalue = Email.value.trim();
  const phonevalue = Phone.value.trim();
  const passwordvalue = Password.value.trim();
  const confirmpasswordvalue = ConfirmPassword.value.trim();

  if (firstNamevalue === '') {
    setError(FirstName, 'Field is empty', 'nameerror');
    flag = 1;
  } else if (!onlyLetters(firstNamevalue)) {
    setError(FirstName, 'Name should only contain letters', 'nameerror');
    flag = 1;
  } else {
    setSuccess(FirstName, 'nameerror');
    flag = 0;
  }
  if (lastNamevalue === '') {
    setError(Gender, 'Field is empty', 'nameerror');
    flag = 1;
  } else if (!onlyLetters(lastNamevalue)) {
    setError(LastName, 'Name should only contain letters', 'nameerror');
    flag = 1;
  } else {
    setSuccess(LastName, 'nameerror');
    flag = 0;
  }
  if (gendervalue === '') {
    setError(Gender, 'Field is empty', 'nameerror');
    flag = 1;
  } else if (!onlyLetters(gendervalue)) {
    setError(Gender, 'Gender should only contain letters', 'nameerror');
    flag = 1;
  } else {
    setSuccess(Gender, 'nameerror');
    flag = 0;
  }
  if (flag === 0) {
    if (emailvalue === '') {
      setError(Email, 'Field is empty', 'emailerror');
      flag = 1;
    } else if (!emailvalidation(emailvalue)) {
      setError(Email, 'Email ID is invalid', 'emailerror');
      flag = 1;
    } else {
      setSuccess(Email, 'emailerror');
      flag = 0;
    }
  }
  if (flag === 0) {
    if (phonevalue === '') {
      setError(Phone, 'Field is empty', 'phoneerror');
      flag = 1;
    } else if (phonevalue.toString().length !== 10 || isNaN(Number(phonevalue))) {
      setError(Phone, 'Phone number is invalid', 'phoneerror');
      flag = 1;
    } else {
      setSuccess(Phone, 'phoneerror');
      flag = 0;
    }
  }
  if (flag === 0) {
    if (passwordvalue === '') {
      setError(Password, 'Field is empty', 'passworderror');
      flag = 1;
    } else if (passwordvalue.length < 8) {
      setError(Password, 'Password length must be atleast 8 characters', 'passworderror');
      flag = 1;
    } else if (passwordvalue.length > 15) {
      setError(Password, 'Password length must not exceed 15 characters', 'passworderror');
      flag = 1;
    } else {
      setSuccess(Password, 'passworderror');
      flag = 0;
    }
  }
  if (flag === 0) {
    if (confirmpasswordvalue === '') {
      setError(ConfirmPassword, 'Field is empty', 'conpassworderror');
      flag = 1;
    } else if (passwordvalue !== confirmpasswordvalue) {
      setError(ConfirmPassword, 'Password do not match', 'conpassworderror');
      flag = 1;
    } else {
      setSuccess(ConfirmPassword, 'conpassworderror');
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
  return /^[a-zA-Z\s]*$/.test(str);
}

function emailvalidation(email) {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
}

// eslint-disable-next-line no-unused-vars
function myFunction() {
  const x = document.getElementById('password');
  const y = document.getElementById('conPassword');
  if (x.type === 'password' && y.type === 'password') {
    x.type = 'text';
    y.type = 'text';
  } else {
    x.type = 'password';
    y.type = 'password';
  }
}
