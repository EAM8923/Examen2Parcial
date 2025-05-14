const express = require('express');
const cors = require('cors');
const { testConnection } = require('./db');
const productosRoutes = require('./routes/producto');

// Crear la app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permitir solicitudes CORS
app.use(express.json()); // Analizar solicitudes JSON

// Rutas
app.use('/api/productos', productosRoutes);

// Ruta de prueba para verificar que la API está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API de Productos funcionando correctamente' });
});

// Iniciar el servidor
async function startServer() {
  // Probar la conexión a la base de datos antes de iniciar el servidor
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
    });
  } else {
    console.error('No se pudo iniciar el servidor debido a problemas de conexión con la base de datos');
  }
}

// Iniciar el servidor
startServer();

process.on('SIGINT', () => {
  console.log('Cerrando servidor API...');
  process.exit(0);
});