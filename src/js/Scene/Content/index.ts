/* eslint-disable no-param-reassign */
import {
  SplitText,
  Timeline,
  clampScope,
  easing,
  spreadScope,
} from '@anton.bobrov/vevet-init';
import { TProps } from './types';

export class Content {
  private _container: HTMLDivElement;

  private _titleElement: HTMLParagraphElement;

  private _titleText: SplitText;

  private _timeline: Timeline;

  private _closeElement: HTMLButtonElement;

  constructor({ title, onClose }: TProps) {
    this._container = document.createElement('div');
    this._container.classList.add('content');
    document.body.append(this._container);

    this._titleElement = document.createElement('p');
    this._titleElement.classList.add('content__title');
    this._titleElement.innerHTML = title;
    this._container.append(this._titleElement);

    this._closeElement = document.createElement('button');
    this._closeElement.classList.add('content__close');
    this._closeElement.title = 'Close';
    this._closeElement.onclick = onClose;
    this._container.append(this._closeElement);

    this._titleText = new SplitText({
      container: this._titleElement,
      hasLetters: true,
      hasLines: false,
      textSource: 'innerHTML',
    });

    this._timeline = new Timeline({ duration: 1500 });
    this._timeline.addCallback('progress', ({ progress }) =>
      this._render(progress),
    );
  }

  /** Render scene */
  private _render(globalProgress: number) {
    const containerProgress = clampScope(globalProgress, [0, 0.4]);
    const titleProgress = clampScope(globalProgress, [0.2, 1]);
    const closeProgress = clampScope(globalProgress, [0.2, 0.4]);

    this._renderContainer(containerProgress);
    this._renderTitle(titleProgress);
    this._renderClose(closeProgress);
  }

  /** Render container */
  private _renderContainer(progress: number) {
    this._container.style.visibility = progress === 0 ? 'hidden' : 'visible';
    this._container.style.opacity = `${progress}`;
  }

  /** Render title */
  private _renderTitle(progress: number) {
    const { letters } = this._titleText;
    const spread = spreadScope(letters.length, 0.85);

    letters.forEach(({ element }, index) => {
      const letterProgress = clampScope(progress, spread[index]);
      const letterEasing = easing(letterProgress);

      const rotationX = -90 * (1 - letterEasing);
      const y = -50 * (1 - letterEasing);

      element.style.opacity = `${letterProgress}`;
      element.style.transform = `rotateX(${rotationX}deg) translate3d(0, ${y}%, 0)`;
    });
  }

  /** Render close button */
  private _renderClose(progress: number) {
    this._closeElement.style.opacity = `${progress}`;
  }

  public activate() {
    this._timeline.play();
  }

  public deactivate() {
    this._timeline.reverse();
  }

  /** Destroy the scene */
  public destroy() {
    this._titleText.destroy();
    this._titleElement.remove();
    this._closeElement.remove();
    this._container.remove();

    this._timeline.destroy();
  }
}
