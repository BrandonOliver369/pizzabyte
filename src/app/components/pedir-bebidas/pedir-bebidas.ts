import { Component, input } from '@angular/core';
import { Bebidas } from '../../models/bebidas';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-pedir-bebidas',
  imports: [CommonModule],
  templateUrl: './pedir-bebidas.html',
  styleUrl: './pedir-bebidas.css',
})

export class PedirBebidas {
  coca:Bebidas = {
  id: 1,
  nombre: 'Coca',
  descripcion: 'Coca',
  precio:25.00,
  tamaño:'mediano',
  disponible:true
};
}