import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitRoutine } from './habit-routine';

describe('HabitRoutine', () => {
  let component: HabitRoutine;
  let fixture: ComponentFixture<HabitRoutine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitRoutine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabitRoutine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
