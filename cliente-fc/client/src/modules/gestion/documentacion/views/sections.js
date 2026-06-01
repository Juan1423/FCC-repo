import ArticleIcon from '@mui/icons-material/Article';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import InsightsIcon from '@mui/icons-material/Insights';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SchemaIcon from '@mui/icons-material/Schema';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import DocumentoList from '../components/DocumentoList';
import TipoDocumentoList from '../components/TipoDocumentoList';
import IndicadorList from '../components/IndicadorList';
import TipoIndicadorList from '../components/TipoIndicadorList';
import InstitucionList from '../components/InstitucionList';
import TipoInstitucionList from '../components/TipoInstitucionList';
import ModuloList from '../components/ModuloList';
import ProcesoList from '../components/ProcesoList';
import TipoProcesoList from '../components/TipoProcesoList';

export const OVERVIEW_ID = 'overview';

export const sections = [
  {
    id: 'documentos',
    index: '01',
    title: 'Documentos',
    singular: 'Documento',
    kicker: 'Biblioteca central',
    description: 'Repositorio principal de documentos clínicos, administrativos y operativos. Cada ficha conserva versión, responsable y trazabilidad.',
    icon: ArticleIcon,
    component: DocumentoList,
  },
  {
    id: 'tipos-documento',
    index: '02',
    title: 'Tipos de Documento',
    singular: 'Tipo de documento',
    kicker: 'Taxonomía',
    description: 'Categorías que clasifican los documentos y dan coherencia a los flujos de archivo y consulta.',
    icon: AutoStoriesIcon,
    component: TipoDocumentoList,
  },
  {
    id: 'indicadores',
    index: '03',
    title: 'Indicadores',
    singular: 'Indicador',
    kicker: 'Métricas y resultados',
    description: 'Indicadores estratégicos y operativos con fórmula, periodicidad y valor calculado para el seguimiento del plan.',
    icon: QueryStatsIcon,
    component: IndicadorList,
  },
  {
    id: 'tipos-indicador',
    index: '04',
    title: 'Tipos de Indicador',
    singular: 'Tipo de indicador',
    kicker: 'Taxonomía',
    description: 'Agrupadores que diferencian un indicador de gestión, de impacto, de proceso o de resultado.',
    icon: InsightsIcon,
    component: TipoIndicadorList,
  },
  {
    id: 'instituciones',
    index: '05',
    title: 'Instituciones',
    singular: 'Institución',
    kicker: 'Cartera de aliados',
    description: 'Organizaciones, entidades y aliados estratégicos vinculados a la operación. Datos de contacto y representación.',
    icon: ApartmentIcon,
    component: InstitucionList,
  },
  {
    id: 'tipos-institucion',
    index: '06',
    title: 'Tipos de Institución',
    singular: 'Tipo de institución',
    kicker: 'Taxonomía',
    description: 'Clasificación de las instituciones según su naturaleza: pública, privada, ONG, academia u otra.',
    icon: CorporateFareIcon,
    component: TipoInstitucionList,
  },
  {
    id: 'modulos',
    index: '07',
    title: 'Módulos',
    singular: 'Módulo',
    kicker: 'Estructura del sistema',
    description: 'Unidades funcionales que organizan la plataforma. Cada módulo agrupa procesos y documentación relacionada.',
    icon: WidgetsIcon,
    component: ModuloList,
  },
  {
    id: 'procesos',
    index: '08',
    title: 'Procesos',
    singular: 'Proceso',
    kicker: 'Operación documentada',
    description: 'Catálogo de procesos institucionales con responsable, nivel, jerarquía y estado de formalización.',
    icon: AccountTreeIcon,
    component: ProcesoList,
  },
  {
    id: 'tipos-proceso',
    index: '09',
    title: 'Tipos de Proceso',
    singular: 'Tipo de proceso',
    kicker: 'Taxonomía',
    description: 'Tipologías que diferencian los procesos estratégicos, misionales, de apoyo y de evaluación.',
    icon: SchemaIcon,
    component: TipoProcesoList,
  },
];

export const sectionsById = sections.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {});

export const overviewMeta = {
  id: OVERVIEW_ID,
  index: '00',
  title: 'Panorama',
  kicker: 'Vista general',
  description: 'Una mirada al módulo de documentación. Selecciona una sección para entrar al detalle o explora el índice completo desde aquí.',
  icon: GridViewRoundedIcon,
};

export const allItems = [overviewMeta, ...sections];
