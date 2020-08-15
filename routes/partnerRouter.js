const express = require("express");
const bodyParser = require("body-parser");
const partner = require("../models/partner");

const partnerRouter = express.Router();

partnerRouter.use(bodyParser.json());

partnerRouter
    .route("/")
    .get((req, res, next) => {
        Partner.find()
            .then((partners) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(partners);
            })
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        //to create a new Campstite document
        Partner.create(req.body)
            .then((partner) => {
                console.log("Partner Created ", partner);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(partner);
            })
            .catch((err) => next(err));
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /partners");
    })
    .delete((req, res, next) => {
        Partner.deleteMany()
            .then((response) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(response);
            })
            .catch((err) => next(err));
    });

partnerRouter
    .route("/:partnerId")
    .get((req, res, next) => {
        //gets parsed from the http request of the user
        Partner.findById(req.params.partnerId)
            .then((partner) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(partner);
            })
            .catch((err) => next(err));
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(
            `POST operation not supported on /partners/${req.params.partnerId}`
        );
    })
    .put((req, res, next) => {
        Partner.findByIdAndUpdate(
            req.params.partnerId,
            {
                $set: req.body,
            },
            { new: true }
        )
            .then((partner) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(partner);
            })
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Partner.findByIdAndDelete(req.params.partnerId)
            .then((response) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(response);
            })
            .catch((err) => next(err));
    });

partnerRouter
    .route("/:partnerId/comments")
    .get((req, res, next) => {
        //looking for a single comment id, not all
        Partner.findById(req.params.partnerId)
            .then((partner) => {
                if (partner) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(partner.comments);
                } else {
                    err = new Error(
                        `Partner ${req.params.partnerId} not found`
                    );
                    err.status = 404;
                    return next(err);
                }
            })
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then((partner) => {
                if (partner) {
                    //assuming that the req.body has a comment inside it
                    partner.comments.push(req.body);
                    partner
                        .save()
                        .then((partner) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(partner);
                        })
                        .catch((err) => next(err));
                } else {
                    err = new Error(
                        `Partner ${req.params.partnerId} not found`
                    );
                    err.status = 404;
                    return next(err);
                }
            })
            .catch((err) => next(err));
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end(
            `PUT operation not supported on /partners/${req.params.partnerId}/comments`
        );
    })
    .delete((req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then((partner) => {
                if (partner) {
                    //deleting every comment from the partner id
                    for (let i = partner.comments.length - 1; i >= 0; i--) {
                        //.id() method for a unique id
                        partner.comments.id(partner.comments[i]._id).remove();
                    }
                    partner
                        .save()
                        .then((partner) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(partner);
                        })
                        .catch((err) => next(err));
                } else {
                    err = new Error(
                        `Partner ${req.params.partnerId} not found`
                    );
                    err.status = 404;
                    return next(err);
                }
            })
            .catch((err) => next(err));
    });

partnerRouter
    //to handle requests for a specific comment for a specific partner
    .route("/:partnerId/comments/:commentId")
    .get((req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then((partner) => {
                if (partner && partner.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(partner.comments.id(req.params.commentId));
                } else if (!partner) {
                    //if partner not found
                    err = new Error(
                        `Partner ${req.params.partnerId} not found`
                    );
                    err.status = 404;
                    return next(err);
                } else {
                    //if partner found but not the unique comment
                    err = new Error(
                        `Comment ${req.params.commentId} not found`
                    );
                    err.status = 404;
                    return next(err);
                }
            })
            .catch((err) => next(err));
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(
            `POST operation not supported on /partners/${req.params.partnerId}/comments/${req.params.commentId}`
        );
    })
    .put((req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then((partner) => {
                if (partner && partner.comments.id(req.params.commentId)) {
                    if (req.body.rating) {
                        //to update rating
                        partner.comments.id(req.params.commentId).rating =
                            req.body.rating;
                    }
                    if (req.body.text) {
                        //to update comment text
                        partner.comments.id(req.params.commentId).text =
                            req.body.text;
                    }
                    partner
                        .save()
                        .then((partner) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(partner);
                        })
                        .catch((err) => next(err));
                } else if (!partner) {
                    err = new Error(
                        `Partner ${req.params.partnerId} not found`
                    );
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(
                        `Comment ${req.params.commentId} not found`
                    );
                    err.status = 404;
                    return next(err);
                }
            })
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then((partner) => {
                if (partner && partner.comments.id(req.params.commentId)) {
                    //to remove a comment
                    partner.comments.id(req.params.commentId).remove();
                    partner
                        .save()
                        .then((partner) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(partner);
                        })
                        .catch((err) => next(err));
                } else if (!partner) {
                    err = new Error(
                        `Partner ${req.params.partnerId} not found`
                    );
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(
                        `Comment ${req.params.commentId} not found`
                    );
                    err.status = 404;
                    return next(err);
                }
            })
            .catch((err) => next(err));
    });

module.exports = partnerRouter;
