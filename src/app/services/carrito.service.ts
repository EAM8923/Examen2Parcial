import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: Producto[] = [];
  private ultimaCompra: Producto[] = [];

  obtenerCarrito(): Producto[] {
    return this.carrito;
  }

  eliminarProducto(index: number) {
    if (this.carrito[index].cantidad > 1) {
      this.carrito[index].cantidad--; // Reduce la cantidad
    } else {
      this.carrito.splice(index, 1); // Elimina el producto
    }
  }

  agregarProducto(producto: Producto) {
    const index = this.carrito.findIndex(p => p.id === producto.id);
    if (index > -1) {
      this.carrito[index].cantidad++; // Incrementa la cantidad
    } else {
      this.carrito.push(producto); // Agrega el producto
    }
  }

  // Guardar la última compra antes de vaciar el carrito
  guardarUltimaCompra() {
    this.ultimaCompra = [...this.carrito];
  }

  // Obtener la última compra
  obtenerUltimaCompra(): Producto[] {
    return this.ultimaCompra;
  }

  generarXML(): string {
    // Usamos el carrito actual o la última compra si el carrito está vacío
    const productosParaXML = this.carrito.length > 0 ? this.carrito : this.ultimaCompra;
    
    const IVA_RATE = 0.16; // Tasa del IVA
    const subtotal = productosParaXML.reduce((sum, producto) => 
      sum + (producto.precio * producto.cantidad), 0);
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;
    const negocio = 'Papos Valencia';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<factura>\n';
    xml += `  <negocio>${negocio}</negocio>\n`;
    xml += '  <productos>\n';

    productosParaXML.forEach(producto => {
      xml += '    <producto>\n';
      xml += `      <id>${producto.id}</id>\n`;
      xml += `      <nombre>${producto.nombre}</nombre>\n`;
      xml += `      <precio>${producto.precio}</precio>\n`;
      xml += `      <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += '    </producto>\n';
    });

    xml += '  </productos>\n';
    xml += `  <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
    xml += `  <iva>${iva.toFixed(2)}</iva>\n`;
    xml += `  <total>${total.toFixed(2)}</total>\n`;
    xml += '</factura>';

    return xml;
  }

  vaciarCarrito() {
    this.carrito = [];
    return this.carrito;
  }
}