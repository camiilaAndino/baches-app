import type { Denuncia } from '@/constants/denuncias';

export const MOCK_DENUNCIAS: Denuncia[] = [
  {
    id: '1042',
    titulo: 'Bache profundo sobre la calzada',
    tipo: 'bache',
    estado: 'proceso',
    fecha: '08 sep 2026',
    direccion: 'Av. Mariscal López c/ Brasilia',
    descripcion:
      'Bache de gran tamaño que dificulta el paso de vehículos, ya provocó daños en dos autos.',
    fotos: 3,
    comentarios: [
      {
        id: 'c1',
        autor: 'Municipalidad',
        mensaje: 'Cuadrilla asignada, trabajos previstos para esta semana.',
        fecha: '09 sep',
        esOficial: true,
      },
    ],
  },
  {
    id: '1039',
    titulo: 'Luminaria apagada hace una semana',
    tipo: 'alumbrado',
    estado: 'revision',
    fecha: '05 sep 2026',
    direccion: 'Calle Ykua Marangatu esq. Concordia',
    descripcion: 'La luminaria de la esquina no enciende desde hace más de una semana.',
    anonima: true,
    fotos: 1,
    comentarios: [],
  },
  {
    id: '1031',
    titulo: 'Acumulación de basura en plaza',
    tipo: 'basura',
    estado: 'pendiente',
    fecha: '02 sep 2026',
    direccion: 'Plaza Uruguaya',
    descripcion: 'Bolsas de basura acumuladas hace días, generando malos olores.',
    fotos: 2,
    comentarios: [],
  },
  {
    id: '1018',
    titulo: 'Pérdida de agua en la vereda',
    tipo: 'agua',
    estado: 'resuelta',
    fecha: '20 ago 2026',
    direccion: 'Av. España c/ Perú',
    descripcion: 'Caño roto con pérdida constante de agua sobre la vereda.',
    fotos: 2,
    comentarios: [
      {
        id: 'c2',
        autor: 'ESSAP',
        mensaje: 'Reparación finalizada, gracias por el aviso.',
        fecha: '25 ago',
        esOficial: true,
      },
      {
        id: 'c3',
        autor: 'Vos',
        mensaje: 'Confirmo que ya no hay pérdida, gracias.',
        fecha: '26 ago',
      },
    ],
    calificacion: 4,
  },
];
