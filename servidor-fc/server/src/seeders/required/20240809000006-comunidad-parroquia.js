'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [cantones] = await queryInterface.sequelize.query(
      'SELECT id_canton, nombre FROM fcc_historiaclinica.canton'
    );

    const [cantonesConParroquias] = await queryInterface.sequelize.query(
      'SELECT DISTINCT id_canton FROM fcc_historiaclinica.parroquia WHERE id_canton IS NOT NULL'
    );
    const cantonesConParroquiasSet = new Set(cantonesConParroquias.map(c => Number(c.id_canton)));

    const parroquiasReales = [
      // CUENCA
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'BELLAVISTA'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'CAÑARIBAMBA'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'EL BATÁN'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'EL SAGRARIO'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'EL VECINO'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'GIL RAMÍREZ DÁVALOS'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'HUAYNACÁPAC'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'MACHANGARA'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'MONAY'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'SAN BLAS'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'SAN SEBASTIÁN'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'SUCRE'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'TOTORACOCHA'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'YANUNCAY'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'HERMANO MIGUEL'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'BAÑOS'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'CUMBE'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'CHAUCHA'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'CHECA (JIDCAY)'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'CHIQUINTAD'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'LLACAO'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'MOLLETURO'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'NULTI'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'OCTAVIO CORDERO PALACIOS (SANTA ROSA)'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'PACCHA'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'QUINGEO'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'RICAURTE'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'SAN JOAQUÍN'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'SANTA ANA'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'SAYAUSÍ'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'SIDCAY'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'SININCAY'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'TARQUI'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'TURI'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'VALLE'  },
      { id_canton: cantones.find(c => c.nombre === 'CUENCA')?.id_canton, nombre: 'VICTORIA DEL PORTETE (IRQUIS)'  },
      // GIRÓN
      { id_canton: cantones.find(c => c.nombre === 'GIRÓN')?.id_canton, nombre: 'GIRÓN'  },
      { id_canton: cantones.find(c => c.nombre === 'GIRÓN')?.id_canton, nombre: 'ASUNCIÓN'  },
      { id_canton: cantones.find(c => c.nombre === 'GIRÓN')?.id_canton, nombre: 'SAN GERARDO'  },
    ].filter(p => p.id_canton);

    if (parroquiasReales.length > 0) {
      await queryInterface.bulkInsert({tableName: 'parroquia', schema: 'fcc_historiaclinica' }, parroquiasReales, {});
    }

    for (const p of parroquiasReales) {
      cantonesConParroquiasSet.add(Number(p.id_canton));
    }

    const parroquiasPlaceholder = [];
    for (const canton of cantones) {
      const idCanton = Number(canton.id_canton);
      if (cantonesConParroquiasSet.has(idCanton)) continue;
      parroquiasPlaceholder.push({ id_canton: idCanton, nombre: 'CENTRO' });
      parroquiasPlaceholder.push({ id_canton: idCanton, nombre: 'NORTE' });
      parroquiasPlaceholder.push({ id_canton: idCanton, nombre: 'SUR' });
    }

    if (parroquiasPlaceholder.length > 0) {
      await queryInterface.bulkInsert({tableName: 'parroquia', schema: 'fcc_historiaclinica' }, parroquiasPlaceholder, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({tableName: 'parroquia', schema: 'fcc_historiaclinica' }, null, {});
  }
};
