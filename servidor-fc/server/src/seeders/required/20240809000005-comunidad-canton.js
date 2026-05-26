'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [provincias] = await queryInterface.sequelize.query(
      'SELECT id_provincia, nombre FROM fcc_historiaclinica.provincia'
    );

    const findProvinciaId = (name) => {
      const provincia = provincias.find(p => p.nombre === name);
      return provincia ? provincia.id_provincia : null;
    };

    const cantones = [
      // AZUAY
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'CUENCA'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'GIRÓN'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'GUALACEO'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'NABÓN'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'PAUTE'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'PUCARA'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'SAN FERNANDO'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'SANTA ISABEL'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'SIGSIG'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'OÑA'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'CHORDELEG'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'EL PAN'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'SEVILLA DE ORO'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'GUACHAPALA'  },
      { id_provincia: findProvinciaId('AZUAY'), nombre: 'CAMILO PONCE ENRÍQUEZ'  },
      // BOLIVAR
      { id_provincia: findProvinciaId('BOLIVAR'), nombre: 'GUARANDA'  },
      { id_provincia: findProvinciaId('BOLIVAR'), nombre: 'CHILLANES'  },
      { id_provincia: findProvinciaId('BOLIVAR'), nombre: 'CHIMBO'  },
      { id_provincia: findProvinciaId('BOLIVAR'), nombre: 'ECHEANDÍA'  },
      { id_provincia: findProvinciaId('BOLIVAR'), nombre: 'SAN MIGUEL'  },
      { id_provincia: findProvinciaId('BOLIVAR'), nombre: 'CALUMA'  },
      { id_provincia: findProvinciaId('BOLIVAR'), nombre: 'LAS NAVES'  },
      // CAÑAR
      { id_provincia: findProvinciaId('CAÑAR'), nombre: 'AZOGUES'  },
      { id_provincia: findProvinciaId('CAÑAR'), nombre: 'BIBLIÁN'  },
      { id_provincia: findProvinciaId('CAÑAR'), nombre: 'CAÑAR'  },
      { id_provincia: findProvinciaId('CAÑAR'), nombre: 'LA TRONCAL'  },
      { id_provincia: findProvinciaId('CAÑAR'), nombre: 'EL TAMBO'  },
      { id_provincia: findProvinciaId('CAÑAR'), nombre: 'DÉLEG'  },
      { id_provincia: findProvinciaId('CAÑAR'), nombre: 'SUSCAL'  },
    ];

    const validCantones = cantones.filter(c => c.id_provincia !== null);

    if (validCantones.length > 0) {
      await queryInterface.bulkInsert({tableName: 'canton', schema: 'fcc_historiaclinica' }, validCantones, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({tableName: 'canton', schema: 'fcc_historiaclinica' }, null, {});
  }
};