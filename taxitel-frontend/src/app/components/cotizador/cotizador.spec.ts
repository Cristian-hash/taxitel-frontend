import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cotizador } from './cotizador';

describe('Cotizador', () => {
  let component: Cotizador;
  let fixture: ComponentFixture<Cotizador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cotizador],
    }).compileComponents();

    fixture = TestBed.createComponent(Cotizador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
