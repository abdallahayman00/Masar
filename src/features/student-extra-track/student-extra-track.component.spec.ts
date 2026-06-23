import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentExtraTrackComponent } from './student-extra-track.component';

describe('StudentExtraTrackComponent', () => {
  let component: StudentExtraTrackComponent;
  let fixture: ComponentFixture<StudentExtraTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExtraTrackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentExtraTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
