
const Sequelize = require('sequelize');
const {models} = require('./model');
const {colorize, log, biglog, errorlog} = require("./out");



/**
 * Muestra la ayuda
 * @param rl Objeto readline usado para implementar el CLI
 */
exports.helpCmd = (rl) => {
    log("Comandos:"); //la maquina responde
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
 * Esta función devuelve una promesa que:
 *   -Valida que se ha introducido un valor para el parámetro.
 *   -Convierte el parámetro en un número entero.
 * Si todx va bien, la promesa se satisface y devuelve el valor del id
 * @param id Parámetro con el índice a validar.
 */
const validateId = id => {

    return new Sequelize.Promise((resolve, reject) => {
        if(typeof id === "undefined"){
            reject(new Error(`Falta el parámetro <id>.`));
        } else {
            id = parseInt(id); //Coger la parte entera y descartar lo demás
            if(Number.isNaN(id)) {
                reject(new Error(`El valor del parámetro <id> no es un número`));
            } else {
                resolve(id);
            }
        }
    });
};
/**
 * Esta función convierte la llamada rl.question, que está basada en callbacks,
 * basada en promesas.
 *
 * Esta función devuelve una promesa que cuando se cumple, proporciona el texto
 * introducido. Entonces la llamada a then que hay que hacer devolverá una promesa
 * que será:
 *
 * También colorea en rojo el texto de la pregunta, elimina espacios al principio y
 * al final
 *
 * @param rl   Objeto readline usado para implementar el CLI
 * @param text Pregunta que hay que hacerle al usuario
 */
const makeQuestion = (rl, text) => {

    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
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
    makeQuestion(rl, ' Introduzca una pregunta: ')
    .then(q => { // q es como un parametro de un metodo (string q)
        return makeQuestion(rl, ' Introduzca la respuesta: ')
            .then(a => {
                return {question: q, answer: a};
            });
    })
        //Aqui paso el objeto pregunta respuesta que han metido en la base de datos
    //Es decir, el objeto quiz
        .then(quiz => {
            return models.quiz.create(quiz);
        })

    .then(quiz => {
        log(`${colorize('Se ha añadido', 'red')}: ${quiz.question} ${colorize('=>', 'red')} ${quiz.answer}`)
    })
    //por si hay un modelo de validación: preguntas o respuestas vacías...
    .catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo:');
        //Array con todos los errores que pueden producirse, se recorre entero con el
        //for each
        error.errors.forEach(({message}) => errorlog(message));
    })
    //cualquier otro tipo de error: que no sea único el texto por ejemplo
    .catch(error => {
        errorlog(error.message);
    })
    .then(() =>{
        rl.prompt();
    });
};

/**
 * Lista todos los quizzes existentes hasta el momento
 */
exports.listCmd = rl => {
    models.quiz.findAll() //devuelve un array con todos los quizzes
    .then(quizzes => {
        quizzes.forEach(quiz => {
            log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
        });
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        //El prompt no lo saco hasta que no haya terminado las siguientes promesas
        rl.prompt();
    })
};



/**
 * Dado un id tengo que comprobar si es un numero, un comando indefinido... me creo una funcion que devuelva la promesa
 * Muestra el quiz indicado en el parametro: la pregunta y la respuesta
 *   @param id Clave del quiz a probar
 */
exports.showCmd = (rl, id) => {

    validateId(id) //devuelve una promesa, si hay error se va al catch de abajo, sino sigo
    .then(id => models.quiz.findById(id)) //busco el quiz en los modelos con su id
    .then(quiz => { //paso por parámetro el quiz
        if(!quiz) { //si no ha pasado ninguno porque no hay quiz con ese id, error
            throw new Error(`No existe un quiz asociado al id=${id}.`)
        }
        log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(error => {
        errorlog(error.message);
    })
    //haya pasado lo que haya pasado, una vez q han terminado todas las promesas, tengo un .then para volver a adaptar el prompt
    .then(() => {
        rl.prompt();
    });
};

/**
 * Tenemos que validar si el id es correcto, acceder a la base de datos (editar) y preguntar por
 * la pregunta asociada al quiz que hemos solicitado
 *Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar
 * @param id Clave del quiz a probar
 */
exports.testCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            makeQuestion(rl, '¿' + quiz.question + '? ')
                .then(a => {
                    if (a.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                       console.log(' Su respuesta es correcta.');
                         biglog('Correcta!', 'green');
                         log('Eres un genio!', 'green');

                    } else {
                       console.log(' Su respuesta es incorrecta.');
                        biglog('Incorrecta', 'red');
                        log('Otra vez será...', 'red');
                    }
                })
        })
                .catch(error => {
                    errorlog(error.message);
                })
                //haya pasado lo que haya pasado, una vez q han terminado todas las promesas, tengo un .then
                // para volver a adaptar el prompt
                .then(() => {
                    rl.prompt();

                });


};


/**
 * Podemos cargar inicialmente todas las preguntas en un array. Segun las vamos
 * preguntamos de forma aleatoria las vamos eliminando del array.
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio
 * Ganando solo cuando se contestan todos correctamente
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.playCmd = rl => {

    let score = 0;
    let toBeResolved;

    //Si el array esta vacio, mensaje que no hay nada que preguntar
    //Los resultados
    models.quiz.findAll()
        .then(quizzes => {
            toBeResolved = quizzes;
            const jugar = () => {
                if (toBeResolved.length === 0) {
                    log('Eres el mejor! Has ganado la partida, acertando ' + score + ' preguntas.');
                    score = 0;
                    biglog('WIN', 'green');
                    log('FIN!');
                  return;
                } else {
                    let id = Math.floor(Math.random() * (toBeResolved.length));
                    log(`${toBeResolved.length}`);

                    let quizzz = toBeResolved[id];


                    return makeQuestion(rl,`${quizzz.question} `)
                        .then(answer =>{
                        log(' Su respuesta es: ');
                        var ans = answer.toLowerCase().trim();

                        if (ans === quizzz.answer.toLowerCase().trim()) {
                            score++;

                            log('Correcto. Eres un genio! Llevas ' + score + ' respuestas correctas.');
                            toBeResolved.splice(id, 1);


                            jugar();
                        } else {
                            log('Incorrecto.');
                            log('Fin del examen. Otra vez será... Has contestado ' + score + ' preguntas correctamente.', 'red');
                            biglog(score, 'magenta');
                            score = 0;
                            return;

                        }
                    });
                }

            }
            jugar();
        })
        .catch(error=> {
            console.log(error);
            rl.prompt();
        })

        .then(() => {
            rl.prompt();
        });

};

/**
 * Borra un quiz del modelo
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a eliminar.
 */
exports.deleteCmd = (rl, id) => {
    validateId(id)
     .then(id => {
         models.quiz.findById(id) //Encuentro el id pasado por parametro
        var a;
        let i;
     })
     .then(quizzzes => {
        if (id < models.quiz.length) { //si el id es menor que el numero de quizes

                var toBeResolved = quizzzes; //creo un array paralelo con los mismos quizes
                models.quiz.destroy({where: {id}}) //destruyo el id con ese quiz

                for(i=id+1; i<quizzzes.length -1; i++){
                for(j = id ; j<quizzzes.length; j++ ){
                toBeResolved.j=quizzzes.i;
                quizzzes.j = toBeResolved.i;
            }
            }
              //  models.quiz.destroy({where: {id}}) //Destruido el quiz con el id pasado por parametro

        }else {

            models.quiz.destroy({where: {id}})
        }

     })
    //accedo a la base de datos models, a la tabla quiz y elimino el elemento que corresponda con el id
     .catch(error => {
        errorlog(error.message);
    })
     .then(() => {
      rl.prompt();
    });
     };

    /**validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });

};
*/
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

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
            return makeQuestion(rl,  ' Introduzca la pregunta: ')
                .then(q => {
                    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
                    return makeQuestion(rl, 'Introduzca la respuesta: ')
                        .then(a => {
                        quiz.question = q;
                        quiz.answer = a;
                        return quiz;
                    });
                });
        })
        .then(quiz => {
            return quiz.save();
        })
        .then(quiz => {
            log(`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erróneo: ');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

/**
 * Muestra los nombres del autor de la práctica.
 * @param rl Objeto readline usado para implementar el CLI.
 *
 */
exports.creditsCmd = rl => {
    log("Autor de la práctica:");
    log("Beatriz Blanco Béjar");
    rl.prompt();
};
/**
 * Terminar el programa
 * @param rl Objeto readline usado para implementar el CLI
 */

exports.quitCmd = rl => {
    rl.close();
    rl.prompt();
};
