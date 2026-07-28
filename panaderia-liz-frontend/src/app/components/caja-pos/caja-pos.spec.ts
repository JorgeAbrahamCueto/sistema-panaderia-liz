import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaPos } from './caja-pos';

describe('CajaPos', () => {
  let component: CajaPos;
  let fixture: ComponentFixture<CajaPos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaPos],
    }).compileComponents();

    fixture = TestBed.createComponent(CajaPos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
