export interface Bebidas {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    tamaño: 'chico'|'mediano'|'grande';
    disponible: boolean;
}