const { Region, RegionSchema } = require('./region.model');
const { Continente, ContinenteSchema } = require('./continente.model');
const { TipoDonante, TipoDonanteSchema } = require('./tipo_donante.model');
const { TipoEmpleado, TipoEmpleadoSchema } = require('./tipo_empleado.model');
const { TipoOrganizacion, TipoOrganizacionSchema } = require('./tipo_organizacion.model');
const { TipoDonacion, TipoDonacionSchema } = require('./tipo_donacion.model');
const { ItemDonacion, ItemDonacionSchema } = require('./item_donacion.model');
const { Provincia, ProvinciaSchema } = require('./provincia.model');
const { Pais, PaisSchema } = require('./pais.model');
const { Organizacion, OrganizacionSchema } = require('./organizacion.model');
const { Empleado, EmpleadoSchema } = require('./empleado.model');
const { Canton, CantonSchema } = require('./canton.model');
const { Ciudad, CiudadSchema } = require('./ciudad.model');
const { Parroquia, ParroquiaSchema } = require('./parroquia.model');
const { DonanteNacional, DonanteNacionalSchema } = require('./donante_nacional.model');
const { DonanteInternacional, DonanteInternacionalSchema } = require('./donante_internacional.model');
const { DonacionNacional, DonacionNacionalSchema } = require('./donacion_nacional.model');
const { DonacionInternacional, DonacionInternacionalSchema } = require('./donacion_internacional.model');
const { DetalleDonacion, DetalleDonacionSchema } = require('./detalle_donacion.model');
const { DocumentoDonacion, DocumentoDonacionSchema } = require('./documento_donacion.model');
const { VerificacionDonacion, VerificacionDonacionSchema } = require('./verificacion_donacion.model');

function setupDonacionesModels(sequelize) {
  // ============================================
  // PASO 1: INICIALIZAR MODELOS POR NIVEL DE DEPENDENCIA
  // ============================================
  
  // NIVEL 0: Sin dependencias (tablas catalogo base)
  Region.init(RegionSchema, Region.config(sequelize));
  Continente.init(ContinenteSchema, Continente.config(sequelize));
  TipoDonante.init(TipoDonanteSchema, TipoDonante.config(sequelize));
  TipoEmpleado.init(TipoEmpleadoSchema, TipoEmpleado.config(sequelize));
  TipoOrganizacion.init(TipoOrganizacionSchema, TipoOrganizacion.config(sequelize));
  TipoDonacion.init(TipoDonacionSchema, TipoDonacion.config(sequelize));
  ItemDonacion.init(ItemDonacionSchema, ItemDonacion.config(sequelize));
  
  // NIVEL 1: Dependen de Nivel 0
  Provincia.init(ProvinciaSchema, Provincia.config(sequelize));
  Pais.init(PaisSchema, Pais.config(sequelize));
  Organizacion.init(OrganizacionSchema, Organizacion.config(sequelize));
  Empleado.init(EmpleadoSchema, Empleado.config(sequelize));
  
  // NIVEL 2: Dependen de Nivel 1
  Canton.init(CantonSchema, Canton.config(sequelize));
  Ciudad.init(CiudadSchema, Ciudad.config(sequelize));
  
  // NIVEL 3: Dependen de Nivel 2
  Parroquia.init(ParroquiaSchema, Parroquia.config(sequelize));
  DonanteNacional.init(DonanteNacionalSchema, DonanteNacional.config(sequelize));
  DonanteInternacional.init(DonanteInternacionalSchema, DonanteInternacional.config(sequelize));
  
  // NIVEL 4: Dependen de Nivel 3
  DonacionNacional.init(DonacionNacionalSchema, DonacionNacional.config(sequelize));
  DonacionInternacional.init(DonacionInternacionalSchema, DonacionInternacional.config(sequelize));
  
  // NIVEL 5: Dependen de Nivel 4
  DetalleDonacion.init(DetalleDonacionSchema, DetalleDonacion.config(sequelize));
  DocumentoDonacion.init(DocumentoDonacionSchema, DocumentoDonacion.config(sequelize));
  VerificacionDonacion.init(VerificacionDonacionSchema, VerificacionDonacion.config(sequelize));

  // ============================================
  // PASO 2: CONFIGURAR ASOCIACIONES (RELACIONES)
  // ============================================
  
  // NOTA: Geo fue movido a comunidad.models (se usa con Persona)
  
  // --- GEOGRAFIA NACIONAL (Region -> Provincia -> Canton -> Parroquia) ---
  Region.associate({ Provincia, DonanteNacional });
  Provincia.associate({ Region, Canton, DonanteNacional });
  Canton.associate({ Provincia, Parroquia, DonanteNacional });
  Parroquia.associate({ Canton, DonanteNacional });

  // --- GEOGRAFIA INTERNACIONAL (Continente -> Pais -> Ciudad) ---
  Continente.associate({ Pais, DonanteInternacional });
  Pais.associate({ Continente, Ciudad, DonanteInternacional });
  Ciudad.associate({ Pais, DonanteInternacional });

  // --- CATALOGOS BASE ---
  TipoDonante.associate({ DonanteNacional, DonanteInternacional });
  TipoEmpleado.associate({ Empleado });
  TipoOrganizacion.associate({ Organizacion, DonanteNacional, DonanteInternacional });
  TipoDonacion.associate({ DonacionNacional, DonacionInternacional });
  ItemDonacion.associate({ DetalleDonacion });

  // --- ORGANIZACION Y EMPLEADO ---
  Organizacion.associate({ TipoOrganizacion, DonanteNacional, DonanteInternacional });
  Empleado.associate({ TipoEmpleado, DonacionNacional, DonacionInternacional });

  // --- DONANTES ---
  DonanteNacional.associate({
    Region,
    Provincia,
    Canton,
    Parroquia,
    TipoDonante,
    Organizacion,
    TipoOrganizacion,
    DonacionNacional
  });
  
  DonanteInternacional.associate({
    Continente,
    Pais,
    Ciudad,
    TipoDonante,
    Organizacion,
    TipoOrganizacion,
    DonacionInternacional
  });

  // --- DONACIONES ---
  DonacionNacional.associate({
    DonanteNacional,
    TipoDonacion,
    Empleado,
    DetalleDonacion,
    DocumentoDonacion,
    VerificacionDonacion
  });
  
  DonacionInternacional.associate({
    DonanteInternacional,
    TipoDonacion,
    Empleado,
    DetalleDonacion,
    DocumentoDonacion,
    VerificacionDonacion
  });

  // --- DETALLES, DOCUMENTOS Y VERIFICACION ---
  DetalleDonacion.associate({ DonacionNacional, DonacionInternacional, ItemDonacion });
  DocumentoDonacion.associate({ DonacionNacional, DonacionInternacional });
  VerificacionDonacion.associate({ DonacionNacional, DonacionInternacional });
}

module.exports = setupDonacionesModels;
