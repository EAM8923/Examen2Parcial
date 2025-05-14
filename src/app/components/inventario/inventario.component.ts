import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  productoActual: any = this.inicializarProducto();
  modoEdicion: boolean = false;
  cargando: boolean = true;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.obtenerProducto().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.mensajeError = 'Error al cargar los productos. Intenta nuevamente.';
        this.cargando = false;
      }
    });
  }

  inicializarProducto(): any {
    return {
      id: null,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: '',
      imagen: 'assets/producto.jpg'  // Imagen por defecto
    };
  }

  editarProducto(producto: Producto): void {
    this.modoEdicion = true;
    // Clonamos el producto para no modificar el original hasta guardar
    this.productoActual = { ...producto };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.productoActual = this.inicializarProducto();
  }

  guardarProducto(): void {
    if (this.modoEdicion) {
      this.actualizarProducto();
    } else {
      this.agregarProducto();
    }
  }

  agregarProducto(): void {
    this.productoService.agregarProducto(this.productoActual).subscribe({
      next: (nuevoProducto) => {
        this.productos.push(nuevoProducto);
        this.mensajeExito = `Producto "${nuevoProducto.nombre}" agregado correctamente`;
        this.productoActual = this.inicializarProducto();
        setTimeout(() => this.mensajeExito = null, 3000);
      },
      error: (error) => {
        console.error('Error al agregar producto:', error);
        this.mensajeError = 'Error al agregar el producto. Intenta nuevamente.';
        setTimeout(() => this.mensajeError = null, 3000);
      }
    });
  }

  actualizarProducto(): void {
    this.productoService.actualizarProducto(this.productoActual).subscribe({
      next: (productoActualizado) => {
        // Actualizamos el producto en la lista
        const index = this.productos.findIndex(p => p.id === productoActualizado.id);
        if (index !== -1) {
          this.productos[index] = productoActualizado;
        }
        this.mensajeExito = `Producto "${productoActualizado.nombre}" actualizado correctamente`;
        this.modoEdicion = false;
        this.productoActual = this.inicializarProducto();
        setTimeout(() => this.mensajeExito = null, 3000);
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
        this.mensajeError = 'Error al actualizar el producto. Intenta nuevamente.';
        setTimeout(() => this.mensajeError = null, 3000);
      }
    });
  }

  confirmarEliminar(producto: Producto): void {
    if (confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"?`)) {
      this.eliminarProducto(producto);
    }
  }

  eliminarProducto(producto: Producto): void {
    this.productoService.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== producto.id);
        this.mensajeExito = `Producto "${producto.nombre}" eliminado correctamente`;
        setTimeout(() => this.mensajeExito = null, 3000);
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        this.mensajeError = 'Error al eliminar el producto. Intenta nuevamente.';
        setTimeout(() => this.mensajeError = null, 3000);
      }
    });
  }

  irAProductos(): void {
    this.router.navigate(['/productos']);
  }

  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }
}