const express = require("express")
const googleCalendarApi = require("./modules/google.api")
const axios = require("axios")

require('dotenv').config()

const app = express()
const port = 5000
const siteForDataFromCinema = 'localhost:3000'

async function checkScheduleConflict(events, movieSession) {
    const movieStartTime = new Date(movieSession.start_time);
    const movieEndTime = new Date(movieSession.end_time);
    for (const event of events) {
        const eventStartTime = new Date(event.start.dateTime)
        const eventEndTime = new Date(event.end.dateTime);
        if (movieStartTime < eventEndTime && movieEndTime > eventStartTime) {
            console.log(`Conflict! Movie ${movieSession.movie_title} clashes with event ${event.summary} in your calendar.`);
            return false;
        }
    }
    return true;
}
app.get("/", async (req, res) => {
    try {
        const response = await axios.get(siteForDataFromCinema);
        const data = response.data.movie_sessions;

        const googleApi = new googleCalendarApi();
        const key = await googleApi.readPrivateKey(process.env.KEYFILE);
        const auth = await googleApi.authenticate(key);
        const events = await googleApi.readEvent(auth);

        const promises = data.map(item => checkScheduleConflict(events, item));
        const results = await Promise.all(promises);

        for (let i = 0; i < results.length; i++) {
            if (results[i]) {
                res.send(`Great! You can watch ${data[i].movie_title} at ${data[i].start_time}`);
                return;
            }
        }

        res.send("Has conflict");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// app.get("/", async (req, res) => {
//     const response = await axios.get(siteForDataFromCinema)
//     const data = response.data.movie_sessions
//
//     const googleApi = new googleCalendarApi()
//     const key = await googleApi.readPrivateKey(process.env.KEYFILE)
//     const auth = await googleApi.authenticate(key);
//     const events = await googleApi.readEvent(auth);
//     for (let item of data) {
//         const hasConflict = await checkScheduleConflict(events, item);
//         if (hasConflict) {
//             res.send(`Great! You can watch ${item.movie_title} at ${item.start_time}`);
//         }
//         res.send("Has conflict")
//     }
// })

app.listen(port, () => {
    console.log(`Server started on ${port}`)
})