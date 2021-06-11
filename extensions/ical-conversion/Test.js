const moment = require('moment')
const ical2json = require('ical2json');
const Blob = require("blob");
let description = "This"
let summary = "that"
let location = "here"
let categories = "all"

let sourceJSON = {
    VCALENDAR: [
        {
            CALSCALE: "GREGORIAN",
            PRODID: "Cognigy.AI/CognigyAgent/EN",
            VERSION: "2.0",
            METHOD: "PUBLISH",
            VEVENT: [
                {
                   // DTSTAMP: moment(input.currentTime.ISODATE).locale("en").format(dateFormat),
                   // DTSTART: moment(dateStart).locale("en").format(dateFormat),
                   // DTEND: moment(dateEnd).locale("en").format(dateFormat),
                  //  TZID: input.currentTime.timezoneOffset,
                    DESCRIPTION: description,
                    SUMMARY: summary,
                    LOCATION: location,
                    CATEGORIES: categories
                }
            ]
        }
    ]
};
let output = ical2json.revert(sourceJSON);

let download = (content, filename) => {
    let uriContent = URL.createObjectURL(new Blob([content], {type: "text/plain"}));
    let link = document.createElement('a');
    link.setAttribute('href', uriContent);
    link.setAttribute('download', filename);
    let event = new MouseEvent('click');
    link.dispatchEvent(event)
};
download(output, "text.ics")