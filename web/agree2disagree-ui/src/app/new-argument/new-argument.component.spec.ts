import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewArgumentComponent } from './new-argument.component';

describe('NewArgumentComponent', () => {
  let component: NewArgumentComponent;
  let fixture: ComponentFixture<NewArgumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewArgumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewArgumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
