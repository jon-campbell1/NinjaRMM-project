const DOMAIN = 'http://localhost:3000';
const headers = {
  'Content-Type': 'application/json'
};

export default {
    getDevices: () => fetch(`${DOMAIN}/devices`).then(res => res.json()),

    createDevice: data => fetch(`${DOMAIN}/devices`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers
      })
      .then(res => res.json()),

    updateDevice: data => fetch(`${DOMAIN}/devices/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers
    })
    .then(res => res.json()),

    deleteDevice: data => fetch(`${DOMAIN}/devices/${data.id}`, {
      method: 'DELETE',
      headers
    })
    .then(res => res.json())
}