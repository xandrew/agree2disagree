import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisagreersPanelComponent } from './disagreers-panel.component';

describe('DisagreersPanelComponent', () => {
  let component: DisagreersPanelComponent;
  let fixture: ComponentFixture<DisagreersPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisagreersPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisagreersPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
