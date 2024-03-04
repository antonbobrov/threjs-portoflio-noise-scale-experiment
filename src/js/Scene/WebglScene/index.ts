import { Color, Fog, Group, Raycaster } from 'three';
import {
  EaseInOutBack,
  NCallbacks,
  SlideProgress,
  Timeline,
  clamp,
} from '@anton.bobrov/vevet-init';
import { TProps } from './types';
import { Plane } from './Plane';
import { ScrollIntensity } from './ScrollIntensity';
import { MousePosition } from './MousePosition';

export class WebglScene {
  private get props() {
    return this._props;
  }

  private _mousePosition: MousePosition;

  private get manager() {
    return this.props.manager;
  }

  private _callbacks: NCallbacks.IAddedCallback[] = [];

  private _handler: SlideProgress;

  private get handler() {
    return this._handler;
  }

  private _scrollIntensity: ScrollIntensity;

  private get scrollIntensity() {
    return this._scrollIntensity;
  }

  private _group: Group;

  private _planes: Plane[] = [];

  private get planes() {
    return this._planes;
  }

  private _activeTimeline: Timeline;

  private _showTimeline: Timeline | null = null;

  private _activeProgress = 0;

  private _activeIndex: number | null = null;

  private _raycaster: Raycaster;

  constructor(private _props: TProps) {
    const { manager, items, onProgress } = _props;

    this._mousePosition = new MousePosition();

    this._handler = new SlideProgress({
      container: manager.container,
      min: -0.1,
      max: items.length - 1 + 0.1,
      step: 1,
      stickyEndDuration: null,
      friction: 0.98,
      ease: 0.075,
    });

    this._handler.addCallback('render', () =>
      onProgress(this._handler.progress / (items.length - 1)),
    );

    this._scrollIntensity = new ScrollIntensity({ handler: this._handler });

    this._callbacks.push(manager.callbacks.add('render', () => this._render()));

    this._group = new Group();
    manager.scene.add(this._group);

    this._planes = items.map(
      (item, index) =>
        new Plane({
          ...item,
          manager,
          parent: this._group,
          index,
          mousePosition: this._mousePosition,
        }),
    );

    this._activeTimeline = new Timeline({
      duration: 2000,
      easing: EaseInOutBack,
    });

    this._activeTimeline.addCallback('progress', ({ easing }) => {
      this._activeProgress = easing;
    });

    this._raycaster = new Raycaster();
  }

  /** Render the scene */
  private _render() {
    const { manager, scrollIntensity } = this;
    const { easeMultiplier } = manager;

    this._raycaster.setFromCamera(this._mousePosition.vec2, manager.camera);

    scrollIntensity.render(easeMultiplier);

    this._renderPlanes();
    this._renderBackground();
  }

  /** Render planes */
  private _renderPlanes() {
    const {
      handler,
      manager,
      scrollIntensity,
      _mousePosition: mousePosition,
    } = this;
    const { width, height } = manager;
    const { progress: globalProgress } = handler;

    mousePosition.render(manager.easeMultiplier);

    const scrollYRotation = Math.PI * 0.2 * scrollIntensity.intensity;
    const mouseYRotation = Math.PI * 0.05 * mousePosition.x;
    const mouseXRotation = Math.PI * 0.05 * mousePosition.y;

    const x = width * -0.025 * mousePosition.x;
    const y = height * 0.025 * mousePosition.y;

    const intersects = this._raycaster.intersectObjects(this._group.children);

    this._planes.forEach((plane, index) => {
      const progress = globalProgress - index;

      const intersection = intersects.find(
        (intersect) => intersect.object === plane.mesh,
      );

      plane.render({
        progress,
        scrollYRotation,
        mouseYRotation,
        mouseXRotation,
        x,
        y,
        activeProgress: this._activeIndex === index ? this._activeProgress : 0,
        mouseUV: intersection?.uv,
      });
    });

    // for (let i = 0; i < intersects.length; i += 1) {
    //   intersects[i]
    // }
  }

  /** Render background */
  private _renderBackground() {
    const { manager, handler, planes } = this;
    const { scene } = manager;

    const minMax = [0, planes.length - 1];

    const prevIndex = clamp(Math.floor(handler.progress), minMax);
    const nextIndex = clamp(Math.ceil(handler.progress), minMax);
    const progress = clamp(handler.progress, minMax) % 1;

    const color = new Color(planes[prevIndex].mainColor);
    const endColor = new Color(planes[nextIndex].mainColor);

    color.lerp(endColor, progress);

    scene.background = color;
    scene.fog = new Fog(
      color,
      0,
      (manager.cameraInstance?.perspective ?? 0) * 8,
    );
  }

  /** Activate * */
  public activate() {
    const { _activeTimeline: activeTimeline, handler, props } = this;

    if (activeTimeline.isPlaying || activeTimeline.progress === 1) {
      return;
    }

    this._activeIndex = Math.round(handler.steppedProgress);
    props.onActiveIndex(this._activeIndex);

    activeTimeline.play();

    handler.changeProps({ hasWheel: false, hasDrag: false });
  }

  /** Deactivate */
  public deactivate() {
    const { _activeTimeline: activeTimeline, handler, props } = this;

    if (activeTimeline.progress === 0) {
      return;
    }

    activeTimeline.reverse();
    props.onActiveIndex(null);

    const callback = activeTimeline.addCallback('start', () => {
      this._activeIndex = null;
      handler.changeProps({ hasWheel: true, hasDrag: true });

      callback.remove();
    });
  }

  /** Show the scene */
  public show(duration: number) {
    if (this._showTimeline) {
      return;
    }

    this._showTimeline = new Timeline({ duration });

    this._showTimeline.addCallback('progress', ({ easing }) => {
      this._group.position.y = this.manager.height * (1 - easing) * -2;
      this._group.rotation.x = Math.PI * 0.35 * (1 - easing);
    });

    this._showTimeline.play();
  }

  /** Go to next */
  public next() {
    const handler = this._handler;

    const value = clamp(Math.round(handler.progress) + 1, [
      handler.props.min,
      handler.props.max,
    ]);

    this._handler.to({ value, duration: 1000 });
  }

  /** Go to prev */
  public prev() {
    const handler = this._handler;

    const value = clamp(Math.round(handler.progress) - 1, [
      handler.props.min,
      handler.props.max,
    ]);

    this._handler.to({ value, duration: 1000 });
  }

  /** Destroy the scene */
  public destroy() {
    this._mousePosition.destroy();
    this._handler.destroy();
    this._scrollIntensity.destroy();

    this.props.manager.scene.remove(this._group);

    this._planes.forEach((plane) => plane.destroy());

    this._callbacks.forEach((event) => event.remove());

    this._activeTimeline.destroy();
    this._showTimeline?.destroy();
  }
}
