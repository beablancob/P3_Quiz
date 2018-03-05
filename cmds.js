
const model = require('./model');
const {colorize, log, biglog, errorlog} = require("./out");



/**
 * Muestra la ayuda
 * @param rl Objeto readline usado para implementar el CLI
 */
exports.helpCmd = rl => {
    log("Commandos:"); //la maquina responde
    log("  h|help - Muestra esta ayuda."); //si no pongo log("hjdhl",'color'), pone el color por defecto
    log("  list - Listar los quizzes existentes.");
    log("  show <id> - Muestra la pregunta y la respuesta del quiz indicadp");
    log("  add - Añadir un nuevo quiz interactivamente.");
    log("  delete <id> - Borrar el quiz indicado.");
    log("  edit <id> - Editar el quiz indicado. ");
    log("  test <id> - Probar el quiz indicado.");
    log("  p|play - Jugar a preguntar aleatoriamente todos los quizzes. ");
    log("  credits - Créditos.");
    log("  q|quit - Salir del programa.");
    rl.prompt();
};
/**
 * Añade el nuevo quiz al modelo
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamadad a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.addCmd = rl => {

    rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize('Introduzca la respuesta: ', 'red'), answer =>{

            model.add(question, answer); //aqui añado al modelo el string question y el string respuesta
            log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`)
            rl.prompt(); //hasta que no he contestado a la pregunta y la respuesta no puedo llamar al prompt
        });
    });


};

/**
 * Lista todos los quizzes existentes hasta el momento
 */
exports.listCmd = rl => {

    model.getAll().forEach((quiz, id) => {
       log(`[${colorize(id, 'magenta')}]: ${quiz.question} `);

    });

    rl.prompt();
};

/**
 * Muestra el quiz indicado en el parametro: la pregunta y la respuesta
 *   @param id Clave del quiz a probar
 */
exports.showCmd = (rl, id) => {

    if(typeof id === "undefined") {
        errorlog(`Falta el parámetro id. `);
    } else {
        try {
            const quiz = model.getByIndex(id);
            log(`[${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 *Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar
 * @param id Clave del quiz a probar
 */
exports.testCmd = (rl, id) => {
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id. `);
        rl.prompt();
    } else {
        try {
           const quiz = model.getByIndex(id);

           rl.question(answer =>{
              if( answer === quiz.answer) {
                  biglog('CORRECTO!', 'green');
                  rl.prompt();

              } else {
                  biglog('INCORRECTO!', 'red');
                  rl.prompt();
              }

            });

        }catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }

};

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio
 * Ganando solo cuando se contestan todos correctamente
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.playCmd = rl => {
    log("Jugar.", 'red');
    rl.prompt();
};

/**
 * Borra un quiz del modelo
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a eliminar.
 */
exports.deleteCmd = (rl, id) => {

    if(typeof id === "undefined") {
        errorlog(`Falta el parámetro id. `);
    } else {
        try {
           model.deleteByIndex(id);
        } catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};
/**
 * Edita un quiz del modelo. En vez de tener que escribir entera la entrada nueva,
 * te deja editar lo que ya está escrito mostrándolo por pantalla en la parte donde
 * escribimos nosotros
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamadad a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a editar
 */
exports.editCmd = (rl, id) =>{
    if(typeof id === "undefined") {
        errorlog(`Falta el parámetro id. `);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);

            rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);

                rl.question(colorize('Introduzca la respuesta: ', 'red'), answer => {

                    model.update(id, question, answer); //aqui añado al modelo el string question y el string respuesta
                    log(`Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`)
                    rl.prompt();
                });
            });
        } catch(error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/**
 * Muestra los nombres del autor de la práctica.
 * @param rl Objeto readline usado para implementar el CLI.
 *
 */
exports.creditsCmd = rl => {
    log("Autor de la practica:");
    log("Beatriz Blanco Béjar");
    rl.prompt();
};
/**
 * Terminar el programa
 * @param rl Objeto readline usado para implementar el CLI
 */

exports.quitCmd = rl => {
    rl.close();
};