/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
const form = document.getElementById('add_banner');
const Name = document.getElementById('Name');
const Img = document.getElementById('Image');

// eslint-disable-next-line consistent-return
form.addEventListener('submit', (event) => {
  let flag = 0;
  const namevalue = Name.value.trim();
  const image = Img.value;
  if (image === '') {
    setError(Name, 'select a image', 'imageerror');
    flag = 1;
  } else if (!imageval(image)) {
    setError(Name, 'jpg file only', 'imageerror');
    flag = 1;
  } else {
    setSuccess(Name, 'imageerror');
    flag = 0;
  }
  if (flag === 0) {
    if (namevalue === '') {
      setError(Name, 'Field is empty', 'nameerror');
      flag = 1;
    } else {
      setSuccess(Name, 'nameerror');
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

function imageval(params) {
  return /\.jpe?g$/i.test(params);
}
