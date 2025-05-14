import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';
import { loadScript } from "@paypal/paypal-js";
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy {
  carrito: Producto[] = [];
  recibo: string = '';
  pagoRealizado: boolean = false;
  detallesPago: any = null;
  showPaypal: boolean = false;
  cargandoPaypal: boolean = false;
  errorPaypal: string | null = null;
  
  // Referencia al contenedor del botón PayPal
  @ViewChild('paypalBtnContainer') paypalContainer!: ElementRef;
  
  constructor(
    private carritoService: CarritoService, 
    private productoService: ProductoService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.carrito = this.carritoService.obtenerCarrito();
  }
  
  ngOnDestroy() {
    // Limpiar recursos de PayPal si es necesario
    if (this.paypalContainer && this.paypalContainer.nativeElement) {
      this.paypalContainer.nativeElement.innerHTML = '';
    }
  }
  
  // Método para iniciar el proceso de pago
iniciarPago() {
  // Si ya está cargando PayPal, no hacer nada
  if (this.cargandoPaypal) return;
  
  this.showPaypal = true;
  this.cargandoPaypal = true;
  this.errorPaypal = null;
  
  // Limpiar el contenedor antes de renderizar un nuevo botón
  if (this.paypalContainer && this.paypalContainer.nativeElement) {
    this.paypalContainer.nativeElement.innerHTML = '';
  }
  
  setTimeout(() => {
    this.cargarPayPal();
  }, 100);
}
  
  // Método para cargar el SDK de PayPal
  async cargarPayPal() {
    try {
      const paypal = await loadScript({ 
        clientId: "ATgwU7zLjRuJY5EuSVEMnFs8F_OA7SxJLePM31Dft_RebqDlNM7zLQGc_4EPajNEiFaoHXJ_YHE-4Fwh",
        currency: "MXN"
      });
      
      if (paypal) {
        this.renderBotonPayPal();
        this.cargandoPaypal = false;
      }
    } catch (error) {
      console.error("Error al cargar PayPal:", error);
      this.cargandoPaypal = false;
      this.errorPaypal = "No se pudo cargar el sistema de pago. Intente más tarde.";
    }
  }
    
  // Renderiza el botón de PayPal
  renderBotonPayPal() {
    if (!window.paypal || this.carrito.length === 0 || !this.paypalContainer) return;
    
    try {
      // @ts-ignore - PayPal está cargado globalmente
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay'
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            intent: "CAPTURE", // Añadimos esta propiedad requerida
            purchase_units: [{
              amount: {
                value: this.calcularTotal(),
                currency_code: 'MXN'
              },
              description: 'Compra en Papos Valencia'
            }]
          });
        },
        onApprove: (data, actions) => {
          if (actions.order) {
            return actions.order.capture().then(details => {
              this.procesarPagoExitoso(details);
            });
          } else {
            console.error('Error: actions.order es undefined');
            this.errorPaypal = "Ocurrió un error durante el proceso de pago.";
            return Promise.reject('actions.order es undefined');
          }
        },
        onError: err => {
          console.error('Error en la transacción de PayPal:', err);
          this.errorPaypal = "Ocurrió un error durante el proceso de pago.";
        },
        onCancel: () => {
          console.log('Usuario canceló el pago');
        }
      }).render(this.paypalContainer.nativeElement);
    } catch (error) {
      console.error("Error al renderizar el botón de PayPal:", error);
      this.errorPaypal = "Error al mostrar opciones de pago.";
    }
  }
  
  // Procesa el pago exitoso
  procesarPagoExitoso(detalles: any) {
    console.log('Pago completado:', detalles);
    this.pagoRealizado = true;
    this.detallesPago = detalles;
    
    // Guardar la compra actual antes de vaciar el carrito
    this.carritoService.guardarUltimaCompra();
    
    // Actualizar el stock de los productos comprados
    this.actualizarInventario();
    
    // Generar XML después de guardar la última compra
    this.generarXML();
    
    // Vaciamos el carrito en el servicio
    this.carritoService.vaciarCarrito();
    this.carrito = []; // También vaciamos el carrito local
  }

  // Método para actualizar el inventario después de una compra
  actualizarInventario() {
    const productosComprados = this.carritoService.obtenerUltimaCompra();
    
    productosComprados.forEach(producto => {
      this.productoService.actualizarStock(producto.id, producto.cantidad)
        .subscribe({
          next: (resultado) => {
            console.log(`Stock actualizado para ${producto.nombre}. Nuevo stock: ${resultado.nuevoStock}`);
          },
          error: (error) => {
            console.error(`Error al actualizar stock para ${producto.nombre}:`, error);
          }
        });
    });
  }

  // Traduce el estado de pago de inglés a español
  traducirEstado(estado: string): string {
    const traducciones: {[key: string]: string} = {
      'COMPLETED': 'Completado',
      'APPROVED': 'Aprobado',
      'CREATED': 'Creado',
      'SAVED': 'Guardado',
      'PENDING': 'Pendiente',
      'VOIDED': 'Anulado',
      'PAYER_ACTION_REQUIRED': 'Acción requerida'
    };
    return traducciones[estado] || estado;
  }

  eliminarProducto(index: number) {
    this.carritoService.eliminarProducto(index);
    this.carrito = this.carritoService.obtenerCarrito();
    
    // Si vaciamos el carrito, ocultamos PayPal
    if (this.carrito.length === 0) {
      this.showPaypal = false;
    }
  }

  generarXML() {
    this.recibo = this.carritoService.generarXML();
    return this.recibo;
  }

  calcularTotal() {
    const total = this.carrito.reduce((total, producto) => 
      total + (producto.precio * producto.cantidad), 0);
    return total.toFixed(2);
  }

  descargarXML() {
    const xmlData = this.carritoService.generarXML();
    const blob = new Blob([xmlData], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo_papos_valencia.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  irAProductos() {
    this.router.navigate(['/productos']);
  }

  // Método para volver a comprar después de un pago exitoso
  volverAComprar() {
    this.pagoRealizado = false;
    this.detallesPago = null;
    this.recibo = '';
    this.irAProductos();
  }

  incrementarCantidad(index: number) {
    const producto = this.carrito[index];
    if (producto.cantidad < producto.stock) {
      producto.cantidad++;
    }
  }

  decrementarCantidad(index: number) {
    if (this.carrito[index].cantidad > 1) {
      this.carrito[index].cantidad--;
    } else {
      this.eliminarProducto(index);
    }
  }

  // Método para actualizar cantidad cuando se ingresa manualmente
  actualizarCantidadManual(index: number, nuevaCantidad: number): void {
    // Convertir a número entero y asegurar que sea al menos 1
    nuevaCantidad = Math.max(1, Math.floor(Number(nuevaCantidad)));
    
    // Limitar al stock disponible
    if (nuevaCantidad > this.carrito[index].stock) {
      nuevaCantidad = this.carrito[index].stock;
    }
    
    // Actualizar la cantidad en el carrito
    this.carrito[index].cantidad = nuevaCantidad;
  }
}