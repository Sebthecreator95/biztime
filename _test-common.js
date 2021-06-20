/** code common to tests. */

const db = require("./db");


async function createData() {
       await db.query("DELETE FROM industries_companies")
       await db.query("DELETE FROM invoices");
       await db.query("DELETE FROM companies");
       await db.query("DELETE FROM industries");
       await db.query("SELECT setval('invoices_id_seq', 1, false)");
       await db.query(`
       INSERT INTO industries
         VAlUES ('CHW','Computer Hardware'),
              ('CSW','Computer Software'),
              ('AI','Artificial Inteligence');
       INSERT INTO companies (code, name, description)
         VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
              ('ibm', 'IBM', 'Big blue.');
       INSERT INTO invoices (comp_Code, amt, paid, paid_date)
         VALUES ('apple', 100, false, null),
              ('apple', 200, false, null),
              ('apple', 300, true, '2018-01-01'),
              ('ibm', 400, false, null);
       INSERT INTO industries_companies(i_code, c_code)
         VALUES ('CSW', 'apple'),
              ('CHW', 'apple'),
              ('AI', 'apple');`);

}


module.exports = { createData };
