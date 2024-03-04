import { WebglManager } from '../../webgl/Manager';

export type TWebglSceneItem = {
  image: HTMLImageElement;
};

export type TProps = {
  manager: WebglManager;
  items: TWebglSceneItem[];
  onActiveIndex: (index: number | null) => void;
  onProgress: (globalProgress: number) => void;
};
