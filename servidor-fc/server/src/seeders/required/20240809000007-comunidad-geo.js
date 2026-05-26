'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [provincias] = await queryInterface.sequelize.query(
      'SELECT id_provincia, nombre FROM fcc_historiaclinica.provincia ORDER BY id_provincia'
    );

    const geoProvincias = [];
    for (const p of provincias) {
      geoProvincias.push({
        descripcion: p.nombre,
        nivel: 'provincia',
        id_padre: null,
        codigo_original: p.id_provincia,
      });
    }

    if (geoProvincias.length > 0) {
      await queryInterface.bulkInsert({tableName: 'geo', schema: 'fcc_historiaclinica' }, geoProvincias, {});
    }

    const [geoProvRecords] = await queryInterface.sequelize.query(
      "SELECT id_geo, codigo_original FROM fcc_historiaclinica.geo WHERE nivel = 'provincia'"
    );

    const provMap = {};
    for (const g of geoProvRecords) {
      provMap[g.codigo_original] = g.id_geo;
    }

    const [cantones] = await queryInterface.sequelize.query(
      'SELECT id_canton, nombre, id_provincia FROM fcc_historiaclinica.canton ORDER BY id_canton'
    );

    const geoCatones = [];
    for (const c of cantones) {
      const padreId = provMap[c.id_provincia];
      if (padreId) {
        geoCatones.push({
          descripcion: c.nombre,
          nivel: 'canton',
          id_padre: padreId,
          codigo_original: c.id_canton,
        });
      }
    }

    if (geoCatones.length > 0) {
      await queryInterface.bulkInsert({tableName: 'geo', schema: 'fcc_historiaclinica' }, geoCatones, {});
    }

    const [geoCantonRecords] = await queryInterface.sequelize.query(
      "SELECT id_geo, codigo_original FROM fcc_historiaclinica.geo WHERE nivel = 'canton'"
    );

    const cantonMap = {};
    for (const g of geoCantonRecords) {
      cantonMap[g.codigo_original] = g.id_geo;
    }

    const [parroquias] = await queryInterface.sequelize.query(
      'SELECT id_parroquia, nombre, id_canton FROM fcc_historiaclinica.parroquia ORDER BY id_parroquia'
    );

    const geoParroquias = [];
    for (const p of parroquias) {
      const padreId = cantonMap[p.id_canton];
      if (padreId) {
        geoParroquias.push({
          descripcion: p.nombre,
          nivel: 'parroquia',
          id_padre: padreId,
          codigo_original: p.id_parroquia,
        });
      }
    }

    if (geoParroquias.length > 0) {
      await queryInterface.bulkInsert({tableName: 'geo', schema: 'fcc_historiaclinica' }, geoParroquias, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({tableName: 'geo', schema: 'fcc_historiaclinica' }, null, {});
  }
};
