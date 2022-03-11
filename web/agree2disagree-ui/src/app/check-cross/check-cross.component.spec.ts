import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckCrossComponent } from './check-cross.component';

describe('CheckCrossComponent', () => {
  let component: CheckCrossComponent;
  let fixture: ComponentFixture<CheckCrossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckCrossComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckCrossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
