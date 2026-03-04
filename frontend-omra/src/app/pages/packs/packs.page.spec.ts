import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacksPage } from './packs.page';

describe('PacksPage', () => {
  let component: PacksPage;
  let fixture: ComponentFixture<PacksPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PacksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
