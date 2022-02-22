import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnoTextComponent } from './ano-text.component';

describe('AnoTextComponent', () => {
  let component: AnoTextComponent;
  let fixture: ComponentFixture<AnoTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnoTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnoTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
