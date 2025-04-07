// URLs para las operaciones CRUD
const apiUrl = 'http://localhost:3000/api/gastos';

// Obtener elementos del DOM
const form = document.getElementById('formGastos');
const descripcionInput = document.getElementById('descripcion');
const montoInput = document.getElementById('monto');
const tipoInput = document.getElementById('tipo');
const gastosList = document.getElementById('gastosList');
const statusMessage = document.getElementById('statusMessage');
const gastoIdInput = document.getElementById('gastoId');

// Función para obtener todos los gastos
async function obtenerGastos() {
  const response = await fetch(apiUrl);
  const gastos = await response.json();
  renderizarGastos(gastos);
}

// Función para renderizar la lista de gastos
function renderizarGastos(gastos) {
  gastosList.innerHTML = '';  // Limpiar la lista antes de renderizarla
  gastos.forEach(gasto => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${gasto.id}</td>
      <td>${gasto.descripcion}</td>
      <td>${gasto.monto}</td>
      <td>${gasto.tipo}</td>
      <td>${gasto.proveedor_nombre || 'N/A'}</td>
      <td>${new Date(gasto.fecha).toLocaleDateString()}</td>
      <td>
        <button class="editar" onclick="editarGasto(${gasto.id})">Editar</button>
        <button class="eliminar" onclick="eliminarGasto(${gasto.id})">Eliminar</button>
      </td>
    `;
    gastosList.appendChild(tr);
  });
}

// Función para agregar un nuevo gasto
async function agregarGasto(gastoData) {
    // Convertir el monto a un número decimal antes de enviarlo
    gastoData.monto = parseFloat(gastoData.monto);
  
    // Verificar si el monto es un número válido
    if (isNaN(gastoData.monto)) {
      alert('El monto debe ser un número válido');
      return;
    }
  
    const response = await fetch('http://localhost:3000/api/gastos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gastoData)
    });
  
    const nuevoGasto = await response.json();
    return nuevoGasto;
  }

// Función para actualizar un gasto
async function actualizarGasto(id, gastoData) {
  const response = await fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gastoData)
  });
  const gastoActualizado = await response.json();
  return gastoActualizado;
}

// Función para eliminar un gasto
async function eliminarGasto(id) {
  const response = await fetch(`${apiUrl}/${id}`, {
    method: 'DELETE'
  });
  const mensaje = await response.json();
  return mensaje;
}

// Función para manejar el formulario de agregar/actualizar gasto
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

  const gastoData = {
    descripcion: descripcionInput.value,
    monto: parseFloat(montoInput.value),
    tipo: tipoInput.value,
    proveedor_id: document.getElementById('proveedor').value || null
  };

  const idGasto = gastoIdInput.value;

  try {
    let mensaje;
    if (idGasto) {
      // Si hay un ID, actualizamos el gasto
      await actualizarGasto(idGasto, gastoData);
      mensaje = 'Gasto actualizado correctamente';
    } else {
      // Si no hay ID, agregamos un nuevo gasto
      await agregarGasto(gastoData);
      mensaje = 'Gasto agregado correctamente';
    }

    statusMessage.textContent = mensaje;
    statusMessage.style.color = 'green';

    // Limpiar el formulario
    form.reset();
    gastoIdInput.value = '';

    // Recargar la lista de gastos
    obtenerGastos();
  } catch (error) {
    statusMessage.textContent = 'Error: ' + error.message;
    statusMessage.style.color = 'red';
  }
});

// Función para editar un gasto
async function editarGasto(id) {
  const response = await fetch(`${apiUrl}/${id}`);
  const gasto = await response.json();
  

  descripcionInput.value = gasto.descripcion;
  montoInput.value = gasto.monto;
  tipoInput.value = gasto.tipo;
  gastoIdInput.value = gasto.id;
  document.getElementById('proveedor').value = gasto.proveedor_id || '';
}

// Función para eliminar un gasto
async function eliminarGasto(id) {
  try {
    // Hacemos la solicitud DELETE
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE'
    });

    // Verificamos si la respuesta fue exitosa
    const mensaje = await response.json();
    statusMessage.textContent = mensaje.message || 'Gasto eliminado correctamente';
    statusMessage.style.color = 'green';

    // Recargar la lista de gastos
    obtenerGastos();
  } catch (error) {
    // En caso de error, mostramos el mensaje correspondiente
    statusMessage.textContent = 'Error: ' + error.message;
    statusMessage.style.color = 'red';
  }
}

async function cargarProveedores() {
    const response = await fetch('http://localhost:3000/api/proveedores');
    const proveedores = await response.json();
  
    const proveedorSelect = document.getElementById('proveedor');
    proveedores.forEach(prov => {
      const option = document.createElement('option');
      option.value = prov.id;
      option.textContent = prov.nombre;
      proveedorSelect.appendChild(option);
    });
  }

// Cargar la lista de gastos al inicio
obtenerGastos();

cargarProveedores();
