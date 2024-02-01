const express = require('express')
const app = express()
const port = 5000;

app.get('/api', (req, res) => {
    res.send('Hello World');
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});