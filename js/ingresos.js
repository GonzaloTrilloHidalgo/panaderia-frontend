const apiUrlIngresos = 'http://localhost:3000/api/ingresos';

// Obtener elementos del DOM para el formulario de ingresos
const formIngresos = document.getElementById('formIngresos');
const descripcionIngresoInput = document.getElementById('descripcionIngreso');
const montoIngresoInput = document.getElementById('montoIngreso');
const tipoIngresoInput = document.getElementById('tipoIngreso');
const proveedorIngresoSelect = document.getElementById('proveedorIngreso');
const ingresoIdInput = document.getElementById('ingresoId');

// Función para obtener todos los ingresos
async function obtenerIngresos() {
    const response = await fetch(apiUrlIngresos);
    const ingresos = await response.json();
    renderizarIngresos(ingresos);
}

// Función para calcular el total de ingresos
function calcularTotalIngresos(ingresos) {
    return ingresos.reduce((total, ingreso) => {
        // Asegurarnos de que el monto es un número
        const monto = parseFloat(ingreso.monto);
        return total + (isNaN(monto) ? 0 : monto); // Si el monto no es un número, se considera como 0
    }, 0);
}


// Función para renderizar la lista de ingresos
function renderizarIngresos(ingresos) {
    const ingresosList = document.getElementById('ingresosList');
    ingresosList.innerHTML = '';  // Limpiar la lista antes de renderizarla

    if (ingresos.length === 0) {
        ingresosList.innerHTML = '<tr><td colspan="7">No hay ingresos para este mes.</td></tr>';
        document.getElementById('totalIngresos').textContent = 'Total Ingresos: 0'; // Si no hay ingresos, mostrar 0
        return;
    }

    ingresos.forEach(ingreso => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${ingreso.id}</td>
        <td>${ingreso.descripcion}</td>
        <td>${ingreso.monto}</td>
        <td>${ingreso.tipo}</td>
        <td>${ingreso.proveedor_nombre || 'N/A'}</td>
        <td>${new Date(ingreso.fecha_registro).toLocaleDateString()}</td>
        <td>
          <button class="editar" onclick="editarIngreso(${ingreso.id})">Editar</button>
          <button class="eliminar" onclick="eliminarIngreso(${ingreso.id})">Eliminar</button>
        </td>
      `;
        ingresosList.appendChild(tr);
    });

    // Calcular el total de ingresos
    const totalIngresos = calcularTotalIngresos(ingresos);
    document.getElementById('totalIngresos').textContent = `Total Ingresos: ${totalIngresos.toFixed(2)} €`; // Mostrar el total con 2 decimales
}



// Función para agregar un nuevo ingreso
async function agregarIngreso(ingresoData) {
    ingresoData.monto = parseFloat(ingresoData.monto);

    if (isNaN(ingresoData.monto)) {
        alert('El monto debe ser un número válido');
        return;
    }

    const response = await fetch(apiUrlIngresos, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingresoData),
    });
    const nuevoIngreso = await response.json();
    return nuevoIngreso;
}

// Función para cargar el ingreso en el formulario cuando se hace clic en editar
async function editarIngreso(id) {
    // Solicitar el ingreso con el ID específico
    const response = await fetch(`${apiUrlIngresos}/${id}`);
    const ingreso = await response.json();

    if (ingreso) {
        // Rellenar el formulario con los valores del ingreso
        descripcionIngresoInput.value = ingreso.descripcion;
        montoIngresoInput.value = ingreso.monto; // Asegurarse de que el monto es un número válido
        tipoIngresoInput.value = ingreso.tipo;
        proveedorIngresoSelect.value = ingreso.proveedor_id || ''; // Si no tiene proveedor, ponemos vacío

        // Establecer el ID del ingreso en el campo oculto para identificarlo
        ingresoIdInput.value = ingreso.id;
    }
}

// Modificar la función para enviar los datos al backend
async function actualizarIngreso(id, ingresoData) {
    // Verificamos si el monto es un número válido
    if (isNaN(ingresoData.monto)) {
        alert('El monto debe ser un número válido');
        return;
    }

    // Realizamos la solicitud PUT al backend
    const response = await fetch(`${apiUrlIngresos}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingresoData),
    });

    // Verificamos si la respuesta es exitosa
    if (response.ok) {
        const ingresoActualizado = await response.json();
        console.log('Ingreso actualizado', ingresoActualizado);

        // Opcional: Mostrar mensaje de éxito
        alert('Ingreso actualizado correctamente');

        // Recargamos la lista de ingresos para reflejar la actualización
        obtenerIngresos();
    } else {
        // Si la respuesta no es exitosa, mostramos un error
        const errorData = await response.json();
        alert('Error al actualizar el ingreso: ' + errorData.error);
    }
}

// Función para manejar el formulario de agregar/actualizar ingreso
formIngresos.addEventListener('submit', async (event) => {
    event.preventDefault();  // Prevenir el comportamiento por defecto del formulario

    const ingresoData = {
        descripcion: descripcionIngresoInput.value,
        monto: parseFloat(montoIngresoInput.value), // Asegurarse de que el monto es un número
        tipo: tipoIngresoInput.value,
        proveedor_id: proveedorIngresoSelect.value || null
    };

    const idIngreso = ingresoIdInput.value;

    try {
        let mensaje;
        if (idIngreso) {
            // Si hay un ID, actualizamos el ingreso
            await actualizarIngreso(idIngreso, ingresoData); // Cambié el nombre de la función a "actualizarIngreso"
            mensaje = 'Ingreso actualizado correctamente';
        } else {
            // Si no hay ID, agregamos un nuevo ingreso
            await agregarIngreso(ingresoData);
            mensaje = 'Ingreso agregado correctamente';
        }

        statusMessage.textContent = mensaje;
        statusMessage.style.color = 'green';

        // Limpiar el formulario
        formIngresos.reset();
        ingresoIdInput.value = '';

        // Recargar la lista de ingresos
        obtenerIngresos();
    } catch (error) {
        statusMessage.textContent = 'Error: ' + error.message;
        statusMessage.style.color = 'red';
    }
});

// Función para cargar proveedores en el select
async function cargarProveedores() {
    const response = await fetch('http://localhost:3000/api/proveedores');
    const proveedores = await response.json();

    proveedores.forEach(proveedor => {
        const option = document.createElement('option');
        option.value = proveedor.id;
        option.textContent = proveedor.nombre;
        proveedorIngresoSelect.appendChild(option);
    });
}

// Función para eliminar un ingreso
async function eliminarIngreso(id) {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este ingreso?');

    if (confirmar) {
        try {
            const response = await fetch(`${apiUrlIngresos}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Ingreso eliminado correctamente');
                obtenerIngresos();  // Recargar la lista de ingresos
            } else {
                const errorData = await response.json();
                alert('Error al eliminar el ingreso: ' + errorData.error);
            }
        } catch (error) {
            alert('Error de red: ' + error.message);
        }
    }
}

// Función para obtener los ingresos filtrados por mes y año
async function obtenerIngresosPorMesAnio(mes, anio) {
    const response = await fetch(`${apiUrlIngresos}?mes=${mes}&anio=${anio}`);
    const ingresos = await response.json();

    renderizarIngresos(ingresos); // Llamar a la función para actualizar la vista
}

// Función para manejar el formulario de filtro mensual
document.getElementById('filtroMensual').addEventListener('submit', (event) => {
    event.preventDefault();  // Prevenir el comportamiento por defecto del formulario

    const mes = document.getElementById('mes').value; // Obtener el valor del mes
    const anio = document.getElementById('anio').value; // Obtener el valor del año

    // Validar si se ingresaron datos válidos
    if (!mes || !anio) {
        alert('Por favor, seleccione un mes y un año.');
        return;
    }

    obtenerIngresosPorMesAnio(mes, anio); // Realizar el filtrado
});


// Función para obtener el mes y año actual
function obtenerMesYAnioActual() {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1; // Los meses en JavaScript son 0-indexados, por lo que sumamos 1
    const anio = hoy.getFullYear();
    return { mes, anio };
}

// Función para obtener los ingresos de este mes y año
async function obtenerIngresosDeEsteMes() {
    const { mes, anio } = obtenerMesYAnioActual();
    const response = await fetch(`${apiUrlIngresos}?mes=${mes}&anio=${anio}`);
    const ingresos = await response.json();
    renderizarIngresos(ingresos);
}

// Función para obtener el mes y año actual
function establecerMesActual() {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1; // Los meses en JavaScript son 0-indexados, por lo que sumamos 1

    // Seleccionar el mes correspondiente
    const mesSelect = document.getElementById('mes');
    mesSelect.value = mes;  // Establecer el valor del select al mes actual
}

// Llamar a la función cuando la página se cargue
document.addEventListener('DOMContentLoaded', establecerMesActual);

// Llamar a esta función al cargar la página para obtener los ingresos del mes actual
obtenerIngresosDeEsteMes();


cargarProveedores();