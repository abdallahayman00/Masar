import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingBatchesComponent } from './pending-batches.component';

describe('PendingBatchesComponent', () => {
  let component: PendingBatchesComponent;
  let fixture: ComponentFixture<PendingBatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingBatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingBatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
