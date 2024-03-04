import { Object3D, Vector2 } from 'three';
import { WebglManager } from '../../../webgl/Manager';
import { MousePosition } from '../MousePosition';

export type TProps = {
  manager: WebglManager;
  parent: Object3D;
  index: number;
  image: HTMLImageElement;
  mousePosition: MousePosition;
};

export type TRenderProps = {
  progress: number;
  scrollYRotation: number;
  mouseYRotation: number;
  mouseXRotation: number;
  x: number;
  y: number;
  activeProgress: number;
  mouseUV: Vector2 | undefined;
};
