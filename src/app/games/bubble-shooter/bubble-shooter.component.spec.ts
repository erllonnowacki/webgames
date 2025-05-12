import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleShooterComponent } from './bubble-shooter.component';

describe('BubbleShooterComponent', () => {
  let component: BubbleShooterComponent;
  let fixture: ComponentFixture<BubbleShooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BubbleShooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BubbleShooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
