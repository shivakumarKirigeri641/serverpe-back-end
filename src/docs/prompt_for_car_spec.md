Create a api documentation for car_spec.docx file or .pdf file.
Requirements are as follows:
car_sepc apis

GET method Explanation:
api endpiont: /mockapis/serverpeuser/api/carspecs/car-makes
description: This api gives all list of car manufacturer names
response:
{
    "success": true,
    "data": [
        {
            "brand": "Abarth",
            "logo_path": "http://localhost:8888/images/logos/optimized/abarth.png"
        },
        {
            "brand": "AC",
            "logo_path": "http://localhost:8888/images/logos/optimized/ac.png"
        }
        ...
    ]
}
----------------------------------------------------------------
POST method Explanation:
The following apis must be called sequentially to get car specifications.
sequence:1
api endpiont: /mockapis/serverpeuser/api/carspecs/car-models
description: This api gives all list of car model names based on provided car manufacturers
request:
{
    "brand":"tata"
}
response:
{
    "success": true,
    "data": [
        {
            "model": "Altroz"
        },
        {
            "model": "Aria"
        },
        {
            "model": "Bolt"
        },
        {
            "model": "Curvv"
        },
        {
            "model": "Estate"
        },
        ...
    ]
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/carspecs/car-series
sequence:2
description: This api gives all list of car series names based on provided car manufacturer & model name from previous api endpiont.
request:
{
    "brand":"tata",
    "model":"curvv"
}
response:
{
    "success": true,
    "data": [
        {
            "series": "Curvv"
        }
    ]
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/carspecs/car-series
sequence:3
description: This api gives all list of car grade names based on provided car manufacturer, model name, series from previous api endpiont.
request:
{
    "brand":"tata",
    "model":"curvv"
    "series":"curvv"
}
response:
{
    "success": true,
    "data": [
        {
            "grade": "1.2L Hyperion (125 Hp)"
        },
        {
            "grade": "1.2L Hyperion (125 Hp) DCA"
        },
        {
            "grade": "1.2L Revotron (120 Hp)"
        },
        {
            "grade": "1.2L Revotron (120 Hp) DCA"
        },
        {
            "grade": "1.5L Kryojet (118 Hp)"
        },
        {
            "grade": "1.5L Kryojet (118 Hp) DCA"
        },
        {
            "grade": "EV 45 kWh (150 Hp)"
        },
        {
            "grade": "EV 55 kWh (167 Hp)"
        }
    ]
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/carspecs/car-list
sequence:4
description: This api gives all list of car list based on provided car manufacturer, model name, series and grade from previous api endpiont.
request:
{
    "brand":"tata",
    "model":"curvv"
    "series":"curvv",
    "grade":"EV 45 kWh (150 Hp)"
}
response:
{
    "success": true,
    "data": [
        {
            "id": 5117,
            "brand": "Tata",
            "model": "Curvv",
            "series": "Curvv",
            "grade": "EV 45 kWh (150 Hp)",
            "production_from": "August, 2024 year",
            "engine": "BEV (Electric Vehicle)",
            "body_type": "Coupe, SUV",
            "seats": "5",
            "doors": "5",
            "production_to": null,
            "created_at": "2025-12-08T11:18:15.025Z",
            "updated_at": "2025-12-08T11:18:15.025Z"
        }
    ]
}
Note: the above have only one car, based on your selection, you may get multiple cars.
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/carspecs/car-spec
sequence:5
description: This api gives car technical specification based on passing 'id' from above end-point. Make sure you pass a proper selected car's id to this api to get specs.
request:
{
    "id":5117
}
response:
{
    "success": true,
    "data": 
    {
        "Performance specs": {
            "Fuel Type": "Electricity",
            "Acceleration 0 - 100 km/h": "9.0 sec",
            "Acceleration 0 - 62 mph": "9.0 sec",
            "Acceleration 0 - 60 mph (Calculated by Auto-Data.net)": "8.6 sec"
        },
        "Space, Volume and weights": {
            "Trunk (boot) space - minimum": "500 l\r\n\t\t\t\t\t17.66 cu. ft."
        },
        "Dimensions": {
            "Length": "4310 mm\r\n\t\t\t\t\t169.69 in.",
            "Width": "1810 mm\r\n\t\t\t\t\t71.26 in.",
            "Height": "1637 mm",
            "Wheelbase": "2560 mm",
            "Minimum turning circle (turning diameter)": "10.7 m\r\n\t\t\t\t\t35.1 ft.",
            "Ride height (ground clearance)": "190 mm\r\n\t\t\t\t\t7.48 in."
        },
        "Drivetrain, brakes and suspension specs": {
            "Drivetrain Architecture": "One electric motor drives the front wheels.",
            "Drive wheel": "Front wheel drive",
            "Number of gears and type of gearbox": "1 gears, automatic transmission",
            "Front suspension": "Coil spring, Independent type McPherson",
            "Rear suspension": "Torsion",
            "Front brakes": "Disc",
            "Rear brakes": "Disc",
            "Assisting systems": "ABS (Anti-lock braking system)",
            "Steering type": "Steering rack and pinion",
            "Power steering": "Electric Steering",
            "Tires size": "215/60 R17; 215/55 R18",
            "Wheel rims size": "17; 18",
            "ABS (Anti-lock braking system)": "yes"
        },
        "Electric cars and hybrids specs": {
            "Gross battery capacity": "45 kWh",
            "Battery location": "Below the floor",
            "Charging ports": "Log in to see.",
            "Electric motor power": "150 Hp",
            "Electric motor Torque": "215 Nm\r\n\t\t\t\t\t\t\r\n\t\t\t\t158.58 lb.-ft.",
            "Electric motor location": "Front axle, Transverse",
            "Electric motor type": "Synchronous",
            "System power": "150 Hp",
            "System torque": "215 Nm\r\n\t\t\t\t158.58 lb.-ft.",
            "All-electric range": "502 km\r\n\t\t\t\t\t311.93 mi",
            "1. Electric motor power": "150 Hp",
            "1. Electric motor Torque": "215 Nm",
            "1. Engine layout": "Front axle, Transverse",
            "1. Electric motor type": "Synchronous"
        }
    }
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/carspecs/search-cars
sequence:5
description: This api gives list of cars for searched results. This api accepts parameters mentioned below (skip & limit)
request:
{
    "query":"tata",
    "limit":10,
    "skip":0
}
response:
{
    "success": true,
    "data": [
        {
            "id": 5102,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz (facelift 2025)",
            "grade": "1.2L Revotron (88 Hp) AMT",
            "production_from": "May, 2025 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": null,
            "created_at": "2025-12-08T11:18:13.313Z",
            "updated_at": "2025-12-08T11:18:13.313Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        },
        {
            "id": 5103,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz (facelift 2025)",
            "grade": "1.2L Revotron (88 Hp)",
            "production_from": "May, 2025 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": null,
            "created_at": "2025-12-08T11:18:13.375Z",
            "updated_at": "2025-12-08T11:18:13.375Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        },
        {
            "id": 5104,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz (facelift 2025)",
            "grade": "1.2L (88/73 Hp) iCNG",
            "production_from": "May, 2025 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": null,
            "created_at": "2025-12-08T11:18:13.448Z",
            "updated_at": "2025-12-08T11:18:13.448Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        },
        {
            "id": 5106,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz",
            "grade": "1.5 Revotorq (90 Hp)",
            "production_from": "2019 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": "May, 2025 year",
            "created_at": "2025-12-08T11:18:13.823Z",
            "updated_at": "2025-12-08T11:18:13.823Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        },
        {
            "id": 5107,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz",
            "grade": "1.2L i-Turbo+ (120 Hp) Racer",
            "production_from": "June, 2024 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": "May, 2025 year",
            "created_at": "2025-12-08T11:18:13.892Z",
            "updated_at": "2025-12-08T11:18:13.892Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        },
        {
            "id": 5108,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz",
            "grade": "1.2L (88/73 Hp) iCNG",
            "production_from": "May, 2023 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": "May, 2025 year",
            "created_at": "2025-12-08T11:18:13.953Z",
            "updated_at": "2025-12-08T11:18:13.953Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        },
        {
            "id": 5109,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz",
            "grade": "1.2i (102 Hp)",
            "production_from": "2019 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": "May, 2025 year",
            "created_at": "2025-12-08T11:18:14.022Z",
            "updated_at": "2025-12-08T11:18:14.022Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        },
        {
            "id": 5110,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz",
            "grade": "1.2 Revotron (86 Hp)",
            "production_from": "2019 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": "May, 2025 year",
            "created_at": "2025-12-08T11:18:14.089Z",
            "updated_at": "2025-12-08T11:18:14.089Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        },
        {
            "id": 5100,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz (facelift 2025)",
            "grade": "1.5L Revotorq (90 Hp)",
            "production_from": "May, 2025 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": null,
            "created_at": "2025-12-08T11:18:13.171Z",
            "updated_at": "2025-12-08T11:18:13.171Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        },
        {
            "id": 5101,
            "brand": "Tata",
            "model": "Altroz",
            "series": "Altroz (facelift 2025)",
            "grade": "1.2L Revotron (88 Hp) DCA",
            "production_from": "May, 2025 year",
            "engine": "Internal Combustion engine",
            "body_type": "Hatchback",
            "seats": "5",
            "doors": "5",
            "production_to": null,
            "created_at": "2025-12-08T11:18:13.242Z",
            "updated_at": "2025-12-08T11:18:13.242Z",
            "logo": "http://localhost:8888/images/logos/original/tata.png"
        }
    ]
}
----------------------------------------------------------------
All the above api endopints are samples only and not exact matches, actual response/requests, please check in postman app.
Caution: The data is strictly for UI testing, learning & training purpose only. No reletion with any of the live scenario.