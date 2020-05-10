const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var passportlocalmongoose = require("passport-local-mongoose");

var UserSchema = new Schema({
    admin: {
        type: Boolean,
        default: false
    }
});

UserSchema.plugin(passportlocalmongoose);

module.exports = mongoose.model("User", UserSchema);