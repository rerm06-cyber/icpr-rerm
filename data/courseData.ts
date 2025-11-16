import type { Course } from '../types';

// Data based on the detailed structure for AIA-101 and the full program sequential.
// AIA-101 is fully fleshed out as the primary example. Other courses have a placeholder structure.

const createPlaceholderModules = (courseCode: string): Course['modules'] => {
  const modules: Course['modules'] = [];
  for (let m = 1; m <= 3; m++) {
    const units = [];
    // Unit 1 & 2 with 2 lessons each
    for (let u = 1; u <= 2; u++) {
      const lessons = [];
      for (let l = 1; l <= 2; l++) {
        const week = (m - 1) * 5 + (u - 1) * 2 + l;
        lessons.push({
          id: `${courseCode}-M${m}-U${u}-L${l}`,
          title: `Lección ${m}.${u}.${l}`,
          week,
          objective: `Placeholder objective for lesson ${m}.${u}.${l}.`,
          keyConcepts: ['Placeholder Concept 1', 'Placeholder Concept 2'],
          tutorAvatar: { name: 'AI Guide', systemPrompt: `You are an AI Guide for ${courseCode}.`},
          preLab: {},
          resources: [],
          tasks: []
        });
      }
      units.push({ id: `${courseCode}-M${m}-U${u}`, title: `Unidad ${m}.${u}`, lessons });
    }
    // Unit 3 with 1 review lesson
    const reviewWeek = (m - 1) * 5 + 5;
    units.push({
      id: `${courseCode}-M${m}-U3`,
      title: `Unidad ${m}.3: Repaso e Integración`,
      lessons: [{
        id: `${courseCode}-M${m}-U3-L1`,
        title: `Repaso y Evaluación del Módulo ${m}`,
        week: reviewWeek,
        objective: `Consolidar y evaluar los conocimientos del Módulo ${m}.`,
        keyConcepts: ['Repaso', 'Evaluación', 'Integración'],
        tutorAvatar: { name: 'AI Evaluator', systemPrompt: `You are an AI Evaluator for ${courseCode}, focusing on reviewing Module ${m}.`},
        preLab: {},
        resources: [],
        tasks: []
      }]
    });
    modules.push({
      id: `${courseCode}-M${m}`,
      title: `Módulo ${m}: Core Concepts`,
      weeks: `${(m-1)*5 + 1}-${m*5}`,
      units
    });
  }
  return modules;
};

export const courses: Course[] = [
  // Term 1
  { code: 'ISD-100', title: 'Introducción al Desarrollo Estudiantil', description: 'Adaptación a la vida universitaria, destrezas de estudio y manejo del tiempo.', credits: 3, modules: createPlaceholderModules('ISD-100'), term: 1 },
  { code: 'ESP-103', title: 'Redacción Comercial en Español', description: 'Desarrollo de destrezas de comunicación escrita para el ámbito comercial.', credits: 3, modules: createPlaceholderModules('ESP-103'), term: 1 },
  { code: 'MAT-101', title: 'Matemática General', description: 'Fundamentos matemáticos para la toma de decisiones empresariales.', credits: 3, modules: createPlaceholderModules('MAT-101'), term: 1 },
  { code: 'MNG-201', title: 'Administración General', description: 'Principios básicos de administración: planificación, organización, dirección y control.', credits: 3, modules: createPlaceholderModules('MNG-201'), term: 1 },
  
  // Term 2
  { code: 'ACC-101', title: 'Introducción a la Contabilidad I', description: 'Principios básicos para entender estados financieros y analizar la salud económica de una empresa.', credits: 4, modules: createPlaceholderModules('ACC-101'), term: 2 },
  { code: 'ENG-106', title: 'Conversational English for Business', description: 'Intensive course in English business oral communication skills.', credits: 3, modules: createPlaceholderModules('ENG-106'), term: 2 },
  { code: 'AIA-100', title: 'Herramientas de Productividad Digital con IA', description: 'Curso introductorio al conjunto de herramientas de IA.', credits: 2, modules: createPlaceholderModules('AIA-100'), term: 2 },
  {
    code: 'AIA-101',
    title: 'Fundamentos de la Administración en la Era de la IA',
    description: 'Reinterpreta los fundamentos de la administración (Fayol, Taylor, etc.) con apoyo de IA generativa.',
    credits: 3,
    term: 2,
    modules: [
      {
        id: 'AIA-101-M1',
        title: 'Los Pilares de la Administración y su Reinterpretación con IA',
        weeks: '1-5',
        units: [
          {
            id: 'AIA-101-M1-U1',
            title: 'La Estructura del Orden: Principios de Henri Fayol',
            lessons: [
              { id: 'AIA-101-L1.1.1', week: 1, title: 'Principios de Estructura y Mando', objective: 'Proponer una estructura organizacional mejorada para una PyME, utilizando IA para visualizar un organigramma que aplique los principios de división del trabajo y unidad de mando de Fayol.', keyConcepts: ['División del trabajo', 'Unidad de mando', 'Autoridad', 'Span of control'], tutorAvatar: { name: 'Henri Fayol', systemPrompt: 'Eres Henri Fayol, un pionero de la teoría administrativa clásica. Tu misión es guiar al estudiante a entender y aplicar los principios de división del trabajo y unidad de mando en una PyME local.' }, preLab: { videoUrl: 'https://example.com/video-fayol', audioUrl: 'https://example.com/audio-fayol', presentationUrl: 'https://example.com/slides-fayol', notebookLMUrl: 'https://example.com/notebook-fayol' }, tasks: [], resources: [] },
              { id: 'AIA-101-L1.1.2', week: 2, title: 'Principios de Factor Humano y Alineación', objective: 'Redactar el borrador de una política de remuneración utilizando IA, aplicando los principios de Fayol sobre compensación justa.', keyConcepts: ['Equidad', 'Remuneración', 'Iniciativa', 'Estabilidad del personal'], tutorAvatar: { name: 'Henri Fayol (Factor Humano)', systemPrompt: 'Eres Henri Fayol, enfocándote en el factor humano. Explica cómo la compensación justa y la estabilidad del personal son cruciales para la motivación y la eficiencia.' }, preLab: { videoUrl: 'https://example.com/video-remuneration' }, tasks: [], resources: [] },
            ]
          },
          {
            id: 'AIA-101-M1-U2',
            title: 'La Ciencia de la Eficiencia: Legado de Frederick Taylor',
            lessons: [
              { id: 'AIA-101-L1.2.1', week: 3, title: 'Estudio de Tiempos y Movimientos', objective: 'Analizar un proceso administrativo mediante IA multimodal para identificar y cuantificar ineficiencias ("waste") según los principios de Taylor.', keyConcepts: ['Muda (desperdicio)', 'Tiempo de ciclo', 'Eficiencia', 'Análisis de video'], tutorAvatar: { name: 'Frederick Taylor', systemPrompt: 'Eres Frederick Winslow Taylor, padre de la gestión científica. Asistes al estudiante como un analista meticuloso y objetivo, enfocándote en la eliminación de desperdicios y la eficiencia.' }, preLab: { videoUrl: 'https://example.com/video-taylor' }, tasks: [], resources: [] },
              { id: 'AIA-101-L1.2.2', week: 4, title: 'Estandarización de Tareas', objective: 'Generar un Procedimiento Operativo Estándar (SOP) visual e interactivo para un proceso optimizado, utilizando una herramienta de IA.', keyConcepts: ['SOP', 'The one best way', 'Matriz RACI', 'Control de versiones'], tutorAvatar: { name: 'Frederick Taylor (Estandarización)', systemPrompt: 'Eres Frederick Taylor, obsesionado con encontrar la forma más eficiente de trabajar. Ayudarás al estudiante a documentar un proceso optimizado en forma de SOP. Tu estilo es directo y sistemático.' }, preLab: {}, tasks: [], resources: [] },
            ]
          },
          {
            id: 'AIA-101-M1-U3',
            title: 'Evaluación e Integración de Fundamentos Clásicos',
            lessons: [
              { id: 'AIA-101-L1.3.1', week: 5, title: 'Repaso y Evaluación Parcial del Módulo 1', objective: 'Demostrar comprensión de los principios de Fayol y Taylor y su aplicación asistida por IA.', keyConcepts: ['Repaso', 'Evaluación', 'Integración de artefactos'], tutorAvatar: { name: 'AI Evaluator', systemPrompt: 'Eres un evaluador de IA. Tu rol es verificar la comprensión del estudiante sobre los conceptos de Fayol y Taylor y su aplicación práctica.' }, preLab: {}, tasks: [], resources: [] },
            ]
          }
        ]
      },
      { id: 'AIA-101-M2', title: 'Planificación y Organización Aumentada por IA', weeks: '6-10', units: createPlaceholderModules('AIA-101-M2')[0].units },
      { id: 'AIA-101-M3', title: 'Dirección, Control y Mejora Continua con IA', weeks: '11-15', units: createPlaceholderModules('AIA-101-M3')[0].units },
    ]
  },
  
  // Term 3
  { code: 'MNG-203', title: 'Administración de Recursos Humanos', description: 'Gestión del talento humano, desde la contratación hasta la retención, y el impacto de la IA en RRHH.', credits: 3, modules: createPlaceholderModules('MNG-203'), term: 3 },
  { code: 'MNG-205', title: 'Desarrollo y Administración de Pequeñas Empresas', description: 'Visión completa sobre la creación y manejo de PyMEs en el contexto de Puerto Rico.', credits: 3, modules: createPlaceholderModules('MNG-205'), term: 3 },
  { code: 'AIA-102', title: 'Dominio de la Interacción con IA: Prompt y Context Engineering', description: 'Curso avanzado en técnicas de prompt y context engineering.', credits: 3, modules: createPlaceholderModules('AIA-102'), term: 3, prerequisites: ['AIA-100', 'AIA-101'] },
  { code: 'DMK-101', title: 'Principios de Mercadeo I', description: 'Fundamentos del mercadeo: análisis de mercado, segmentación, posicionamiento y las 4 P\'s.', credits: 3, modules: createPlaceholderModules('DMK-101'), term: 3 },

  // Term 4
  { code: 'FIN-101', title: 'Finanza Mercantil', description: 'Gestión financiera empresarial, incluyendo inversión, financiación y el uso de IA para análisis predictivo.', credits: 3, modules: createPlaceholderModules('FIN-101'), term: 4 },
  { code: 'MNG-206', title: 'Gerencia de Operaciones', description: 'Optimización de procesos de producción y entrega, desde la cadena de suministro hasta la logística.', credits: 3, modules: createPlaceholderModules('MNG-206'), term: 4 },
  { code: 'AIA-103', title: 'Marketing y Experiencia del Cliente Potenciados por IA', description: 'Aplicación de IA en marketing digital, CX, segmentación de audiencias y personalización.', credits: 3, modules: createPlaceholderModules('AIA-103'), term: 4, prerequisites: ['AIA-100', 'AIA-101', 'AIA-102'] },
  { code: 'AIA-104', title: 'Optimización de Operaciones y Finanzas con IA', description: 'Uso de IA para mejorar la eficiencia en operaciones y finanzas, pronóstico de demanda y gestión de inventarios.', credits: 3, modules: createPlaceholderModules('AIA-104'), term: 4 },

  // Term 5
  { code: 'AIA-105', title: 'Análisis de Datos y Visualización Inteligente para Gerentes', description: 'Transformar datos crudos en insights significativos y crear visualizaciones efectivas con IA.', credits: 3, modules: createPlaceholderModules('AIA-105'), term: 5, prerequisites: ['AIA-100', 'AIA-104'] },
  { code: 'AIA-106', title: 'Liderazgo y Gestión del Cambio en la Transformación Digital', description: 'Automatización de procesos empresariales mediante agentes de IA y flujos de trabajo multiagente.', credits: 3, modules: createPlaceholderModules('AIA-106'), term: 5, prerequisites: ['AIA-100', 'AIA-102'] },
  { code: 'AIA-107', title: 'Diseño de Soluciones de IA sin Código (No-Code)', description: 'Curso práctico para transformar al estudiante de "usuario" a "creador" de soluciones de IA.', credits: 3, modules: createPlaceholderModules('AIA-107'), term: 5 },
  { code: 'AIA-108', title: 'Ética, Gobernanza y Regulación de la Inteligencia Artificial', description: 'Exploración de la frontera ética, legal y de gobernanza de la IA.', credits: 3, modules: createPlaceholderModules('AIA-108'), term: 5 },

  // Term 6
  { code: 'HUM-101', title: 'Humanidades y Pensamiento Crítico', description: 'Desarrollo de pensamiento crítico, razonamiento ético y comprensión cultural en la era de la IA.', credits: 3, modules: createPlaceholderModules('HUM-101'), term: 6 },
  { code: 'AIA-109', title: 'Estrategia Empresarial con Soporte de IA', description: 'Formulación y ejecución de estrategias empresariales potenciadas por la IA.', credits: 3, modules: createPlaceholderModules('AIA-109'), term: 6, prerequisites: ['AIA-108'] },
  { code: 'AIA-110', title: 'Proyecto Integrador Capstone', description: 'Curso culminante que integra todas las competencias del programa en un proyecto real.', credits: 3, modules: createPlaceholderModules('AIA-110'), term: 6, prerequisites: ['AIA-100' , 'AIA-109'] },
  { code: 'MNG-207', title: 'Innovación y Creatividad Empresarial', description: 'Desarrollo de la capacidad de generar ideas nuevas y soluciones creativas.', credits: 3, modules: createPlaceholderModules('MNG-207'), term: 6 },
];