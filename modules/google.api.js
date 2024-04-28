const fs = require('fs');
const {google} = require('googleapis');
require('dotenv').config()


class googleCalendarApi{
    constructor(CALENDAR_ID, KEYFILE, SCOPE_CALENDAR, SCOPE_EVENTS){
        this.CALENDAR_ID = process.env.CALENDAR_ID
        this.KEYFILE = process.env.KEYFILE
        this.SCOPE_CALENDAR = process.env.SCOPE_CALENDAR
        this.SCOPE_EVENTS = process.env.SCOPE_EVENTS
    }

    async readPrivateKey() {
        const content = fs.readFileSync(this.KEYFILE);
        return JSON.parse(content.toString());
    }

    async authenticate(key) {
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            [this.SCOPE_CALENDAR, this.SCOPE_EVENTS]
        );
        await jwtClient.authorize();
        return jwtClient;
    }


    async readEvent(auth){
        const calendar = google.calendar({version: 'v3', auth});
        const res = await calendar.events.list({
            calendarId: this.CALENDAR_ID,
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = res.data.items;
        if (!events || events.length === 0) {
            console.log('No upcoming events found.');
            return;
        }

        events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            
        });
        return events
    }
}

module.exports = googleCalendarApi

// async function main(){
//   const api = new googleCalendarApi()
//   try {
//     const key = await api.readPrivateKey()
//     const auth = await api.authenticate(key);
//     await api.readEvent(auth);
//   } catch (e) {
//       console.log('Error: ' + e);
//   }
// }
// main()