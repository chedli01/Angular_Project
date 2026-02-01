import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutineCard } from './routine-card';

describe('RoutineCard', () => {
  let component: RoutineCard;
  let fixture: ComponentFixture<RoutineCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutineCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutineCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
