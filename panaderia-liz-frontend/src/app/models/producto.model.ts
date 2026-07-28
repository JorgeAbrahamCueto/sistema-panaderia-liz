export interface Categoria {
  idCategoria?: number; 
  id?: number;
  nombre: string;
  descripcion: string;
}

export interface Producto {
  idProducto: number; 
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: Categoria;
  creado?: string;
}

export interface DetalleVenta {
  idDetalle?: number;
  producto: { idProducto: number }; 
  cantidad: number;
  subtotal: number;
}

export interface Venta {
  [x: string]: any;
  id?: number;
  idVenta?: number; // Agregado por si Java envía id_venta
  usuario: { idUsuario: number }; 
  fechaVenta?: string;
  subtotal: number;      
  igv: number;           
  total: number;
  montoRecibido: number; 
  vuelto: number;        
  detalles: DetalleVenta[];
}