const mysql = require('mysql2/promise');

// Configuración basica de la conexión a la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         
  password: '',         
  database: 'papos_valencia'
});

// Funcion para probar la conexion a la base de datos
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexion a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};