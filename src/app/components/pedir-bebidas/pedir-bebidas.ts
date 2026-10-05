import { Component, input } from '@angular/core';
import { Bebidas } from '../../models/bebidas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedir-bebidas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedir-bebidas.html',
  styleUrl: './pedir-bebidas.css',
})
export class PedirBebidas {
  bebida = input<Bebidas>();

  coca: Bebidas = {
    id: 1,
    nombre: 'Coca',
    descripcion: 'Refresco Coca-Cola',
    precio: 25.00,
    tamano: 'mediano',
    tamaño: 'mediano',
    disponible: true
  };
}