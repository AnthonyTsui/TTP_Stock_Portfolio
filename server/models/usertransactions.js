'use strict';

module.exports = (sequelize, DataTypes) => {
  const usertransactions = sequelize.define('usertransactions', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return usertransactions;
};