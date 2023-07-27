if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')

const router = require('./routes')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

app.use(router)

console.clear()
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})