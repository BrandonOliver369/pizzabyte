export interface Bebidas {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  tamano?: 'chico' | 'mediano' | 'grande';
  tamaño?: 'chico' | 'mediano' | 'grande';
  disponible: boolean;
}