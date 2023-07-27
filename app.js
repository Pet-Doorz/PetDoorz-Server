if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const { sequelize } = require('./models')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello PetDoorz!')
})

app.get('/location', async (req, res) => {
    try {
        // distance on meter unit
        const distance = req.query.distance || 1000;
        const long = req.query.long || '-6.9439994342171225';
        const lat = req.query.lat || '107.5904275402039';

        const result = await sequelize.query(
            `select
          id,
          name,
          location
        from
          "Stores"
        where
          ST_DWithin(location,
          ST_MakePoint(:lat,
          :long),
          :distance,
        true) = true;`,
            {
                replacements: {
                    distance: +distance,
                    long: parseFloat(long),
                    lat: parseFloat(lat),
                },
                logging: console.log,
                plain: false,
                raw: false,
                type: sequelize.QueryTypes.SELECT,
            }
        );
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

console.clear()
app.listen(port, () => {
    console.log(`PetDoorz running on ${port} CIHUYYYYYY!`)
})