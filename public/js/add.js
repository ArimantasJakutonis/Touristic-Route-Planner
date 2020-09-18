

const routeForm = document.getElementById('route-form');
const startAddress = document.getElementById('startAddress');
const destinationAddress = document.getElementById('destinationAddress');
const localStorage = window.localStorage;

// Send POST to API to add route
async function addRoute(e) {
  e.preventDefault();

  if (startAddress.value === '' || destinationAddress.value === '') {
    alert('Please fill in fields');
  }

  const sendBody = {
    startAddress: startAddress.value,
    destinationAddress: destinationAddress.value
  };

  try {
    const res = await fetch('/api/v1/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendBody)
    }).then(response => response.json())
        .then(data => {
          const coordinatesArray = data.data.coordinates;
          const namesArray = data.data.path;
          const coordinates = coordinatesArray.join('');
          const path = namesArray.join('');
          alert(`Your touristic location visiting order:` + `\n` + `${path}`);
            localStorage.setItem('coordinates', coordinates);

          window.location.href = '/route.html';
        });

  } catch (err) {
    console.error(err);
    return;
  }
}

routeForm.addEventListener('submit', addRoute);
