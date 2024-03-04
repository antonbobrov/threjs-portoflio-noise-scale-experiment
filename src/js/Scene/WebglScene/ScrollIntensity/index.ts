import { NCallbacks, clamp, lerp } from '@anton.bobrov/vevet-init';
import { TProps } from './types';

const MAX = 100;

export class ScrollIntensity {
  private get props() {
    return this._props;
  }

  private _callbacks: NCallbacks.IAddedCallback[] = [];

  private _currentValue = 0;

  private _targetValue = 0;

  public get intensity() {
    return this._currentValue / MAX;
  }

  constructor(private _props: TProps) {
    const { handler } = _props;

    this._callbacks.push(
      handler.addCallback('wheel', ({ pixelY }) =>
        this._iterateTargetValue(pixelY),
      ),
    );

    this._callbacks.push(
      handler.addCallback('dragMove', ({ step }) =>
        this._iterateTargetValue(step.y),
      ),
    );
  }

  /** Iterate target value */
  private _iterateTargetValue(value: number) {
    this._targetValue = clamp(this._targetValue + Math.abs(value), [0, MAX]);
  }

  /** Render the scene */
  public render(easeMultiplier: number) {
    this._targetValue = lerp(this._targetValue, 0, easeMultiplier * 0.05, 0);

    this._currentValue = lerp(
      this._currentValue,
      this._targetValue,
      easeMultiplier * 0.1,
      0,
    );
  }

  /** Destroy the scene */
  public destroy() {
    this._callbacks.forEach((event) => event.remove());
  }
}
