const express = require('express');
const router = express.Router();
const cors = require('cors');
const sql = require('sqlite3');

const dbPath = './db/dev.sqlite3';

router.put('/', (req, rsp) => {
    const {milestones} = req.body;
    const db = new sql.Database(dbPath);

    // const ids = [];
    // for (const ms of milestones)
    //     ids.push(ms.categories.map(cat => `(${ms.id}, ${cat.id})`));

    // console.log(ids.flat().toString());
    db.serialize(() => {
        const stmt = db.prepare('UPDATE MILESTONES SET definition = ? WHERE id = ?');
        for (const ms of milestones) {
            stmt.run([ms.definition, ms.id]);
        }
    
        stmt.finalize((err) => {
            if (err) {
                console.error('DB ERROR!', err);
                return rsp.send({ok: false}); 
            }
        });
    
        db.run('BEGIN TRANSACTION');
        db.run('DELETE FROM MILESTONES_CATEGORIES', function (err) {
            if (err) {
                console.error('DB ERROR!', err);
                db.run('ROLLBACK');
                return rsp.send({ok: false}); 
            }

            const stmt2 = db.prepare('INSERT INTO MILESTONES_CATEGORIES (milestone_id, category_id) VALUES (?, ?)');
            for (const ms of milestones) {
                for (const cat of ms.categories) {
                    stmt2.run([ms.id, cat.id]);
                }
            }

            stmt2.finalize((err) => {
                if (err) {
                    console.error('DB ERROR!', err);
                    db.run('ROLLBACK');
                    return rsp.send({ok: false}); 
                }
            });
        });

        db.run('COMMIT');
        rsp.send({ok: true});
    });
    
});

router.get('/', async (req, rsp) => {
    const db = new sql.Database(dbPath);

    const rows = await new Promise(res => {
        db.all('SELECT * FROM MILESTONES', function (err, rows) {
            if (err) {
                console.error('DB ERROR!', err);
                return res(null);
            }
            res(rows);
        });
    });

    if (!rows)
        rsp.send({data: null});

    for(r of rows) {
        r.categories = await new Promise(res => {
            db.all(`SELECT MC.* FROM MILESTONE_CATEGORIES MC
                    LEFT JOIN MILESTONES_CATEGORIES MCS ON MC.id = MCS.category_id
                    WHERE MCS.milestone_id = ?`, r.id, function (err, rows) {
                if (err) {
                    console.error('DB ERROR!', err);
                    return res(null);
                }
                res(rows);
            });
        });
    }

    rsp.send({data: rows});
});

router.get('/category', (req, rsp) => {
    const db = new sql.Database(dbPath);
    db.all('SELECT * FROM MILESTONE_CATEGORIES', function (err, rows) {
        if (err) {
            console.error('DB ERROR', err);
            rsp.send({data: null});
        }
        rsp.send({data: rows});
    });
});


module.exports = router;