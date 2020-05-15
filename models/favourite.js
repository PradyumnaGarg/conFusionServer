const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    Dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dishes"
    }]
},
{
  timestamps : true 
});

var Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;