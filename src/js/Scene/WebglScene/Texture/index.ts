import { Color, Texture as ThreeTexture, Vector2 } from 'three';
import { Ctx2DPrerender, NCallbacks } from '@anton.bobrov/vevet-init';
import { TProps } from './types';

export class Texture {
  private _texture: ThreeTexture;

  private _callbacks: NCallbacks.IAddedCallback[] = [];

  public get texture() {
    return this._texture;
  }

  private _mainColor: Color = new Color(0xffffff);

  private _uvScale: Vector2;

  public get uvScale() {
    return this._uvScale;
  }

  public get mainColor() {
    return this._mainColor;
  }

  constructor(private _props: TProps) {
    const { manager, image } = _props;

    this._texture = new ThreeTexture(image);
    this._texture.matrixAutoUpdate = false;

    this._uvScale = new Vector2(1, 1);

    this._callbacks.push(manager.callbacks.add('resize', () => this._resize()));

    this._resize();
    this._updateMainColor();
  }

  /** Resize texture */
  private _resize() {
    const { manager } = this._props;
    const texture = this._texture;

    const aspect = manager.width / manager.height;
    const imageAspect = texture.image.width / texture.image.height;

    if (aspect < imageAspect) {
      texture.matrix.setUvTransform(0, 0, aspect / imageAspect, 1, 0, 0.5, 0.5);
      this._uvScale = new Vector2(aspect / imageAspect, 1);
    } else {
      texture.matrix.setUvTransform(0, 0, 1, imageAspect / aspect, 0, 0.5, 0.5);
      this._uvScale = new Vector2(1, imageAspect / aspect);
    }

    this._texture.needsUpdate = true;
  }

  /** Update main color */
  private _updateMainColor() {
    const { image } = this._props;
    const aspectRatio = image.naturalHeight / image.naturalWidth;

    const ctx2d = new Ctx2DPrerender({
      container: false,
      width: 100,
      height: aspectRatio * 100,
      media: image,
      hasInitialResize: true,
      hasResize: false,
      dpr: 1,
    });

    ctx2d.resize();

    const { data: rgbas } = ctx2d.ctx.getImageData(
      0,
      0,
      ctx2d.width,
      ctx2d.height,
    );

    let r = 0;
    let g = 0;
    let b = 0;

    for (let i = 0; i < rgbas.length; i += 4) {
      r += rgbas[i];
      g += rgbas[i + 1];
      b += rgbas[i + 2];
    }

    const intensity = 0.6;

    r = Math.floor((r / rgbas.length) * 4 * intensity);
    g = Math.floor((g / rgbas.length) * 4 * intensity);
    b = Math.floor((b / rgbas.length) * 4 * intensity);

    this._mainColor = new Color(`rgb(${r}, ${g}, ${b})`);

    ctx2d.destroy();
  }

  /** Destroy the scene */
  public destroy() {
    this._texture.dispose();

    this._callbacks.forEach((callback) => callback.remove());
  }
}
