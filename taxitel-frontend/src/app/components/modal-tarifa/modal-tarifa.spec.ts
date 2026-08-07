import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTarifa } from './modal-tarifa';

describe('ModalTarifa', () => {
  let component: ModalTarifa;
  let fixture: ComponentFixture<ModalTarifa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTarifa],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalTarifa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
