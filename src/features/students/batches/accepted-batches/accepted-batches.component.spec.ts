import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptedBatchesComponent } from './accepted-batches.component';

describe('AcceptedBatchesComponent', () => {
  let component: AcceptedBatchesComponent;
  let fixture: ComponentFixture<AcceptedBatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceptedBatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptedBatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
