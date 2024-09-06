var tPresupuesto = parseInt(localStorage.getItem("presupuesto")) || 0;
var gastos = JSON.parse(localStorage.getItem("gastos")) || [];
var divPresupuesto = document.querySelector('#divPresupuesto');
var presupuesto = document.querySelector('#presupuesto');
var btnPresupuesto = document.querySelector('#btnPresupuesto');
var divGastos = document.querySelector('#divGastos');
var progress = document.querySelector("#progress");
var totalPresupuesto = document.querySelector("#totalPresupuesto");
var totalDisponible = document.querySelector("#totalDisponible");
var totalGastado = document.querySelector("#totalGastado");
var tGastos = 0;
var disponible = 0;

const inicio = () => {
    tPresupuesto = parseInt(localStorage.getItem("presupuesto")) || 0;
    if (tPresupuesto > 0) {
        divPresupuesto.classList.remove("d-block");
        divGastos.classList.remove("d-none");
        divPresupuesto.classList.add("d-none");
        divGastos.classList.add("d-block");
        totalPresupuesto.innerHTML = `$ ${tPresupuesto.toFixed(2)}`;
        mostrarGastos();
    } else {
        divPresupuesto.classList.remove("d-none");
        divGastos.classList.remove("d-block");
        divPresupuesto.classList.add("d-block");
        divGastos.classList.add("d-none");
        presupuesto.value = 0;
    }
}

btnPresupuesto.onclick = () => {
    tPresupuesto = parseInt(presupuesto.value);
    if (tPresupuesto <= 0) {
        Swal.fire({ icon: "error", title: "ERROR", text: "El presupuesto debe ser mayor a 0" });
        return;
    }
    localStorage.setItem('presupuesto', tPresupuesto);
    divPresupuesto.classList.remove("d-block");
    divGastos.classList.remove("d-none");
    divPresupuesto.classList.add("d-none");
    divGastos.classList.add("d-block");
    mostrarGastos();
}

const guardarGasto = () => {
    gastos = JSON.parse(localStorage.getItem("gastos")) || [];
    let descripcion = document.getElementById("descripcion").value;
    let costo = parseFloat(document.getElementById("costo").value);
    let categoria = document.getElementById("categoria").value;

    if (descripcion.trim() === "" || isNaN(costo) || costo <= 0) {
        Swal.fire({ icon: "error", title: "ERROR", text: "Datos incorrectos" });
        return;
    }
    if (costo > disponible) {
        Swal.fire({ icon: "error", title: "ERROR", text: "No tienes suficientes fondos" });
        return;
    }

    const gasto = { descripcion, costo, categoria };
    gastos.push(gasto);
    localStorage.setItem("gastos", JSON.stringify(gastos));
    bootstrap.Modal.getInstance(document.getElementById("nuevoGasto")).hide();
    mostrarGastos();
}

const mostrarGastos = (categoria = "todos") => {
    gastos = JSON.parse(localStorage.getItem("gastos")) || [];
    let gastosHTML = '';
    tGastos = 0;

    if (gastos.length === 0) {
        document.getElementById('listaGastos').innerHTML = `<b>No hay gastos</b>`;
    }

    gastos.forEach((gasto, index) => {
        if (categoria === gasto.categoria || categoria === "todos") {
            gastosHTML += `
            <div class="card text-center w-100 m-auto mt-3 p-2">
                <div class="row">
                    <div class="col"><img src="img/${gasto.categoria}.jpg" class="imgCategoria shadow"></div>
                    <div class="col text-start">
                        <p><b>Descripción</b><small>${gasto.descripcion}</small></p>
                        <p><b>Costo</b><small>$ ${parseFloat(gasto.costo).toFixed(2)}</small></p>
                    </div>
                    <div class="col">
                        <button class="btn btn-warning" onclick="cargarGasto(${index})" data-bs-toggle="modal" data-bs-target="#editarGasto"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-danger" onclick="deleteGasto(${index})"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>`;
            tGastos += parseFloat(gasto.costo);
        }
    });

    document.getElementById('listaGastos').innerHTML = gastosHTML;
    pintarDatos();
}

const pintarDatos = () => {
    disponible = tPresupuesto - tGastos;
    let porcentaje = 100 - ((tGastos / tPresupuesto) * 100);

    progress.innerHTML = `<circle-progress value="${porcentaje}" min="0" max="100" text-format="percent"></circle-progress>`;
    totalGastado.innerHTML = `$ ${tGastos.toFixed(2)}`;
    totalPresupuesto.innerHTML = `$ ${tPresupuesto.toFixed(2)}`;
    totalDisponible.innerHTML = `$ ${disponible.toFixed(2)}`;
}

const reset = () => {
    localStorage.clear();
    inicio();
}

const actualizarGasto = () => {
    gastos = JSON.parse(localStorage.getItem("gastos")) || [];

    let descripcion = document.getElementById("edescripcion").value;
    let costo = parseFloat(document.getElementById("ecosto").value);
    let categoria = document.getElementById("ecategoria").value;
    let index = parseInt(document.getElementById("eindex").value);

    if (descripcion.trim() === "" || isNaN(costo) || costo <= 0) {
        Swal.fire({ icon: "error", title: "ERROR", text: "Datos incorrectos" });
        return;
    }

    let costoAnterior = parseFloat(gastos[index].costo);
    if (costo > (costoAnterior + disponible)) {
        Swal.fire({ icon: "error", title: "ERROR", text: "No tienes suficientes fondos" });
        return;
    }

    gastos[index].descripcion = descripcion;
    gastos[index].costo = costo;
    gastos[index].categoria = categoria;
    localStorage.setItem("gastos", JSON.stringify(gastos));
    bootstrap.Modal.getInstance(document.getElementById("editarGasto")).hide();
    mostrarGastos();
}

const cargarGasto = (index) => {
    var gasto = gastos[index];
    document.getElementById("edescripcion").value = gasto.descripcion;
    document.getElementById("ecosto").value = gasto.costo;
    document.getElementById("ecategoria").value = gasto.categoria;
    document.getElementById("eindex").value = index;
}

const deleteGasto = (index) => {
    Swal.fire({
        title: "¿Estás seguro de eliminar?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Sí",
        denyButtonText: "No"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire("¡Eliminado!", "", "success");
            gastos.splice(index, 1);
            localStorage.setItem("gastos", JSON.stringify(gastos));
            mostrarGastos();
        }
    });
}
document.getElementById('filtrarCategoria').addEventListener('change', (event) => {
    const categoriaSeleccionada = event.target.value;
    mostrarGastos(categoriaSeleccionada);
});