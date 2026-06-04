import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedTeachersComponent } from './approved-teachers.component';

describe('ApprovedTeachersComponent', () => {
  let component: ApprovedTeachersComponent;
  let fixture: ComponentFixture<ApprovedTeachersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedTeachersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedTeachersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
