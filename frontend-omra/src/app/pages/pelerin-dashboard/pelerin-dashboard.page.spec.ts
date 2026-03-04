import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PelerinDashboardPage } from './pelerin-dashboard.page';

describe('PelerinDashboardPage', () => {
  let component: PelerinDashboardPage;
  let fixture: ComponentFixture<PelerinDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PelerinDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
