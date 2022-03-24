import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisagreerInviteComponent } from './disagreer-invite.component';

describe('DisagreerInviteComponent', () => {
  let component: DisagreerInviteComponent;
  let fixture: ComponentFixture<DisagreerInviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisagreerInviteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisagreerInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
