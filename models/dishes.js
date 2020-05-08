const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
},{
        timestamps: true
});
const dishSchema = new Schema({
    name: {
        type : String,
        required : true,
        unique : true
    },
    description : {
        type : String,
        required : true
    },
    label : {
        type : String,
        default : ''
    },
    featured : { 
        type : Boolean,
        default: false
        
    },
    image: {
        type : String,
        required : true
    },
    price : {
        type: Currency,
        required: true,
        min: 0
    },
    comments: [ commentSchema ]
},{
  timestamps : true  
});

var Dishes = mongoose.model('Dishes', dishSchema);

module.exports = Dishes;