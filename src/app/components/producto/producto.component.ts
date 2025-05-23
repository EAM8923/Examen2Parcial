import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];
  cargando = true;
  error = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productoService.obtenerProducto().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  agregarAlCarrito(producto: Producto): void {
    if (producto.stock > 0) {
      // Crear una copia del producto para el carrito
      const productoParaCarrito = {
        ...producto,
        cantidad: 1
      };
      
      // Agregar al carrito sin modificar el stock
      this.carritoService.agregarProducto(productoParaCarrito);
      this.mostrarMensajeExito(`${producto.nombre} agregado al carrito`);
    } else {
      this.mostrarMensajeError(`${producto.nombre} sin stock disponible`);
    }
  }

  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  irAlInventario(): void {
    this.router.navigate(['/inventario']);
  }

  mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mensajeExito = null;
    }, 3000);
  }

  mostrarMensajeError(mensaje: string): void {
    this.mensajeError = mensaje;
    setTimeout(() => {
      this.mensajeError = null;
    }, 3000);
  }

  scrollToProducts(): void {
    document.getElementById('productos-section')?.scrollIntoView({ behavior: 'smooth' });
  }
  
  irADetalles(productoId: number): void {
    this.router.navigate(['/detalles', productoId]);
  }
}