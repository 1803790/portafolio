import './styles/main.scss';
import { initI18n } from './i18n';
import { initValley } from './lights';
import { initMotion } from './animations';
import { initProyectos } from './projects';
import { initHeroLottie } from './hero-lottie';

initI18n();

const canvas = document.getElementById('valley');
if (canvas instanceof HTMLCanvasElement) initValley(canvas);

initMotion();
initProyectos();
initHeroLottie();
