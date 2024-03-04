import { IAddEventListener, addEventListener } from 'vevet-dom';
import { Content } from './Content';
import { ScrollLine } from './ScrollLine';
import { TProps } from './types';
import { WebglScene } from './WebglScene';

export class Scene {
  private _webglScene: WebglScene;

  private _scrollLine: ScrollLine;

  private _contents: Content[];

  private _listeners: IAddEventListener[] = [];

  constructor(private _props: TProps) {
    this._scrollLine = new ScrollLine();

    this._webglScene = new WebglScene({
      ..._props,
      onActiveIndex: (index) => this._handleActiveIndex(index),
      onProgress: (globalProgress) => {
        this._scrollLine.render(globalProgress);
      },
    });

    this._contents = _props.items.map(
      (item) =>
        new Content({ ...item, onClose: () => this._webglScene.deactivate() }),
    );

    this._listeners.push(
      addEventListener(_props.manager.container, 'click', () =>
        this._webglScene.activate(),
      ),
    );

    this._listeners.push(
      addEventListener(window, 'keydown', (event) => {
        if (event.key === 'Escape') {
          this._webglScene.deactivate();
        }
      }),
    );
  }

  /** Callback on active index change */
  private _handleActiveIndex(activeIndex: number | null) {
    this._props.onActiveIndex(activeIndex);

    if (typeof activeIndex === 'number') {
      this._scrollLine.deactivate();
    } else {
      this._scrollLine.activate();
    }

    this._contents.forEach((content, contentIndex) => {
      if (contentIndex === activeIndex) {
        content.activate();
      } else {
        content.deactivate();
      }
    });
  }

  /** Show the scene */
  public show(duration: number) {
    this._webglScene.show(duration);

    this._props.onShow();
  }

  /** Go to next */
  public next() {
    this._webglScene.next();
  }

  /** Go to prev */
  public prev() {
    this._webglScene.prev();
  }

  /** Destroy the scene */
  public destroy() {
    this._scrollLine.destroy();
    this._webglScene.destroy();
    this._contents.forEach((content) => content.destroy());

    this._listeners.forEach((event) => event.remove());
  }
}
