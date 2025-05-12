import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrickBreakerComponent } from './brick-breaker.component';

describe('BrickBreakerComponent', () => {
  let component: BrickBreakerComponent;
  let fixture: ComponentFixture<BrickBreakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrickBreakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrickBreakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
