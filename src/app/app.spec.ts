import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient()
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render PizzaByte heading', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Pizza Artesanal');
  });

  it('should initialize with menu tab active', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.tabActiva()).toBe('menu');
  });

  it('should switch to admin tab and render admin dashboard', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.cambiarTab('admin');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-admin-dashboard')).toBeTruthy();
  });

  it('should smoothly translate pizza from center to left on scroll in desktop', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.windowWidth.set(1280);

    // At top of page (hero), pizza is centered with positive shiftX
    app.scrollY.set(0);
    expect(app.scrollProgress()).toBe(0);
    const styleAtTop = app.pizzaTransformStyle();
    expect(styleAtTop).toContain('translate3d');
    expect(styleAtTop).not.toContain('translate3d(0px,');

    // When scrolled past the threshold, pizza arrives at left column (shiftX = 0px)
    app.scrollY.set(500);
    expect(app.scrollProgress()).toBe(1);
    const styleScrolled = app.pizzaTransformStyle();
    expect(styleScrolled).toContain('translate3d(0px, 0px, 0px)');
  });
});
