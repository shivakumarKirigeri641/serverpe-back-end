Create a api documentation for bike_spec.docx file or .pdf file.
Requirements are as follows:
bike_sepc apis

GET method Explanation:
api endpiont: mockapis/serverpeuser/api/bikespecs/bike-makes
description: This api gives all list of bike manufacturer names
response:
{
    "success": true,
    "data": [
        {
            "brand": "ACABION",
            "logo_path": null
        },
        {
            "brand": "ACCESS",
            "logo_path": null
        },
        ...
    ]
}
Note: Sometimes for logo, I may not have permission to show-case. So, logo_path will be sometimes null.
----------------------------------------------------------------
POST method Explanation:
The following apis must be called sequentially to get bike specifications.
sequence:1
api endpiont: /mockapis/serverpeuser/api/bikespecs/bike-models
description: This api gives all list of bike model names based on provided bike manufacturers
request:
{
    "brand":"triumph"
}
response:
{
    "success": true,
    "data": [
        {
            "model": "3ta"
        },
        {
            "model": "500_grand_prix"
        },
        {
            "model": "6tp"
        },
        {
            "model": "Adventurer"
        },
        {
            "model": "America"
        },
        {
            "model": "America_lt"
        },
        {
            "model": "Bandit_350"
        },
        {
            "model": "Bobber_tfc"
        },
        {
            "model": "Bonneville"
        },
        {
            "model": "Bonneville_50th"
        },
        {
            "model": "Bonneville_america"
        },
        {
            "model": "Bonneville_black"
        },
        {
            "model": "Bonneville_bobber"
        },
        {
            "model": "Bonneville_bobber_black"
        },
        {
            "model": "Bonneville_bobber_chrome_edition"
        },
        {
            "model": "Bonneville_bobber_gold_line"
        },
        ...
    ]
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/bikespecs/bike-type
sequence:2
description: This api gives all list of bike series names based on provided bike manufacturer & model name from previous api endpiont.
request:
{
    "brand":"triumph",
    "model":"3ta"
}
response:
{
    "success": true,
    "remaining_calls": 31,
    "data": [
        {
            "bike_type": "Sport"
        },
        {
            "bike_type": "std"
        }
    ]
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/bikespecs/bike-category
sequence:3
description: This api gives all list of bike category names based on provided bike manufacturer, model name, bike_type from previous api endpiont.
request:
{
    "brand":"triumph",
    "model":"3ta",
    "bike_type":"sport"    
}
response:
{{
    "success": true,
    "remaining_calls": 30,
    "data": [
        {
            "category": "std"
        }
    ]
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/bikespecs/bike-list
sequence:4
description: This api gives all list of bike list based on provided bike manufacturer, model name, bike_type and category from previous api endpiont.
request:
{
    "brand":"triumph",
    "model":"3ta",
    "bike_type":"sport",
    "category":"std"
}
response:
{
    "success": true,
    "data": [
        {
            "id": 38033,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "Sport",
            "category": "std",
            "year_of_manufacture": "1958",
            "created_at": "2025-12-08T15:09:10.466Z",
            "updated_at": "2025-12-10T13:33:42.949Z"
        },
        {
            "id": 38035,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "Sport",
            "category": "std",
            "year_of_manufacture": "1960",
            "created_at": "2025-12-08T15:09:10.617Z",
            "updated_at": "2025-12-10T13:33:42.949Z"
        },
        {
            "id": 38037,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "Sport",
            "category": "std",
            "year_of_manufacture": "1962",
            "created_at": "2025-12-08T15:09:10.766Z",
            "updated_at": "2025-12-10T13:33:42.949Z"
        },
    ]
}
Note: the above have only one bike, based on your selection, you may get multiple bikes.
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/bikespecs/bike-spec
sequence:5
description: This api gives bike technical specification based on passing 'id' from above end-point. Make sure you pass a proper selected bike's id to this api to get specs.
request:
{
    "id":38033
}
response:
{
    "success": true,
    "data": 
    {
        "general_information": {
            "Motorcycle name": "Triumph 3TA",
            "Type": "Sport",
            "Rating": "3.1 Check out the detailed rating of racing track capabilities, engine performance, accident risk, etc. Compare with any other bike.",
            "Year of manufacture": "1958"
        },
        "engine": {
            "Type of engine": "Twin, four-stroke",
            "Transmission type": "Chain (final drive)",
            "Fuel system": "Carburettor. Amal",
            "Output": "21.0 HP (15.3 kW))",
            "Engine size": "349.0 ccm (21.30 cubic inches)",
            "Lubrication system": "Dry sump"
        },
        "chassis": {
            "Front brakes": "Expanding brake (drum brake)",
            "Rear brakes": "Expanding brake (drum brake)",
            "Seat": "Dual seat"
        },
        "physical": {
            "Dry weight": "156.5 kg (345.0 pounds)",
            "Power/weight ratio": "0.1342 HP/kg"
        }
    }
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/bikespecs/search-bikes
sequence:5
description: This api gives list of bikes for searched results. This api accepts parameters mentioned below (skip & limit)
request:
{
    "query":"triumph",
    "limit":10,
    "skip":0
}
response:
{
    "success": true,
    "data": [
        {
            "id": 38036,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "std",
            "category": "Sport",
            "year_of_manufacture": "1961",
            "created_at": "2025-12-08T15:09:10.692Z",
            "updated_at": "2025-12-10T13:31:23.624Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        },
        {
            "id": 38038,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "std",
            "category": "Sport",
            "year_of_manufacture": "1963",
            "created_at": "2025-12-08T15:09:10.839Z",
            "updated_at": "2025-12-10T13:31:23.624Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        },
        {
            "id": 38039,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "Sport",
            "category": "std",
            "year_of_manufacture": "1964",
            "created_at": "2025-12-08T15:09:10.914Z",
            "updated_at": "2025-12-10T13:33:42.949Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        },
        {
            "id": 38032,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "std",
            "category": "Sport",
            "year_of_manufacture": "1957",
            "created_at": "2025-12-08T15:09:10.391Z",
            "updated_at": "2025-12-10T13:31:23.624Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        },
        {
            "id": 38034,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "std",
            "category": "Sport",
            "year_of_manufacture": "1959",
            "created_at": "2025-12-08T15:09:10.542Z",
            "updated_at": "2025-12-10T13:31:23.624Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        },
        {
            "id": 38041,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "Sport",
            "category": "std",
            "year_of_manufacture": "1966",
            "created_at": "2025-12-08T15:09:11.063Z",
            "updated_at": "2025-12-10T13:33:42.949Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        },
        {
            "id": 38035,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "Sport",
            "category": "std",
            "year_of_manufacture": "1960",
            "created_at": "2025-12-08T15:09:10.617Z",
            "updated_at": "2025-12-10T13:33:42.949Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        },
        {
            "id": 38033,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "Sport",
            "category": "std",
            "year_of_manufacture": "1958",
            "created_at": "2025-12-08T15:09:10.466Z",
            "updated_at": "2025-12-10T13:33:42.949Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        },
        {
            "id": 38037,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "Sport",
            "category": "std",
            "year_of_manufacture": "1962",
            "created_at": "2025-12-08T15:09:10.766Z",
            "updated_at": "2025-12-10T13:33:42.949Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        },
        {
            "id": 38040,
            "brand": "TRIUMPH",
            "model": "3ta",
            "bike_type": "std",
            "category": "Sport",
            "year_of_manufacture": "1965",
            "created_at": "2025-12-08T15:09:10.988Z",
            "updated_at": "2025-12-10T13:31:23.624Z",
            "logo": "http://localhost:8888/images/logos/original/triumph.png"
        }
    ]
}
----------------------------------------------------------------
All the above api endopints are samples only and not exact matches, actual response/requests, please check in postman app.
Caution: The data is strictly for UI testing, learning & training purpose only. No reletion with any of the live scenario.