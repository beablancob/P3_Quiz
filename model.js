

const fs = require("fs");

//Nombre del fichero donde se guardan las preguntas
//Es un fichero de texto con el JSON de quizzes
const DB_FILENAME = "quizzes.json";


/**
 * Modelo de datos.
 *
 * En esta variable se mantienen todos los quizzes existentes.
 * Es un array de objetos, donde cada objeto tiene los atributos question
 * y answer para guardar el texto de la pregunta y el de la respuesta
 *
 * Al arrancar la aplicación, esta variable contiene estas cuatro preguntas
 * pero al final del módulo se llama a load() para cargar las preguntas
 * guardadas en el fichero DB_FILENAME.
 */
let quizzes = [
    {
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        question: "Capital de Francia",
        answer: "Paris"
    },
    {
        question: "Capital de España",
        answer: "Madrid"
    },
    {
        question: "Capital de Portugal",
        answer: "Lisboa"
    },
];

/**
 * Este método carga el conenio del fichero DB_FILENAME en la variable
 * quizzes. El contenido de ese fichero está en formato JSON.
 * La primera vez que se ejecute este método, el fichero DB_FILENAME no
 * existe, y se producirá el errro ENDENT. En este caso se salva el
 * contenido inicial almacenado en quizzes.
 * Si se produce otro tipo de error, se lanza una excepción que abortará la
 * ejecución del programa
 *
 * Se lanza al final del módulo para que siempre que se ejecute el programa
 * se guarden los cambios
 */
const load = () =>{

    fs.readFile(DB_FILENAME, (err, data) =>{
        if(err){
            //la primera vez no existe el fichero
            if(err.code === "ENOENT"){
                save(); //valores iniciales
                return;
            }
            throw  err;
        }
        let json = JSON.parse(data);

        if(json){
            quizzes = json;
        }
    });
};

/**
 * Guarda las preguntas en el fichero.
 *
 * Guarda en formato JSON el valor de quizzes en el fichero DB_FILENAME
 * Si se produce algún tipo de error, se lanza una excepción que abortará
 * la ejecución del programa.
 *
 * Se guarda en todos los metodos de este módulo que se utilice el array, se h
 * haga algún cambio.
 *
 */
const save = () => {
    fs.writeFile(DB_FILENAME, JSON.stringify(quizzes),
        err =>{
            if(err) throw err;
        });
};

/**
 * Devuelve el número total de preguntas existentes.
 *
 * @returns {number} número total
 */


/**
 * Devuelve el numero total de preguntas existentes
 * @returns {number} número total de preguntas existentes.
 */
exports.count = () => quizzes.length;
//cambio const por exports. por ponerlo en un modulo aparte
/**
 * Añade un nuevo quiz.
 *@param question String con la pregunta.
 * @param answer String con la respuesta.
 */
exports.add = (question, answer) => {
    quizzes.push({
        question: (question || "").trim(), //el trim quita espacios por delante y por detras
        answer: (answer || "").trim()
    });
    save();
};

/**
 * Actualiza el quiz situado en la posicion index
 * @param id       Clave que identifica el quiz a actualizar.
 * @param question String con la pregunta.
 * @param answer   String con la respuesta.
 */
exports.update = (id, question, answer) => { //(posicion del array, nuevo texto de la pregunta, nuevo texto de la respuesta)
    const quiz = quizzes[id];//si el no valor existe lanzo un error diciendo q el parametro no es valido
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro id no es válido)`);
    }
    quizzes.splice(id, 1, { //En la posicion id,¿Cuantos elementos voy a quitar? en este caso 1
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

/**
 * Devuelve todos los quizzes existentes.
 *
 * Devuelve un clon del valor guardado en la variable quizzes, es decir, devuelve un
 * objeto nuevo con todas las preguntas existentes.
 * Para clonar quizzes se usa stringify + parse.
 *
 * @returns {any}
 */
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

/**
 * Devuelve un clon del quiz almacenado en la posición dada.
 *
 * Para clonar el quiz usa stringify + parse
 *
 * @param    id                Clave que identifica el quiz a devolver
 * @returns {question, answer} Devuelve el objeto quiz de la posicion dada
 */
exports.getByIndex = id => {
    const quiz = quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro id no es válido`);
    }
    return JSON.parse(JSON.stringify(quiz));
};

/**
 * Elimina el quiz situado en la posición dada.
 *
 * @param id Clave que identifica el quiz a borrar
 */
exports.deleteByIndex = id => {
    const quiz = quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro id no es válido`);
    }
    quizzes.splice(id, 1); //En esta posicion id quita 1 elemento
    save();
};


//Carga los quizzes almacenados en el fichero.
load();