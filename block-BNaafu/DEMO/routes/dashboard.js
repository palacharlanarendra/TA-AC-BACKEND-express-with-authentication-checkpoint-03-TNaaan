var express = require('express');
var router = express.Router();
var Income = require('../models/expenseModel');
var Expense = require('../models/incomeModel');

router.post('/', (req, res, next) => {
  Income.create(req.body, (err, income) => {
    if (err) return next(err);
    console.log(err, income);
  });
  Expense.create(req.body, (err, expense) => {
    if (err) return next(err);
    console.log(err, expense);
  });
});

module.exports = router;
