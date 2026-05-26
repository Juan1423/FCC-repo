'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [cantones] = await queryInterface.sequelize.query(
      'SELECT id_canton, nombre FROM fcc_historiaclinica.canton'
    );

    const findCantonId = (name) => {
      const canton = cantones.find(c => c.nombre === name);
      return canton ? canton.id_canton : null;
    };

    const parroquias = [
      // CUENCA
      { id_canton: findCantonId('CUENCA'), nombre: 'BELLAVISTA'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'CAÑARIBAMBA'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'EL BATÁN'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'EL SAGRARIO'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'EL VECINO'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'GIL RAMÍREZ DÁVALOS'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'HUAYNACÁPAC'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'MACHANGARA'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'MONAY'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'SAN BLAS'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'SAN SEBASTIÁN'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'SUCRE'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'TOTORACOCHA'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'YANUNCAY'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'HERMANO MIGUEL'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'BAÑOS'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'CUMBE'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'CHAUCHA'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'CHECA (JIDCAY)'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'CHIQUINTAD'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'LLACAO'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'MOLLETURO'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'NULTI'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'OCTAVIO CORDERO PALACIOS (SANTA ROSA)'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'PACCHA'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'QUINGEO'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'RICAURTE'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'SAN JOAQUÍN'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'SANTA ANA'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'SAYAUSÍ'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'SIDCAY'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'SININCAY'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'TARQUI'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'TURI'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'VALLE'  },
      { id_canton: findCantonId('CUENCA'), nombre: 'VICTORIA DEL PORTETE (IRQUIS)'  },
      // GIRÓN
      { id_canton: findCantonId('GIRÓN'), nombre: 'GIRÓN'  },
      { id_canton: findCantonId('GIRÓN'), nombre: 'ASUNCIÓN'  },
      { id_canton: findCantonId('GIRÓN'), nombre: 'SAN GERARDO'  },
    ];

    const validParroquias = parroquias.filter(p => p.id_canton !== null);

    if (validParroquias.length > 0) {
      await queryInterface.bulkInsert({tableName: 'parroquia', schema: 'fcc_historiaclinica' }, validParroquias, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({tableName: 'parroquia', schema: 'fcc_historiaclinica' }, null, {});
  }
};