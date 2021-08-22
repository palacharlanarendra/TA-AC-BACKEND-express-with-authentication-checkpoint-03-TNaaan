var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Income = require('../models/incomeModel');
var Expense = require('../models/expenseModel');
var parse = require('url-parse');
router.get('/', function (req, res, next) {
  var body = req.body;
  var url = parse(req.url, true);
  var category = url.query.name;
  var allCategories = [];
  Income.find({}, (err, events) => {
    events.filter((event) => {
      // console.log(event);
      var some = event.source.split(',');
      for (var i = 0; i < some.length; i++) {
        if (!allCategories.includes(some[i])) {
          allCategories.push(some[i]);
        }
      }
    });
  });
  Expense.find({}, (err, events) => {
    events.filter((event) => {
      // console.log(event);
      var some = event.category.split(',');
      for (var i = 0; i < some.length; i++) {
        if (!allCategories.includes(some[i])) {
          allCategories.push(some[i]);
        }
      }
    });
  });
  Income.find({ source: category }, (err, income) => {
    Expense.find({ category: category }, (err, expense) => {
      res.render('success', { income, expense, allCategories });
    });
  });
});
router.post('/dateSort', function (req, res, next) {
  var body = req.body;
  var allCategories = [];
  Income.find({}, (err, events) => {
    events.filter((event) => {
      // console.log(event);
      var some = event.source.split(',');
      for (var i = 0; i < some.length; i++) {
        if (!allCategories.includes(some[i])) {
          allCategories.push(some[i]);
        }
      }
    });
  });
  Expense.find({}, (err, events) => {
    events.filter((event) => {
      // console.log(event);
      var some = event.category.split(',');
      for (var i = 0; i < some.length; i++) {
        if (!allCategories.includes(some[i])) {
          allCategories.push(some[i]);
        }
      }
    });
  });
  Income.find(
    {
      incomeDate: {
        $gte: body.start_date,
        $lte: body.end_date,
      },
    },
    (err, income) => {
      Expense.find(
        {
          expenseDate: {
            $gte: body.start_date,
            $lt: body.end_date,
          },
        },
        (err, expense) => {
          res.render('success', {
            income,
            expense,
            allCategories: allCategories,
          });
        }
      );
    }
  );
});
router.post('/bothSort', function (req, res, next) {
  var body = req.body;
  var categoryName = body.category;

  var allCategories = [];

  Income.find({}, (err, events) => {
    events.filter((event) => {
      // console.log(event);
      var some = event.source.split(',');
      for (var i = 0; i < some.length; i++) {
        if (!allCategories.includes(some[i])) {
          allCategories.push(some[i]);
        }
      }
    });
  });
  Expense.find({}, (err, events) => {
    events.filter((event) => {
      // console.log(event);
      var some = event.category.split(',');
      for (var i = 0; i < some.length; i++) {
        if (!allCategories.includes(some[i])) {
          allCategories.push(some[i]);
        }
      }
    });
  });
  Income.find(
    {
      incomeDate: {
        $gte: body.start_date,
        $lte: body.end_date,
      },
      source: categoryName,
    },
    (err, income) => {
      Expense.find(
        {
          expenseDate: {
            $gte: body.start_date,
            $lte: body.end_date,
          },
          category: categoryName,
        },
        (err, expense) => {
          res.render('success', {
            income,
            expense,
            allCategories: allCategories,
          });
        }
      );
    }
  );
});

module.exports = router;
