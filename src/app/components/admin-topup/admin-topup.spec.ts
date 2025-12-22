import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTopup } from './admin-topup';

describe('AdminTopup', () => {
  let component: AdminTopup;
  let fixture: ComponentFixture<AdminTopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
