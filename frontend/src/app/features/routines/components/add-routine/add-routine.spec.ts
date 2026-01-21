import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoutine } from './add-routine';

describe('AddRoutine', () => {
  let component: AddRoutine;
  let fixture: ComponentFixture<AddRoutine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRoutine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRoutine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
