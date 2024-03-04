import { loadImage, vevet } from '@anton.bobrov/vevet-init';
import { WebglManager } from './webgl/Manager';
import { DATA_SLIDES } from './DATA';
import { Scene } from './Scene/index';

const managerContainer = document.getElementById('scene') as HTMLElement;

const manager = new WebglManager(managerContainer, {
  cameraProps: { perspective: 2000 },
  rendererProps: {
    dpr: vevet.viewport.lowerDesktopDpr,
    antialias: false,
  },
});
manager.play();

let instance: Scene | null = null;

export function getScene() {
  return instance;
}

const create = (images: HTMLImageElement[]) => {
  const arrows = document.getElementById('arrows');
  const arrowPrev = document.getElementById('arrow-prev-slide');
  const arrowNext = document.getElementById('arrow-next-slide');

  const items = images.map((image, index) => ({
    ...DATA_SLIDES[index],
    image,
  }));

  instance = new Scene({
    manager,
    items,
    onShow: () => {
      arrows?.classList.add('show');
    },
    onActiveIndex: (index) => {
      arrows?.classList.toggle('hide', index !== null);
    },
  });

  arrowPrev?.addEventListener('click', () => getScene()?.prev());
  arrowNext?.addEventListener('click', () => getScene()?.next());
};

function load() {
  let loadCount = 0;

  function handleLoaded() {
    loadCount += 1;

    manager.container.setAttribute(
      'data-is-loaded',
      `${loadCount / (DATA_SLIDES.length + 1)}`,
    );
  }

  const loaders = DATA_SLIDES.map((item) => {
    const loader = loadImage(item.src);

    loader.then(handleLoaded).catch(() => {});

    return loader;
  });

  Promise.all(loaders)
    .then((images) => {
      create(images);
      handleLoaded();
    })
    .catch(() => handleLoaded());
}

load();
