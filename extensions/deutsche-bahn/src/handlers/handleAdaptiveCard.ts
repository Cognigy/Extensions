export async function handleAdaptiveCard(data: any): Promise<any[]> {
    const { routes } = data;
    const { legs } = routes[0];

    let transit_steps: any[] = [
        {
            "type": "Image",
            "url": "https://logosmarken.com/wp-content/uploads/2021/03/Deutsche-Bahn-Logo.png",
            "size": "Medium",
            "horizontalAlignment": "Left"
        }
    ];

    for (let leg of legs) {
        // const { arrival_time, departure_time, duration, end_address, start_address, steps } = leg;
        const { steps } = leg;

        for (let step of steps) {
            if (step?.travel_mode === "TRANSIT") {

                const { transit_details, duration } = step;
                const { arrival_time, arrival_stop, departure_stop, departure_time, headsign, line } = transit_details;

                transit_steps.push({
                    "type": "ColumnSet",
                    "columns": [
                        {
                            "type": "Column",
                            "items": [
                                {
                                    "type": "ColumnSet",
                                    "columns": [
                                        {
                                            "type": "Column",
                                            "spacing": "None",
                                            "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "text": departure_time.text,
                                                    "weight": "bolder",
                                                    "wrap": true
                                                }
                                            ],
                                            "width": "stretch"
                                        }
                                    ]
                                },
                                {
                                    "type": "TextBlock",
                                    "spacing": "None",
                                    "text": duration.text,
                                    "isSubtle": true,
                                    "wrap": true
                                }
                            ],
                            "width": "110px"
                        },
                        {
                            "type": "Column",
                            "backgroundImage": {
                                "url": "https://messagecardplayground.azurewebsites.net/assets/SmallVerticalLineGray.png",
                                "fillMode": "RepeatVertically",
                                "horizontalAlignment": "Center"
                            },
                            "items": [
                                {
                                    "type": "Image",
                                    "horizontalAlignment": "Center",
                                    "url": "https://cognigydemoimages.blob.core.windows.net/images/dot2.png",
                                    "altText": "Location A: Coffee"
                                }
                            ],
                            "width": "auto",
                            "spacing": "None"
                        },
                        {
                            "type": "Column",
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "weight": "bolder",
                                    "text": departure_stop.name,
                                    "wrap": true
                                },
                                {
                                    "type": "ColumnSet",
                                    "spacing": "None",
                                    "columns": [
                                        {
                                            "type": "Column",
                                            "items": [
                                                {
                                                    "type": "Image",
                                                    "url": line.vehicle.icon ? line.vehicle.icon : "https://messagecardplayground.azurewebsites.net/assets/location_gray.png",
                                                    "altText": "Location"
                                                }
                                            ],
                                            "width": "auto"
                                        },
                                        {
                                            "type": "Column",
                                            "width": "stretch",
                                            "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "text": `${line.short_name} -> ${headsign}`,
                                                    "wrap": true
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "width": 40
                        }
                    ]
                },
                {
                    "type": "ColumnSet",
                    "spacing": "None",
                    "columns": [
                        {
                            "type": "Column",
                            "items": [
                                {
                                    "type": "ColumnSet",
                                    "columns": [
                                        {
                                            "type": "Column",
                                            "spacing": "None",
                                            "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "text": arrival_time.text,
                                                    "weight": "bolder",
                                                    "wrap": true
                                                }
                                            ],
                                            "width": "stretch"
                                        }
                                    ]
                                }
                            ],
                            "width": "110px"
                        },
                        {
                            "type": "Column",
                            "backgroundImage": {
                                "url": "https://messagecardplayground.azurewebsites.net/assets/SmallVerticalLineGray.png",
                                "fillMode": "RepeatVertically",
                                "horizontalAlignment": "Center"
                            },
                            "items": [
                                {
                                    "type": "Image",
                                    "horizontalAlignment": "Center",
                                    "url": "https://cognigydemoimages.blob.core.windows.net/images/dot2.png",
                                    "altText": "Location A: Coffee"
                                }
                            ],
                            "width": "auto",
                            "spacing": "None"
                        },
                        {
                            "type": "Column",
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "weight": "bolder",
                                    "text": arrival_stop.name,
                                    "wrap": true
                                }
                            ],
                            "width": 40
                        }
                    ]
                },
                    {
                        "type": "ColumnSet",
                        "spacing": "None",
                        "columns": [
                            {
                                "type": "Column",
                                "width": "110px"
                            },
                            {
                                "type": "Column",
                                "backgroundImage": {
                                    "url": "https://messagecardplayground.azurewebsites.net/assets/SmallVerticalLineGray.png",
                                    "fillMode": "RepeatVertically",
                                    "horizontalAlignment": "Center"
                                },
                                "items": [
                                    {
                                        "type": "Image",
                                        "horizontalAlignment": "Center",
                                        "url": "https://cognigydemoimages.blob.core.windows.net/images/dotgrey.png"
                                    }
                                ],
                                "width": "auto",
                                "spacing": "None"
                            },
                            {
                                "type": "Column",
                                "items": [
                                    {
                                        "type": "ColumnSet",
                                        "columns": [
                                            {
                                                "type": "Column",
                                                "width": "auto",
                                                "items": [
                                                    {
                                                        "type": "Image"
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "Column",
                                                "width": "stretch"
                                            }
                                        ]
                                    }
                                ],
                                "width": 40
                            }
                        ]
                    });
            }
        }
    }

    return transit_steps;
}