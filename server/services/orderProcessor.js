const cron = require('node-cron');
const { Order, Product, sequelize } = require('../src/models');
const { Op } = require('sequelize');

const processOrders = async () => {
  console.log(
    `[Cron Job] Running order processing check at ${new Date().toISOString()}`
  );

  const t = await sequelize.transaction();

  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const ordersToShip = await Order.findAll({
      where: {
        status: 'paid',
        updatedAt: { [Op.lt]: fiveMinutesAgo },
      },
      transaction: t,
    });

    if (ordersToShip.length > 0) {
      const orderIdsToShip = ordersToShip.map((o) => o.id);
      console.log(
        `[Cron Job] Found ${orderIdsToShip.length} orders to ship:`,
        orderIdsToShip
      );
      await Order.update(
        { status: 'shipped' },
        { where: { id: { [Op.in]: orderIdsToShip } }, transaction: t }
      );
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const ordersToDeliver = await Order.findAll({
      where: {
        status: 'shipped',
        updatedAt: { [Op.lt]: tenMinutesAgo },
      },
      transaction: t,
    });

    if (ordersToDeliver.length > 0) {
      const orderIdsToDeliver = ordersToDeliver.map((o) => o.id);
      console.log(
        `[Cron Job] Found ${orderIdsToDeliver.length} orders to deliver:`,
        orderIdsToDeliver
      );
      await Order.update(
        { status: 'delivered' },
        { where: { id: { [Op.in]: orderIdsToDeliver } }, transaction: t }
      );
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error('[Cron Job] Error processing orders:', error.message);
  }
};

const startOrderProcessingJob = () => {
  cron.schedule('*/1 * * * *', processOrders);

  console.log(' Order processing background job scheduled.');
};

module.exports = { startOrderProcessingJob };
