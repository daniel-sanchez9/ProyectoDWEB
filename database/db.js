//2 - Invocamos a MySQL y realizamos la conexion
const mysql = require('mysql');
const connection = mysql.createConnection({
    //Con variables de entorno
    host     : '127.0.0.1',
    user     : 'daniel',
    password : 'asd123',
    database : 'login_node_curso'
});

connection.connect((error)=>{
    if (error) {
      console.error('El error de conexión es: ' + error);
      return;
    }
    console.log('¡Conectado a la Base de Datos!');
  });

  module.exports = connection;
