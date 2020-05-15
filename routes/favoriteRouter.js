const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const Favorites = require("../models/favourite");
const cors = require("./cors");

const favouriteRouter = express.Router();

//Endpoint for /favorites
favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.statusCode = 200; })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
     Favorites.findOne({userId: req.user.id})
     .populate("Dishes")
     .populate("userId")
     .then((favorite) => {
         if(favorite != null) {
             res.statusCode = 200;
             res.setHeader("Content-Type", "application/json");
             res.json(favorite);
         }
         else {
             err = new Error("No favorite dishes found");
             err.statusCode = 404;
             next(err);
         }
     }, (err) => next(err))
     .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({userId: req.user.id})
    .then((favorite) => {
        var favsArray = req.body;
        // if user have a favorites list  
        if(favorite != null) {
            for(var i = 0; i<f.length; i++) {
                // if any of the given dishes already present in the favorite list, index will be other than -1
                if(favorite.Dishes.indexOf(favsArray[i]._id) == -1)
                    favorite.Dishes.push(favsArray[i]._id);
            }
            favorite.save() 
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            },(err) => next(err))
            .catch((err) => next(err));    
        }
        else {
            Favorites.create({userId: req.user.id})
            .then((favorite) => { 
                for(var i = 0; i<f.length; i++){
                    favorite.Dishes.push(favsArray[i]._id);
                }
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                })
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT opertion is not supported on /favorites")
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({userId: req.user.id})
    .then((favorite) => { 
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
    }, (err) => { next(err) })
    .catch((err) => { next(err) });
})

//End point for /favorites/:favoriteDish
favouriteRouter.route('/:favoriteDish')
.options(cors.corsWithOptions, (req, res) => { res.statusCode(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({userId: req.user.id})
    .populate("Dishes")
    .populate("userId")
    .then((favorite) => {
        if(!favorite) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            return res.json({"exists": false, "favorites": favorite});
        }
        else {
            if(favorite.Dishes.indexOf(req.params.favoriteDish) < 0) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                return res.json({"exists": false, "favorites": favorite});    
            }
            else {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                return res.json({"exists": true, "favorites": favorite});
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({userId: req.user.id})
    .then((favorite) => {
        // If user does not have any favorites
        if(favorite == null) {
            Favorites.create({userId: req.user.id})
            .then((favorite) => {
                favorite.Dishes.push(req.params.favoriteDish);
                favorite.save()
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            },(err) => next(err))
            .catch((err)=> next(err));
        }
        else {
            // if user is trying to add duplicate favorites, if dish is already present index will be other than -1
            if(favorite.Dishes.indexOf(req.params.favoriteDish) != -1) {
                err = new Error("Dish is already in the favorites, cannot add duplicates!");
                err.status = 403;
                next(err);
            }
            else {
                favorite.Dishes.push(req.params.favoriteDish);
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                },(err) => next(err))
                .catch((err) => next(err));
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT opertion is not supported on /favorites/" + req.params.favoriteDish);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({userId: req.user.id})
    .then((favorite) => {
        if(favorite != null) {
            //If the dish is present or not in the favorites list, if present then index will be greater than -1
            if(favorite.Dishes.indexOf(req.params.favoriteDish) != -1) {
                var index = favorite.Dishes.indexOf(req.params.favoriteDish);
                favorite.Dishes.splice(index, 1);
                favorite.save()
                .then((favorite) => {
                    //If we remove one by one all the favorites, the top of the dishes array will be null
                    if(favorite.Dishes[0] == null) { 
                        favorite.remove()
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.end("You have no favorites left!");
                    }
                    // If Dishes array is not empty
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
            else {
                err = new Error("Specfied favorite dish is not found in you favorite list to delete!");
                err.status = 404;
                next(err);
            }
        }
        // If the user tries to delete a specified favorite even when he/she does not have any favorites.
        else {
            err = new Error("You have no favorites available to delete!");
                err.status = 404;
                next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favouriteRouter;