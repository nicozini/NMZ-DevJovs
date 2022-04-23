// NOTAS:
// - Seleccionado es lo que tengo en mi DB que se pasa automaticamente al helper en la vista
// - Opciones es lo que este dentro del html en el helper. Si no paso nada, lo genero desde acá como en
//   el caso de las skills. En la vista quedaría: 
/*
    <ul>
        {{#seleccionarSkills vacante.skills}}
        {{/seleccionarSkills}}
    </ul>
*/
// - MUY IMPORTANTE: En Handlebars utilizamos helpers porque no se puede mostar JavaScript como tal en .handlebars

module.exports = {
    // Helper para seleccionar Skils y generar html
    seleccionarSkills: (seleccionadas = [], opciones) => {
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

        let html = '';
        
        skills.forEach(skill => {
            html += `<li ${seleccionadas.includes(skill) ? 'class="activo" ' : '' }>${skill}</li>`
        });

        return opciones.fn().html = html;
    },

    // Helper para selectar el tipo de contrato
    // $& lo que hace es insertar un string
    tipoContrato: (seleccionado, opciones) => {
        return opciones.fn(this).replace(
            new RegExp(`value="${seleccionado}"`), '$& selected="selected"'
        )
    },

    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores);

        let html = '';

        if (categoria.length) {
            errores[categoria].forEach(error => {
                html += `<div class="${categoria} alerta">
                    ${error}
                </div>`
            })
        }

        return alertas.fn().html = html;
    }
}