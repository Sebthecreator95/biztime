const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();


/** GET / => list of industries. */

router.get("/", async function (req, res, next) {
    try {
        const result = await db.query(
            `SELECT code, name 
             FROM industries
             ORDER BY name`
        );

        return res.json({ "industries": result.rows });
    }

    catch (err) {
        return next(err);
    }
});

/** GET /[code] => detail on industry */

router.get("/:code", async function (req, res, next) {
    try {
        let code = req.params.code;

        const indResult = await db.query(
            `SELECT name, description
             FROM industries
             WHERE code = $1`,
            [code]
        );

        const compResult = await db.query(
            `SELECT c.name, c.code
            FROM companies AS c
            LEFT JOIN industries_companies AS ic
            ON c.code = ic.c_code
            LEFT JOIN industries AS i
            ON ic.i_code = i.code
            WHERE ic.i_code = $1`,
            [code]

        );

        if (indResult.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        }

        const industry = indResult.rows[0];
        const companies = compResult.rows;
        industry.companies = companies.map(c => c.name);

        return res.json({ "industry": industry });
    }

    catch (err) {
        return next(err);
    }
});

/** POST / => add new industry */

router.post("/", async function (req, res, next) {
    try {
        let { name, description } = req.body.industry;
        let code = slugify(name, { lower: true });

        const result = await db.query(
            `INSERT INTO industries (code, name, description) 
             VALUES ($1, $2, $3) 
             RETURNING code, name, description`,
            [code, name, description]);

        return res.status(201).json({ "company": result.rows[0] });
    }

    catch (err) {
        return next(err);
    }
});

/** POST / => add new company to industry */

router.post("/:code", async function (req, res, next) {
    try {
        let code = req.params.code;
        let { c_code } = req.body;

        const indResult = await db.query(
            `SELECT * FROM industries AS i
          WHERE i.code = $1`,
            [code]);

        const compResult = await db.query(
            `SELECT * FROM companies AS c
          WHERE c.code = $1`,
            [c_code]);

        if (indResult.rows.length === 0 || compResult.rows.length === 0) {
            throw new ExpressError("MAKE SURE TO SUBMIT COMPANY & INDUSTRY CODE WITH CORRECT SPELLING", 404)
        }

        const result = await db.query(
            `INSERT INTO industries_companies (i_code, c_code) 
             VALUES ($1, $2) 
             RETURNING i_code, c_code`,
            [code, c_code]);

        return res.status(201).json({ "msg": `Added ${c_code} to industry ${code}` });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;