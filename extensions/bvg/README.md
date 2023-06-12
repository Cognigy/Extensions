# BVG

This Extension uses the open [BVG Transport REST API](https://v6.bvg.transport.rest/api.html#get-locations) in order to search for stops and display current departures or arrivals.

## Node: Find Stations

This Flow Node takes a `query` or user `location` and searches for BVG stops accordingly. Moreover, it can include or exclude certain types of transportation, such as ferries, subways, etc.
Last but not least, it offers the capabitlity to output the results as "Text with Quick Replies" messages directly to the user.

## Node: Get Station Info

After finding the correct station / stop the user is searching for, its `id` can be used in order to retrieve the departures or arrivals with this Flow Node.
