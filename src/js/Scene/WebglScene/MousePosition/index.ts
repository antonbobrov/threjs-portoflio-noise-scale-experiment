import { IAddEventListener, addEventListener } from 'vevet-dom';
import { lerp, scoped, vevet } from '@anton.bobrov/vevet-init';
import { Vector2 } from 'three';
import { TWithLerp } from './types';

export class MousePosition {
  private _listeners: IAddEventListener[] = [];

  private _clientX: TWithLerp = {
    current: vevet.viewport.width / 2,
    target: vevet.viewport.width / 2,
  };

  private _clientY: TWithLerp = {
    current: vevet.viewport.height / 2,
    target: vevet.viewport.height / 2,
  };

  private _intensity: TWithLerp = { current: 0, target: 0 };

  public get intensity() {
    return this._intensity.current / vevet.viewport.radius;
  }

  public get vec2() {
    return new Vector2(this.x, this.y);
  }

  public get x() {
    return scoped(this._clientX.current, [
      vevet.viewport.width / 2,
      vevet.viewport.width,
    ]);
  }

  public get y() {
    return scoped(this._clientY.current, [
      vevet.viewport.height / 2,
      vevet.viewport.height,
    ]);
  }

  constructor() {
    this._listeners.push(
      addEventListener(window, 'mousemove', (event) =>
        this._handleMouseMove(event),
      ),
    );
  }

  /** Handle mouse movement */
  private _handleMouseMove(event: MouseEvent) {
    const iterator =
      Math.abs(this._clientX.target - event.clientX) +
      Math.abs(this._clientY.target - event.clientY);

    const { radius } = vevet.viewport;

    this._intensity.target = Math.min(
      this._intensity.target + iterator,
      radius,
    );

    this._clientX.target = event.clientX;
    this._clientY.target = event.clientY;
  }

  /** Render the scene */
  public render(easeMultiplier: number) {
    const ease = 0.1 * easeMultiplier;

    this._clientX.current = lerp(
      this._clientX.current,
      this._clientX.target,
      ease,
    );

    this._clientY.current = lerp(
      this._clientY.current,
      this._clientY.target,
      ease,
    );

    this._intensity.current = lerp(
      this._intensity.current,
      this._intensity.target,
      ease,
    );

    this._intensity.target = lerp(this._intensity.target, 0, ease * 2);
  }

  /** Destroy the scene */
  public destroy() {
    this._listeners.forEach((event) => event.remove());
  }
}
