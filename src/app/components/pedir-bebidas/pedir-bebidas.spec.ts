import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedirBebidas } from './pedir-bebidas';

describe('PedirBebidas', () => {
  let component: PedirBebidas;
  let fixture: ComponentFixture<PedirBebidas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedirBebidas],
    }).compileComponents();

    fixture = TestBed.createComponent(PedirBebidas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
