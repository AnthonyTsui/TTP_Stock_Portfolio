'use strict';

module.exports = (sequelize, DataTypes) => {
  const userstocks = sequelize.define('userstocks', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return userstocks;
};