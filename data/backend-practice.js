const xhr = new XMLHttpRequest();

xhr.addEventListener('load', () => {
  console.log(xhr.response);
});

xhr.open('GET', '/api');
xhr.send();
