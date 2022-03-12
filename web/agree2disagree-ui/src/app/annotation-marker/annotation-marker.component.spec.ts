import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationMarkerComponent } from './annotation-marker.component';

describe('AnnotationMarkerComponent', () => {
  let component: AnnotationMarkerComponent;
  let fixture: ComponentFixture<AnnotationMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationMarkerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotationMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
