import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimSelectorComponent } from './claim-selector.component';

describe('ClaimSelectorComponent', () => {
  let component: ClaimSelectorComponent;
  let fixture: ComponentFixture<ClaimSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
