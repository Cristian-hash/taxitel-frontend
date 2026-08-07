import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Desglose } from './desglose';

describe('Desglose', () => {
  let component: Desglose;
  let fixture: ComponentFixture<Desglose>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Desglose],
    }).compileComponents();

    fixture = TestBed.createComponent(Desglose);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
