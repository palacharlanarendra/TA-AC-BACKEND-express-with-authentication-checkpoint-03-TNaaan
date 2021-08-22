var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var incomeSchema = new Schema(
  {
    source: { type: String },
    incomeAmount: { type: Number },
    incomeDate: { type: String },
    userEmail: { type: String },
    // userId : {type : Schema.Types.ObjectId, required : true, ref : "User"}
  },
  { timestamps: true }
);

module.exports = mongoose.model('Income', incomeSchema);
