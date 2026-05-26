'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Skip if region-level records already exist
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM fcc_historiaclinica.geo WHERE nivel = 'region'"
    );
    if (parseInt(existing[0]?.count || 0) > 0) return;

    // Read regions from old table
    const [regiones] = await queryInterface.sequelize.query(
      'SELECT id_region, nombre FROM fcc_historiaclinica.region ORDER BY id_region'
    );

    if (regiones.length === 0) return;

    // Insert regions into geo table
    await queryInterface.bulkInsert(
      { tableName: 'geo', schema: 'fcc_historiaclinica' },
      regiones.map(r => ({
        descripcion: r.nombre,
        nivel: 'region',
        id_padre: null,
        codigo_original: r.id_region,
      })),
      {}
    );

    // Get geo IDs for the newly inserted regions
    const [geoRegiones] = await queryInterface.sequelize.query(
      "SELECT id_geo, codigo_original FROM fcc_historiaclinica.geo WHERE nivel = 'region'"
    );

    const regionMap = {};
    for (const g of geoRegiones) {
      regionMap[g.codigo_original] = g.id_geo;
    }

    // Read provinces with their region mapping
    const [provincias] = await queryInterface.sequelize.query(
      'SELECT id_provincia, id_region FROM fcc_historiaclinica.provincia'
    );

    // Update province id_padre in geo to reference their region
    for (const p of provincias) {
      const padreId = regionMap[p.id_region];
      if (padreId) {
        await queryInterface.sequelize.query(
          `UPDATE fcc_historiaclinica.geo SET id_padre = :padreId WHERE nivel = 'provincia' AND codigo_original = :codigoOriginal`,
          { replacements: { padreId, codigoOriginal: p.id_provincia } }
        );
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      "UPDATE fcc_historiaclinica.geo SET id_padre = NULL WHERE nivel = 'provincia'"
    );
    await queryInterface.sequelize.query(
      "DELETE FROM fcc_historiaclinica.geo WHERE nivel = 'region'"
    );
  }
};
