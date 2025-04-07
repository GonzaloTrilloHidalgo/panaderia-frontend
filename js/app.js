// URLs para las operaciones CRUD
const apiUrl = 'http://localhost:3000/api/proveedores';

// Obtener elementos del DOM
const form = document.getElementById('formProveedor');
const nombreInput = document.getElementById('nombre');
const direccionInput = document.getElementById('direccion');
const telefonoInput = document.getElementById('telefono');
const emailInput = document.getElementById('email');
const proveedoresList = document.getElementById('proveedoresList');
const statusMessage = document.getElementById('statusMessage');
const proveedorIdInput = document.getElementById('proveedorId');

// Función para obtener todos los proveedores
async function obtenerProveedores() {
  const response = await fetch(apiUrl);
  const proveedores = await response.json();
  renderizarProveedores(proveedores);
}

// Función para renderizar la lista de proveedores
function renderizarProveedores(proveedores) {
  proveedoresList.innerHTML = '';  // Limpiar la lista antes de renderizarla
  proveedores.forEach(proveedor => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${proveedor.id}</td>
      <td>${proveedor.nombre}</td>
      <td>${proveedor.direccion}</td>
      <td>${proveedor.telefono}</td>
      <td>${proveedor.email}</td>
      <td>
        <button class="editar" onclick="editarProveedor(${proveedor.id})">Editar</button>
        <button class="eliminar" onclick="eliminarProveedor(${proveedor.id})">Eliminar</button>
      </td>
    `;
    proveedoresList.appendChild(tr);
  });
}

// Función para agregar un nuevo proveedor
async function agregarProveedor(proveedorData) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(proveedorData)
  });
  const nuevoProveedor = await response.json();
  return nuevoProveedor;
}

// Función para actualizar un proveedor
async function actualizarProveedor(id, proveedorData) {
  const response = await fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(proveedorData)
  });
  const proveedorActualizado = await response.json();
  return proveedorActualizado;
}

// Función para eliminar un proveedor
async function eliminarProveedor(id) {
  const response = await fetch(`${apiUrl}/${id}`, {
    method: 'DELETE'
  });
  const mensaje = await response.json();
  return mensaje;
}

// Función para manejar el formulario de agregar/actualizar proveedor
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

  const proveedorData = {
    nombre: nombreInput.value,
    direccion: direccionInput.value,
    telefono: telefonoInput.value,
    email: emailInput.value
  };

  const idProveedor = proveedorIdInput.value;

  try {
    let mensaje;
    if (idProveedor) {
      // Si hay un ID, actualizamos el proveedor
      await actualizarProveedor(idProveedor, proveedorData);
      mensaje = 'Proveedor actualizado correctamente';
    } else {
      // Si no hay ID, agregamos un nuevo proveedor
      await agregarProveedor(proveedorData);
      mensaje = 'Proveedor agregado correctamente';
    }

    statusMessage.textContent = mensaje;
    statusMessage.style.color = 'green';

    // Limpiar el formulario
    form.reset();
    proveedorIdInput.value = '';

    // Recargar la lista de proveedores
    obtenerProveedores();
  } catch (error) {
    statusMessage.textContent = 'Error: ' + error.message;
    statusMessage.style.color = 'red';
  }
});

// Función para editar un proveedor
async function editarProveedor(id) {
  const response = await fetch(`${apiUrl}/${id}`);
  const proveedor = await response.json();

  nombreInput.value = proveedor.nombre;
  direccionInput.value = proveedor.direccion;
  telefonoInput.value = proveedor.telefono;
  emailInput.value = proveedor.email;
  proveedorIdInput.value = proveedor.id;
}

// Función para eliminar un proveedor
async function eliminarProveedor(id) {
    try {
      // Hacemos la solicitud DELETE
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
      });
  
      // Verificamos si la respuesta fue exitosa
      const mensaje = await response.json();
      statusMessage.textContent = mensaje.message || 'Proveedor eliminado correctamente';
      statusMessage.style.color = 'green';
  
      // Recargar la lista de proveedores
      obtenerProveedores();
    } catch (error) {
      // En caso de error, mostramos el mensaje correspondiente
      statusMessage.textContent = 'Error: ' + error.message;
      statusMessage.style.color = 'red';
    }
  }
// Cargar la lista de proveedores al inicio
obtenerProveedores();
