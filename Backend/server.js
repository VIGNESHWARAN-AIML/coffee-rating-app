const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

const DB = path.join(__dirname, "database.json");

app.use(cors());
app.use(express.json());


// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "..", "Frontend")
    )
);


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "..",
            "Frontend",
            "index.html"
        )
    );
});


// ==========================================
// DATABASE
// ==========================================

function readDB() {
    try {
        return JSON.parse(
            fs.readFileSync(DB, "utf8")
        );
    } catch (error) {
        console.error(
            "Database read error:",
            error
        );

        return {
            coffees: [],
            reviews: []
        };
    }
}


function writeDB(data) {
    try {
        fs.writeFileSync(
            DB,
            JSON.stringify(data, null, 2)
        );
    } catch (error) {
        console.error(
            "Database write error:",
            error
        );
    }
}


// ==========================================
// GET COFFEES
// ==========================================

app.get("/api/coffees", (req, res) => {

    const db = readDB();

    res.json(
        db.coffees || []
    );
});


// ==========================================
// GET REVIEWS
// ==========================================

app.get("/api/reviews", (req, res) => {

    const db = readDB();

    res.json(
        db.reviews || []
    );
});


// ==========================================
// GET STATS
// ==========================================

app.get("/api/stats", (req, res) => {

    const db = readDB();

    const reviews =
        db.reviews || [];

    const coffees =
        db.coffees || [];

    const average =
        reviews.length > 0
            ? reviews.reduce(
                (sum, review) =>
                    sum +
                    Number(
                        review.rating || 0
                    ),
                0
            ) / reviews.length
            : 0;

    res.json({
        average:
            Number(
                average.toFixed(1)
            ),

        reviews:
            reviews.length,

        coffees:
            coffees.length
    });
});


// ==========================================
// ADD REVIEW
// ==========================================

app.post("/api/reviews", (req, res) => {

    const db = readDB();

    const review = {

        id: Date.now(),

        name:
            req.body.name ||
            "Anonymous",

        coffeeName:
            req.body.coffeeName ||
            "Coffee",

        type:
            req.body.type ||
            "Coffee",

        rating:
            Number(
                req.body.rating
            ) || 0,

        taste:
            Number(
                req.body.taste
            ) || 0,

        aroma:
            Number(
                req.body.aroma
            ) || 0,

        presentation:
            Number(
                req.body.presentation
            ) || 0,

        comment:
            req.body.comment ||
            "",

        date:
            new Date().toLocaleDateString(
                "en-IN"
            )
    };


    if (!db.reviews) {
        db.reviews = [];
    }


    db.reviews.unshift(
        review
    );


    writeDB(db);


    res.status(201).json(
        review
    );
});


// ==========================================
// DELETE REVIEW
// ==========================================

app.delete(
    "/api/reviews/:id",
    (req, res) => {

        const db = readDB();

        const reviewId =
            Number(
                req.params.id
            );

        const oldLength =
            db.reviews.length;

        db.reviews =
            db.reviews.filter(
                review =>
                    review.id !==
                    reviewId
            );

        writeDB(db);

        res.json({

            success: true,

            deleted:
                db.reviews.length <
                oldLength

        });
    }
);


// ==========================================
// API 404
// ==========================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            error:
                "API endpoint not found"

        });
    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `☕ Brewlog server running on port ${PORT}`
        );

    }
);