const fs = require('fs');
const {google} = require('googleapis');
require('dotenv').config()


class googleCalendarApi{
    constructor(){
        this.CALENDAR_ID = '1f30b23b431998eacce396c91cd329a38a9412c3b820d4b8649f9a56726e5e57@group.calendar.google.com'
        this.KEYFILE = 'calendar-tast-6c99426d79ae.json'
        this.SCOPE_CALENDAR = 'https://www.googleapis.com/auth/calendar'
        this.SCOPE_EVENTS = 'https://www.googleapis.com/auth/calendar.events'
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