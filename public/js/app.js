import axios from 'axios';
import Swal from 'sweetalert2';


// Genero funcionalidad de selectar las skills y que se guarden
document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');
    let alertas = document.querySelector('.alertas');
    

    // Limpiar las alertas
    if (alertas) {
        limpiarAlertas();
    }

    // Valido que exista en el template (no hay skills en todos los templates)
    if (skills) {
        skills.addEventListener('click', agregarSkills);

        // Una vez que estamos en editar una vacante, llamar esta funcion para insertar en el input hidden
        // las skills seleccionadas
        skillsSeleccionados();
    }

    // Selecciones para eliminar una vacante
    const vacantesListado = document.querySelector('.panel-administracion');

    if(vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado);
    }
});


// Sets
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
// Creo los sets de forma global (para que no se creen cada vez que doy click en el evento)
// Sets tiene muchos metodos. Agrego con add, elimino con delete, etc. Ver la documentación
const skills = new Set();


const agregarSkills = e => {
    if (e.target.tagName === 'LI') {
        if(e.target.classList.contains('activo')) {
            // Eliminarlo del set y eliminar la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            // Agregarlo al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    // Inyecto la selección en el HTML. Se agrega al input hidden por el #skills
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}

const skillsSeleccionados = () => {
    // Utilizo Array.from() porque la const seleccionadas en si es un nodelist
    // Con Array.from() transformo el nodelist en un array
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    // Itero el array para extraer el texto. No me interesa el <li>
    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    })

    // Inyecto la selección en el HTML. Se agrega al input hidden por el #skills
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    // const alertas. Sino la variable de abajo alertas sería indefinida
    const interval = setInterval(() => {
        if (alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else if (alertas.children.length == 0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 2000)
}

// Eliminar Vacantes Con Axios y Sweet Alert 2
const accionesListado = e => {
    e.preventDefault();    
    
    if (e.target.dataset.eliminar) {
        // Eliminar por peticion Axios y mostrar por Sweet Alert 2
        console.log('==============INGRESO BIEN AL METODO==============');
        Swal.fire({
            title: '¿Confirmar eliminar Vacante?',
            text: "Una vez eliminada no se podrá recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Inicio la parte de elminar con Axios:
                // - En lugar de tomar el for="/vacantes/elminimar/id", lo construyo con el objeto location
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

                axios.delete(url, {params: {url}})
                    .then(function(respuesta) {
                        if (respuesta.status === 200) {
                            console.log(respuesta); // para debuguear o agregar información
                            Swal.fire(
                                '¡Eliminada!',
                                //'La vacante se eliminó correctamente',
                                respuesta.data,
                                'success'
                            );

                            // Eliminar del DOM, luego en el controller eliminar de la DB
                            // console.log(e.target.parentElement); // caja
                            // console.log(e.target.parentElement.parentElement); // centrar-vertical
                            // console.log(e.target.parentElement.parentElement.parentElement); // vacante
                            e.target.parentElement.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement.parentElement);
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            type: 'error',
                            tittle: 'Hubo un error',
                            text: 'No se pudo eliminar'
                        })
                    })
            }
        })

    } else if(e.target.tagName === 'A') {
        // Redirigir al correspondiente link
        window.location.href = e.target.href;
    }
}