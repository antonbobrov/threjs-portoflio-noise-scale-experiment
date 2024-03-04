import { TWebglSceneItem } from './WebglScene/types';
import { WebglManager } from '../webgl/Manager';

export type TSceneItem = TWebglSceneItem & {
  title: string;
};

export type TProps = {
  manager: WebglManager;
  items: TSceneItem[];
  onShow: () => void;
  onActiveIndex: (index: number | null) => void;
};
