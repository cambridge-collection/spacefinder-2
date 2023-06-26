/**
 * Toggle opening hours for (full) term or out-of-term University of Cambridge opening hours.
 *
 * Uses opening hours data provided by the University in iCal form to determine whether the current date
 * is term-time or out-of-term.
 *
 */

const fs = require('fs');
const path = require('path');
const ical2json = require("ical2json");
fs.readFile( path.resolve( __dirname, '../_data/ucam-term-times.ics' ), "utf8", (err, calData) => {
    if (err) throw err;

    const termCalendar = ical2json.convert( calData );
    const termEvents = termCalendar.VCALENDAR[0].VEVENT;
    const currentDateInFullTerm = isFullTerm( termEvents );

    // Get list of space files
    const spaceFiles = fs.readdirSync(path.resolve(__dirname, '../spaces'), {encoding: 'utf8'})
        .filter(file => {
            return path.extname(file).toLowerCase() === '.json';
        });
    console.log( "Space files: " + spaceFiles.length + ' files found.' );

    // Loop through each file and update opening hours
    spaceFiles.forEach(filename => {
        fs.readFile(path.resolve(__dirname, '../spaces/', filename), "utf8", (err, spaceData) => {
            const spaceJson = JSON.parse(spaceData);
            let update = false;
            // Term opening hours
            if (currentDateInFullTerm &&
                !isOpeningHoursEqual(spaceJson.opening_hours, spaceJson.term_time_hours)) {
                spaceJson.opening_hours = spaceJson.term_time_hours;
                update = true;
            }
            // Out-of-term opening hours
            else if (!currentDateInFullTerm &&
                !isOpeningHoursEqual(spaceJson.opening_hours, spaceJson.out_of_term_hours)) {
                spaceJson.opening_hours = spaceJson.out_of_term_hours
                update = true;
            }

            if (update) {
                fs.writeFile(path.resolve(__dirname, '../spaces/' + spaceJson.id + '.json'),
                    JSON.stringify(spaceJson, null, 2), err => {
                        if (err) {
                            console.error(err);
                        }
                    });
                console.log('Updated space file opening hours: ' + filename);
            }
        });
    });
});

/**
 * Helper function to determine whether the current date is within term or out of term.
 *
 * @returns {Boolean} true if current date within full term
 * @param termEvents {Array} iCal events
 */
function isFullTerm ( termEvents ) {
    let fullTermEvents = [];
    let termTime = false;
    const currentDate = new Date().toISOString().substring(0, 10).split('-').join(''); // YYYYMMDD format

    // Collect 'Full Term' events only
    termEvents.forEach(termEvent => {
        if (termEvent.SUMMARY.startsWith('Full Term')) {
            fullTermEvents.push( termEvent );
        }
    });

    // Sort order of events by start date
    fullTermEvents.sort(function (a, b) {
        return a['DTSTART;VALUE=DATE'].localeCompare(b['DTSTART;VALUE=DATE']);
    });

    for (let i in fullTermEvents) {

        // Find previous event compared with current date
        if (fullTermEvents[i]['DTSTART;VALUE=DATE'] > currentDate) {

            let startDate = fullTermEvents[i - 1]['DTSTART;VALUE=DATE'];
            let summary = fullTermEvents[i - 1]['SUMMARY']

            // If event is 'begins' we are in Full Term [if 'ends' we are out-of-term]
            termTime = summary.endsWith('begins')

            console.log('Event: ' + summary + '; Start Date: ' + startDate +
                '; Current Date: ' + currentDate + '; Currently in Term: ' + termTime)

            break;
        }
    }
    return termTime;
}

/**
 * Helper function to determine whether two sets of opening hours have deep equality. (Just compares the objects.)
 *
 * @returns {Boolean} true if the two sets of opening hours are equal
 * @param {Object} opening_hours_1 opening hours to compare
 * @param {Object} opening_hours_2 opening hours to compare
 */
function isOpeningHoursEqual( opening_hours_1, opening_hours_2 ) {

    if ( Object.keys(opening_hours_1).length !== Object.keys(opening_hours_2).length )  {
        return false
    }
    for ( const key in opening_hours_1 ) {
        const value_1 = opening_hours_1[key]
        const value_2 = opening_hours_2[key]
        if ( (value_1 instanceof Object && !isOpeningHoursEqual(value_1, value_2) ) ||
            ( !(value_1 instanceof Object) && value_1 !== value_2) ) {
            return false;
        }
    }
    return true;

}