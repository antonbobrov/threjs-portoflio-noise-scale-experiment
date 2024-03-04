export class ScrollLine {
  private _element: HTMLDivElement;

  constructor() {
    this._element = document.createElement('div');
    this._element.classList.add('scroll-line');
    document.body.append(this._element);
  }

  public render(progress: number) {
    this._element.style.transform = `scale(1, ${progress})`;
  }

  public activate() {
    this._element.style.opacity = '1';
  }

  public deactivate() {
    this._element.style.opacity = '0';
  }

  /** Destroy the scene */
  public destroy() {
    this._element.remove();
  }
}
