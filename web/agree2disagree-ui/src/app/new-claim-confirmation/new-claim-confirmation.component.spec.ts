import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewClaimConfirmationComponent } from './new-claim-confirmation.component';

describe('NewClaimConfirmationComponent', () => {
  let component: NewClaimConfirmationComponent;
  let fixture: ComponentFixture<NewClaimConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewClaimConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewClaimConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
