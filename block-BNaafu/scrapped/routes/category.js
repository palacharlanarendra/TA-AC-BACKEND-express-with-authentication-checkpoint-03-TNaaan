var express = require('express');
var router = express.Router();

var Income = require('../models/incomeModel');
var Expense = require('../models/expenseModel');
router.get('/:username', function (req, res, next) {
  var name = req.params.username;
  var flag = false;
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
  if (name == 'health' || name == 'insurance' || name == 'party') {
    Expense.find({ category: name }).exec((err, expense) => {
      // handle error
      if (name == 'trading' || name == 'sidehustle' || name == 'job') {
        flag = true;
        Income.find({ source: name }).exec((err, income) => {
          res.render('categoryDisplay', {
            income: events,
            expense,
            flag,
            email: events[0].userEmail,
            allCategories,
          });
        });
      }
    });
  }
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
        $lt: body.end_date,
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
            email: expense[0].userEmail,
          });
        }
      );
    }
  );
});
router.post('/bothSort', function (req, res, next) {
  var body = req.body;
  var name = body.category;
  console.log(name);
  var flag = false;
  var allCategories = [];
  Income.find(
    {
      incomeDate: {
        $gte: body.start_date,
        $lt: body.end_date,
      },
      source: name,
    },
    (err, events) => {
      events.filter((event) => {
        console.log(event);
        var some = event.source.split(',');
        for (var i = 0; i < some.length; i++) {
          if (!allCategories.includes(some[i])) {
            allCategories.push(some[i]);
          }
        }
      });
    }
  );
  Expense.find(
    {
      expenseDate: {
        $gte: body.start_date,
        $lt: body.end_date,
      },
      category: name,
    },
    (err, events) => {
      events.filter((event) => {
        console.log(event);
        var some = event.category.split(',');
        for (var i = 0; i < some.length; i++) {
          if (!allCategories.includes(some[i])) {
            allCategories.push(some[i]);
          }
        }
      });
    }
  );
  // incomeArray.find(
  //   {
  //     incomeDate: {
  //       $gte: body.start_date,
  //       $lt: body.end_date,
  //     },
  //   },
  //   (err, income) => {
  //     expenseArray.find(
  //       {
  //         expenseDate: {
  //           $gte: body.start_date,
  //           $lt: body.end_date,
  //         },
  //       },
  //       (err, expense) => {
  //         if (name == 'health' || name == 'insurance' || name == 'party') {
  //           Expense.find({ category: name }).exec((err, events) => {
  //             console.log(events);
  //             res.render('bothDisplay', {
  //               expense: events,
  //               flag,
  //             });
  //           });
  //         }
  //         if (name == 'trading' || name == 'sidehustle' || name == 'job') {
  //           flag = true;
  //           Income.find({ source: name }).exec((err, events) => {
  //             console.log('hey', events);
  //             res.render('bothDisplay', {
  //               income,
  //               expense,
  //               allCategories: allCategories,
  //             });
  //           });
  //         }
  //       }
  //     );
  //   }
  // );
});
module.exports = router;
