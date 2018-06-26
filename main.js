//modulos que requiere este main.js
const readline = require('readline');
const model = require('./model');

 //otra forma es que coja los metodos uno a uno del modulo
const {colorize, log, biglog, errorlog} = require("./out");
const cmds = require ("./cmds");

//Mensaje inicial
biglog('CORE Quiz', 'green');


const rl = readline.createInterface({
  input: process.stdin, //proceso estandar de entrada
  output: process.stdout, //poceso estandar de salida
  prompt: colorize('quiz > ', "blue") ,//esto es para que el usuario sepa que está a la espera de un comando suyo
     completer: (line) => {
    const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
    const hits = completions.filter((c) => c.startsWith(line));
    // show all completions if none found
    return [hits.length ? hits : completions, line]; //me devuelve un array con los posibles comandos que
         //pueden darse con lo que he escrito por el teclado
         //si no he tecleado nada y doy al tabulador 2 veces, me sale la lista de
         //palabras que puedo escribir
}

});

rl.prompt();

rl
    .on('line', (line) => { //esta esperando una linea de teclado del usuario

    //para pasar por parametro en el switch la primera palabra, pasada a minusculas, que el jugador escriba
    let args = line.split(" ");
    let cmd = args[0].toLowerCase().trim();


  switch (cmd) { //el prompt se tiene que poner detras de las funciones que tengo porque algunas son asincronas
      case '':
  	  rl.prompt(rl); //si el usuario no escribe nada se termina. el resto de llamadas tendra la llamada al prompt internamente
  	break;

    case 'h': //cuando el usuario manda un h
      case 'help':
        cmds.helpCmd(rl);

        break;

      case 'quit':
      case 'q':
          cmds.quitCmd(rl);
        break;

      case 'add':
          cmds.addCmd(rl);
        break;

      case 'list':
          cmds.listCmd(rl);
        break;

      case 'show':
          cmds.showCmd(rl, args[1]);
        break;

      case 'test':
          cmds.testCmd(rl, args[1]);
        break;

      case'play':
      case'p':
          cmds.playCmd(rl);
        break;

      case 'delete':
        cmds.deleteCmd(rl, args[1]);
        break;

      case 'edit':
          cmds.editCmd(rl, args[1]);
        break;

      case'credits':
        cmds.creditsCmd(rl);
        break;

      default:
        console.log(`Comando desconocido: '${colorize(cmd, 'red')}'`);
        console.log(`Use ${colorize('help', 'green')}  para ver todos los comandos disponibles.`);
        rl.prompt();
        break;
  }

})
 .on('close', () => {
  console.log('Adios!');
  process.exit(0);
});

