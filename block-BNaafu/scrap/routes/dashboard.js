var express = require('express');
var router = express.Router();
var Income = require('../models/incomeModel');
var Expense = require('../models/expenseModel');
router.get('/', (req, res, next) => {
  res.render('success');
});
router.post('/income/:email', (req, res, next) => {
  let email = req.params.email;
  console.log(email);
  req.body.userEmail = email;
  console.log('enter1');
  Income.create(req.body, (err, income) => {
    console.log('enter2');
    if (err) return next(err);
    res.redirect(`/users/loginSuccess/${email}`);
  });
});
router.post('/expense/:email', (req, res, next) => {
  let email = req.params.email;
  console.log(email);
  req.body.userEmail = email;
  Expense.create(req.body, (err, expense) => {
    console.log(expense);
    if (err) return next(err);
    res.redirect(`/users/loginSuccess/${email}`);
  });
});

module.exports = router;
