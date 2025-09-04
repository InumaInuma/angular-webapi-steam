import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DotaItems } from './dota-items';

describe('DotaItems', () => {
  let component: DotaItems;
  let fixture: ComponentFixture<DotaItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DotaItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DotaItems);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
