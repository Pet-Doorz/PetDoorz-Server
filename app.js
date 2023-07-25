if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

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

console.clear()
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})