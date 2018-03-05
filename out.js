//modulos que implementa este modulo
const figlet = require('figlet');
const chalk = require('chalk');


/**
 * Dar color a un string
 * @param msg El string que hay que dar color
 * @param color el color con el que pintar msg
 * @return {string} Devuelve el string msg con el color indicado
 */

const colorize = (msg, color) => {
    if (typeof color !== "undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
};

/**
 * Escribe un mensaje de log
 * @param msg El string a escribir
 * @param color Color del texto
 */
const log = (msg, color) => { //si no me pasan un color, se pone el color por defecto
    console.log(colorize(msg, color));
};
/**
 * Escribe un mensaje de log grande
 * @param msg Texto a escribir
 * @param color Color del texto
 */
const biglog = (msg, color) => {
    log(figlet.textSync(msg, { horizontalLayout: 'full'}), color);
};

/**
 * Escribe el mensaje de error emsg
 *@param emsg Texto del mensaje de error
 */
const errorlog = (emsg) => {
    console.log(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")}`);
};

//otra forma de cambiar los const por exports. es creando la funcion:

exports = module.exports = {
    colorize,
    log,
    biglog,
    errorlog
};