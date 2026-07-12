import { EDITABLE } from './config';

// Sistema de proyectos editable. Los datos viven en IndexedDB (en el
// navegador), así que sobreviven a las recargas. Las imágenes se guardan
// comprimidas; los videos se enlazan (YouTube/Vimeo/enlace directo).

export interface Proyecto {
  id: string;
  titulo: string;
  repo: string;
  descripcion: string;
  imagenes: string[]; // data URLs (jpeg comprimido)
  videoUrl: string;
  orden: number;
}

const DB_NOMBRE = 'portafolio-db';
const STORE = 'proyectos';

function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NOMBRE, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function conStore<T>(modo: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return abrirDB().then(
    (db) =>
      new Promise<T>((res, rej) => {
        const req = fn(db.transaction(STORE, modo).objectStore(STORE));
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      }),
  );
}

const listar = (): Promise<Proyecto[]> =>
  conStore<Proyecto[]>('readonly', (s) => s.getAll() as IDBRequest<Proyecto[]>).then((a) =>
    a.sort((x, y) => x.orden - y.orden),
  );

const guardar = (p: Proyecto): Promise<unknown> =>
  conStore('readwrite', (s) => s.put(p));

const borrar = (id: string): Promise<unknown> =>
  conStore('readwrite', (s) => s.delete(id));

// ---------- utilidades ----------

const uid = (): string =>
  typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now() + Math.random());

function esc(s: string): string {
  const mapa: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return s.replace(/[&<>"']/g, (c) => mapa[c]);
}

async function comprimirImagen(file: File, maxLado = 1400, calidad = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', calidad);
}

function incrustarVideo(url: string): string {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${yt[1]}" title="Video" allowfullscreen loading="lazy"></iframe></div>`;
  const vim = url.match(/vimeo\.com\/(\d+)/);
  if (vim) return `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${vim[1]}" title="Video" allowfullscreen loading="lazy"></iframe></div>`;
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return `<video class="tarjeta__video" src="${esc(url)}" controls></video>`;
  return `<a class="tarjeta__enlace" href="${esc(url)}" target="_blank" rel="noopener">Ver video ↗</a>`;
}

// ---------- render ----------

function tarjeta(p: Proyecto): string {
  const imgs = p.imagenes
    .map((src, i) => `<img src="${src}" alt="${esc(p.titulo)} — imagen ${i + 1}" loading="lazy" />`)
    .join('');
  const media =
    p.imagenes.length || p.videoUrl
      ? `<div class="tarjeta__media">${imgs}${p.videoUrl ? incrustarVideo(p.videoUrl) : ''}</div>`
      : '';
  const repo = p.repo
    ? `<a class="tarjeta__repo" href="${esc(p.repo)}" target="_blank" rel="noopener">GitHub ↗</a>`
    : '';
  const acciones = EDITABLE
    ? `<div class="tarjeta__acciones"><button data-editar="${p.id}" type="button">Editar</button><button data-borrar="${p.id}" type="button">Eliminar</button></div>`
    : '';
  return `<article class="tarjeta">
    ${media}
    <div class="tarjeta__cuerpo">
      <h3 class="tarjeta__titulo">${esc(p.titulo || 'Sin título')}</h3>
      ${p.descripcion ? `<p class="tarjeta__desc">${esc(p.descripcion)}</p>` : ''}
      ${repo}
    </div>
    ${acciones}
  </article>`;
}

async function render(): Promise<void> {
  const lista = document.getElementById('proyectos-lista');
  if (!lista) return;
  const proyectos = await listar();

  if (proyectos.length === 0) {
    lista.innerHTML = `<p class="proyectos__vacio">Aún no hay proyectos.${
      EDITABLE ? ' Usa “Agregar proyecto” para publicar el primero.' : ''
    }</p>`;
    return;
  }

  lista.innerHTML = proyectos.map(tarjeta).join('');

  if (EDITABLE) {
    lista.querySelectorAll<HTMLButtonElement>('[data-editar]').forEach((b) => {
      b.addEventListener('click', async () => {
        const todos = await listar();
        const p = todos.find((x) => x.id === b.dataset.editar);
        if (p) abrirFormulario(p);
      });
    });
    lista.querySelectorAll<HTMLButtonElement>('[data-borrar]').forEach((b) => {
      b.addEventListener('click', async () => {
        if (confirm('¿Eliminar este proyecto? No se puede deshacer.')) {
          await borrar(b.dataset.borrar!);
          render();
        }
      });
    });
  }
}

// ---------- formulario de edición ----------

function abrirFormulario(existente?: Proyecto): void {
  let imagenes = existente ? [...existente.imagenes] : [];

  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = `
    <div class="modal__panel" role="dialog" aria-modal="true" aria-label="Editar proyecto">
      <h3 class="modal__title">${existente ? 'Editar proyecto' : 'Nuevo proyecto'}</h3>
      <label class="campo"><span>Título</span><input id="f-titulo" type="text" placeholder="Nombre del proyecto" /></label>
      <label class="campo"><span>Repositorio de GitHub</span><input id="f-repo" type="url" placeholder="https://github.com/usuario/repo" /></label>
      <label class="campo"><span>Descripción</span><textarea id="f-desc" rows="4" placeholder="¿Qué hace? ¿Qué tecnologías usa?"></textarea></label>
      <label class="campo"><span>Video (enlace de YouTube, Vimeo o .mp4) — opcional</span><input id="f-video" type="url" placeholder="https://youtu.be/…" /></label>
      <div class="campo"><span>Imágenes</span><input id="f-img" type="file" accept="image/*" multiple /><div class="miniaturas" id="f-miniaturas"></div></div>
      <div class="modal__acciones">
        <button class="btn btn--ghost" id="f-cancelar" type="button">Cancelar</button>
        <button class="btn" id="f-guardar" type="button">Guardar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const $ = <T extends HTMLElement>(id: string): T => overlay.querySelector<T>('#' + id)!;
  const titulo = $<HTMLInputElement>('f-titulo');
  const repo = $<HTMLInputElement>('f-repo');
  const desc = $<HTMLTextAreaElement>('f-desc');
  const video = $<HTMLInputElement>('f-video');
  const inputImg = $<HTMLInputElement>('f-img');
  const miniaturas = $<HTMLDivElement>('f-miniaturas');

  if (existente) {
    titulo.value = existente.titulo;
    repo.value = existente.repo;
    desc.value = existente.descripcion;
    video.value = existente.videoUrl;
  }

  function pintarMiniaturas(): void {
    miniaturas.innerHTML = imagenes
      .map((src, i) => `<span class="miniatura"><img src="${src}" alt="" /><button type="button" data-quitar="${i}" aria-label="Quitar imagen">×</button></span>`)
      .join('');
    miniaturas.querySelectorAll<HTMLButtonElement>('[data-quitar]').forEach((b) => {
      b.addEventListener('click', () => {
        imagenes.splice(Number(b.dataset.quitar), 1);
        pintarMiniaturas();
      });
    });
  }
  pintarMiniaturas();

  inputImg.addEventListener('change', async () => {
    const files = Array.from(inputImg.files ?? []);
    for (const f of files) imagenes.push(await comprimirImagen(f));
    inputImg.value = '';
    pintarMiniaturas();
  });

  const cerrar = (): void => overlay.remove();
  $<HTMLButtonElement>('f-cancelar').addEventListener('click', cerrar);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cerrar();
  });

  $<HTMLButtonElement>('f-guardar').addEventListener('click', async () => {
    if (!titulo.value.trim()) {
      titulo.focus();
      return;
    }
    const p: Proyecto = {
      id: existente?.id ?? uid(),
      titulo: titulo.value.trim(),
      repo: repo.value.trim(),
      descripcion: desc.value.trim(),
      imagenes,
      videoUrl: video.value.trim(),
      orden: existente?.orden ?? Date.now(),
    };
    await guardar(p);
    cerrar();
    render();
  });
}

// ---------- exportar (para dejarlo fijo al desplegar) ----------

async function exportar(): Promise<void> {
  const datos = await listar();
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'proyectos.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- init ----------

export function initProyectos(): void {
  render();
  if (!EDITABLE) return;

  const admin = document.getElementById('proyectos-admin');
  admin?.removeAttribute('hidden');
  document.getElementById('btn-agregar')?.addEventListener('click', () => abrirFormulario());
  document.getElementById('btn-exportar')?.addEventListener('click', () => exportar());
}
