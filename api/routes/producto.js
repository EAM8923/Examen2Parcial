const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// GET - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// POST - Agregar un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, stock, categoria, imagen]
    );
    
    const nuevoProducto = {
      id: result.insertId,
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      imagen
    };
    
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

// PUT - Actualizar un producto existente
router.put('/:id', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;
    const id = req.params.id;
    
    const [result] = await pool.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, imagen = ? WHERE id = ?',
      [nombre, descripcion, precio, stock, categoria, imagen, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const productoActualizado = {
      id: parseInt(id),
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      imagen
    };
    
    res.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// DELETE - Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

// PATCH - Actualizar stock de un producto después de una compra
router.patch('/:id/stock', async (req, res) => {
  try {
    const { cantidad } = req.body;
    const id = req.params.id;
    
    // Obtener el stock actual
    const [rows] = await pool.query('SELECT stock FROM productos WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const stockActual = rows[0].stock;
    const nuevoStock = stockActual - cantidad;
    
    if (nuevoStock < 0) {
      return res.status(400).json({ error: 'No hay suficiente stock disponible' });
    }
    
    // Actualizar el stock
    await pool.query('UPDATE productos SET stock = ? WHERE id = ?', [nuevoStock, id]);
    
    res.json({ id, nuevoStock });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
});
module.exports = router;