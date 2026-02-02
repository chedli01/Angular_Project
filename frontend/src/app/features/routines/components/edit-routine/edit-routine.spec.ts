import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoutine } from './edit-routine';

describe('EditRoutine', () => {
  let component: EditRoutine;
  let fixture: ComponentFixture<EditRoutine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRoutine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRoutine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
