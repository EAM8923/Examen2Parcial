export class Producto {
    constructor(
        public id: number,
        public nombre: string,
        public precio: number,
        public imagen: string,
        public cantidad: number = 1,
        public stock: number = 0,
        public categoria?: string,
        public descripcion?: string
    ) {}
}