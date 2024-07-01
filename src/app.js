import express from 'express'
const port = 3000
const app = express()

app.get("/",(req,res) => {
    res.send("this is new server")
})

export {app}