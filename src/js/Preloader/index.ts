import {
  ProgressPreloader,
  Timeline,
  clampScope,
  easing,
} from '@anton.bobrov/vevet-init';
import { TProps } from './types';

export class Preloader {
  private _instance: ProgressPreloader;

  private _bgElement: HTMLElement | null;

  private _percentElement: HTMLElement | null;

  constructor(private _props: TProps) {
    this._bgElement = _props.container.querySelector('*[data-bg]');
    this._percentElement = _props.container.querySelector('*[data-percent]');

    this._instance = new ProgressPreloader({
      container: _props.container,
      hideAnimation: false,
    });

    this._instance.addCallback('progress', ({ progress }) =>
      this._renderProgress(progress),
    );

    this._instance.addCallback('loaded', () => {
      _props.onHide();

      const tm = new Timeline({ parent: this._instance, duration: 1250 });

      tm.addCallback('progress', ({ progress }) => this._renderHide(progress));

      tm.play();
    });
  }

  private _renderProgress(progress: number) {
    if (!this._percentElement) {
      return;
    }

    const percent = Math.min(Math.floor(progress * 100), 99);
    const string = `${percent}`.padStart(2, '0');

    this._percentElement.innerHTML = `${string}%`;
  }

  private _renderHide(globalProgress: number) {
    if (!this._bgElement || !this._percentElement) {
      return;
    }

    const percentProgress = easing(clampScope(globalProgress, [0, 0.75]));
    const percentScale = 1 + percentProgress * 0.4;
    this._percentElement.style.transform = `scale(${percentScale})`;
    this._percentElement.style.opacity = `${1 - percentProgress}`;

    const bgProgress = easing(clampScope(globalProgress, [0.1, 1]));
    this._bgElement.style.transform = `scale(1, ${1 - bgProgress})`;

    if (globalProgress === 1) {
      this._instance.hide(0);
    }
  }

  public destroy() {
    this._instance.destroy();
  }
}
