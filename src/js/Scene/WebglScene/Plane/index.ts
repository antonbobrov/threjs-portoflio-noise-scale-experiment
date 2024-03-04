import {
  Mesh,
  PlaneGeometry,
  DoubleSide,
  Vector2,
  ShaderMaterial,
} from 'three';
import { NCallbacks, clamp, lerp } from '@anton.bobrov/vevet-init';
import { TProps, TRenderProps } from './types';
import { Texture } from '../Texture';

import noise from './shaders/noise.glsl';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

export class Plane {
  private get props() {
    return this._props;
  }

  private _startSize: { width: number; height: number };

  private _mouse: { current: Vector2; target: Vector2 };

  private _mesh: Mesh;

  public get mesh() {
    return this._mesh;
  }

  private _geometry: PlaneGeometry;

  private _texture: Texture;

  private _material: ShaderMaterial;

  private _callbacks: NCallbacks.IAddedCallback[] = [];

  public get mainColor() {
    return this._texture.mainColor;
  }

  constructor(private _props: TProps) {
    const { manager, parent, image } = _props;

    this._startSize = {
      width: manager.width,
      height: manager.height,
    };

    this._mouse = { current: new Vector2(0, 0), target: new Vector2(0, 0) };

    // create geometry
    this._geometry = new PlaneGeometry(
      this._startSize.width,
      this._startSize.height,
      100,
      100,
    );

    // create texture
    this._texture = new Texture({ manager, image });

    // create shader material
    this._material = new ShaderMaterial({
      vertexShader,
      fragmentShader: noise + fragmentShader,
      uniforms: {
        u_map: { value: this._texture.texture },
        u_time: { value: 0 },
        u_aspect: { value: 0 },
        u_mouseUV: { value: new Vector2(0, 0) },
        u_mouseIntensity: { value: 0 },
        u_activeProgress: { value: 0 },
        u_uvScale: { value: this._texture.uvScale },
      },
      side: DoubleSide,
    });

    // create mesh
    this._mesh = new Mesh(this._geometry, this._material);
    parent.add(this._mesh);

    // resize
    this._callbacks.push(manager.callbacks.add('resize', () => this._resize()));
  }

  /** Resize the scene */
  private _resize() {
    const { _startSize: startSize, props } = this;

    const { width, height } = props.manager;
    const widthScale = width / startSize.width;
    const heightScale = height / startSize.height;

    // set mesh scale
    this._mesh.scale.set(widthScale, heightScale, 1);
  }

  /** Render the scene */
  public render(props: TRenderProps) {
    this._renderMouse(props.mouseUV);
    this._renderPosition(props);

    const { manager, mousePosition } = this._props;
    const { uniforms } = this._material;
    const { activeProgress } = props;
    const { width, height, easeMultiplier } = manager;

    const progress = clamp(1 - props.progress, [0, 1]);

    const timeIteration = 0.01;

    // uniforms
    uniforms.u_time.value +=
      timeIteration * easeMultiplier +
      timeIteration * mousePosition.intensity * 10;
    uniforms.u_aspect.value = width / height;
    uniforms.u_activeProgress.value = Math.sin(Math.PI * activeProgress);
    uniforms.u_mouseUV.value = this._mouse.current;
    uniforms.u_mouseIntensity.value = mousePosition.intensity * progress;
    uniforms.u_uvScale.value = this._texture.uvScale;
  }

  /** Render mouse position */
  private _renderMouse(mouseUV?: Vector2) {
    const { _mouse: mouse } = this;
    const { easeMultiplier } = this._props.manager;

    const ease = 0.1 * easeMultiplier;

    if (mouseUV) {
      mouse.target.x = mouseUV.x;
      mouse.target.y = mouseUV.y;
    }

    mouse.current.x = lerp(mouse.current.x, mouse.target.x, ease);
    mouse.current.y = lerp(mouse.current.y, mouse.target.y, ease);
  }

  /** Render mesh position */
  private _renderPosition({
    progress,
    scrollYRotation: scrollYRotationProp,
    mouseYRotation: mouseYRotationProp,
    mouseXRotation: mouseXRotationProp,
    x: xProp,
    y: yProp,
    activeProgress,
  }: TRenderProps) {
    const { mesh, props } = this;
    const { manager } = props;

    const reverseActiveProgress = 1 - activeProgress;

    const zStatic =
      -manager.props.cameraProps.perspective * 0.4 * reverseActiveProgress;
    const zIteration = zStatic * 1.5;

    const unactiveProgress = 1;

    const yRotation =
      scrollYRotationProp * unactiveProgress * reverseActiveProgress;
    const mouseYRotation =
      mouseYRotationProp * unactiveProgress * reverseActiveProgress;
    const mouseXRotation =
      mouseXRotationProp * unactiveProgress * reverseActiveProgress;

    const xShift = progress * manager.width * -0.4;

    const x =
      xProp * unactiveProgress * reverseActiveProgress +
      xShift * reverseActiveProgress;
    const y = yProp * unactiveProgress * reverseActiveProgress;

    // in
    if (progress < 0) {
      mesh.position.x = x;
      mesh.position.y =
        manager.height * 1.25 * progress * reverseActiveProgress + y;
      mesh.position.z = zStatic;
      mesh.rotation.x = (Math.PI / 2.5) * progress * -1 + mouseXRotation;
      mesh.rotation.y = yRotation * progress * 0.5 + mouseYRotation;

      return;
    }

    // out
    mesh.position.x = x;
    mesh.position.y =
      manager.height * progress * reverseActiveProgress * -0.1 + y;
    mesh.position.z = zStatic + zIteration * progress;
    mesh.rotation.x = mouseXRotation;
    mesh.rotation.y = yRotation * Math.min(progress, 1) + mouseYRotation;
  }

  /** Destroy the scene */
  public destroy() {
    this.props.manager.scene.remove(this._mesh);
    this._texture.destroy();
    this._material.dispose();
    this._geometry.dispose();

    this._callbacks.forEach((event) => event.remove());
  }
}
