import express from "express";
import db from "../configs/database.js";

const router = express.Router();

router.get('/', (req, res) => {

    const q = `SELECT * FROM user`;

    db.query(q, (error, data) => {

        if (error) return res.status(500).json(error);

        if (data.length > 0) {
            res.status(200).json({
                message: 'sucess',
                data
            })
        } else {
            return res.status(401).json({
                message: 'Aucun utilisateur disponible'
            })
        }
    })
})

router.get('/:id', (req, res) => {
    const userId = req.params.id;

    const q = "SELECT * FROM user WHERE `iduser` = ?";

    db.query(q, [userId], (error, data) => {
        if (error) return res.status(500).json(error)

        res.status(200).json({
            message: 'success',
            data
        })
    })
})

router.post('/signup', (req, res) => {

    const { username, password } = req.body;

    const q = "INSERT INTO user(`username`, `password`) VALUES (?,?)";

    db.query(q, [username, password], (error, data) => {
        if (error) {
            return res.status(500).json({
                message: 'There is an internal error',
                error: error
            })
        } else {
            res.status(200).json({
                message: "user created",
                data: data
            })
        }
    })
});

router.post('/signin', (req, res) => {

    const { username, password } = req.body;

    const q = `SELECT * FROM user WHERE username = '${username}'`;

    db.query(q, (error, data) => {

        if (error) return res.status(500).json(error);

        if (data.length > 0) {
            if (!(data[0].password === password)) return res.json('Mot de passe incorrect');
            res.status(200).json({
                message: 'sucess'
            })
        } else {
            return res.status(400).json({
                message: 'Utilisateur non existant'
            })
        }
    })
})

router.post('/forget-password', (req, res) => {

    const { username } = req.body;

    const q1 = "SELECT * FROM `user` WHERE `username` = ?"

    db.query(q1, [username], (error, data) => {

        if (error) return res.status(500).json(error);

        if (data.length > 0) {
            //create new token
            const secret = process.env.SECRET_KEY + data.password;

            const payload = {
                userId: data.iduser,
                username: data.username
            };

            const token = sign(payload, secret, {
                expireIn: '10m'
            });

            const link = `http://localhost:7700/reset-password/${payload.userId}/${token}`
            const mailOptions = {
                from: 'Malkiah ): <malkia-no-reply@gmail.com>',
                to: '',
                subject: 'Reset password',
                html: `Cliquer sur ce lien pour reinitialiser le mot de passe <br/>${link}`
            };

            transporter.senMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err)
                } else {
                    return res.status(200).json({
                        message: `Un lien contenant le nouveau mot de passe a été envoyé à l\'adresse ${username}`
                    })
                }
            })

        } else {
            return res.status(400).json({
                message: 'Utilisateur non existant'
            })
        }
    })
})

router.post('/reset-password/:id/:token', (req, res) => {

    const { password } = req.body;

    const { id } = req.params;

    const q1 = `UPDATE user SET password = '${password}' WHERE iduser='${id}'`

    db.query(q1, [password, id], (error, data) => {

        if (error) return res.status(500).json(error);

        res.status(200).json({
            message: "mot de pass modifié avec succes",
            data
        })

    })
})
export default router;