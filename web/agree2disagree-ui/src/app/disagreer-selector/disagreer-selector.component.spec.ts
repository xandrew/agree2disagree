import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisagreerSelectorComponent } from './disagreer-selector.component';

describe('DisagreerSelectorComponent', () => {
  let component: DisagreerSelectorComponent;
  let fixture: ComponentFixture<DisagreerSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisagreerSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisagreerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
