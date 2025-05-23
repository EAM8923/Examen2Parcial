import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-producto-detalles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-detalles.component.html',
  styleUrls: ['./producto-detalles.component.css']
})
export class ProductoDetallesComponent implements OnInit {
  producto: Producto | null = null;
  cantidad: number = 1;
  cargando = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    const productoId = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.obtenerProductoPorId(productoId).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar el producto:', error);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  incrementarCantidad(): void {
    if (this.producto && this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  agregarAlCarrito(): void {
    if (this.producto && this.producto.stock > 0) {
      const productoParaCarrito = {
        ...this.producto,
        cantidad: this.cantidad
      };
      this.carritoService.agregarProducto(productoParaCarrito);
      alert(`${this.producto.nombre} agregado al carrito`);
    }
  }

  irAProductos(): void {
    this.router.navigate(['/productos']);
  }
}