Create a api documentation for pincode.docx file or .pdf file.
Requirements are as follows:
pincode apis

GET method Explanation:
api endpiont: /mockapis/serverpeuser/api/pincodes/states
description: This api gives all list of states & territories.
response:
{
    "success": true,
    "data": [
        {
            "state": "Andaman & Nicobar"
        },
        {
            "state": "Andhra Pradesh"
        },
        {
            "state": "Arunachal Pradesh"
        },
        {
            "state": "Assam"
        },
        ...
    ]
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/pincodes/states
description: This api gives all list of all available pincodes. (Not recommanded unless really necessary for your UI development)
response:
{
    "success": true,
    "data": 
    [
        {    
        "pincode": "110001"
        },
        {
            "pincode": "110001"
        },
        {
            "pincode": "110002"
        },
        {
            "pincode": "110003"
        },
        {
            "pincode": "110004"
        },
        {
            "pincode": "110005"
        },
        {
            "pincode": "110006"
        },
        {
            "pincode": "110007"
        },
        ...
    ]
}
----------------------------------------------------------------
api endpiont: /mockapis/serverpeuser/api/pincodes/states
description: This api gives all list of all available pincodes. (Not recommanded unless really necessary for your UI development)
response:
{
    "success": true,
    "data": 
    [
        {    
        "pincode": "110001"
        },
        {
            "pincode": "110001"
        },
        {
            "pincode": "110002"
        },
        {
            "pincode": "110003"
        },
        {
            "pincode": "110004"
        },
        {
            "pincode": "110005"
        },
        {
            "pincode": "110006"
        },
        {
            "pincode": "110007"
        },
        ...
    ]
}
----------------------------------------------------------------
POST api calls:
sequence:1
api endpiont: /mockapis/serverpeuser/api/pincodes/districts
Note:From here, all apis must be called to get the proper pincode details.
description:This api gives all list of all available distict names. You need to provide the selected state/territory from dropdown of UI you are developing from calling'GET' api endpoint
mentioned above.
request:
{
    "selectedState":"Karnataka"
}
response:
{
    "remaining_calls": 51,
    "data": [
        {
            "district": "Bagalkot"
        },
        {
            "district": "Bangalore"
        },
        ...
    ]
}
----------------------------------------------------------------
sequence:2
api endpiont: /mockapis/serverpeuser/api/pincodes/blocks
description: Call this api with 2 parameters (selected state, selected district from above api endpoint)
request:
{
    "selectedState":"Karnataka",
    "selectedDistrict":"Hubli"
}
response:
{
    "remaining_calls": 51,
    "data": [
        {
            "block": "Ankola"
        },
        {
            "block": "Bhatkal"
        },
        {
            "block": "Haliyal"
        },
        {
            "block": "Honavar"
        },
        ...
    ]
}
----------------------------------------------------------------
sequence:3
api endpiont: /mockapis/serverpeuser/api/pincodes/branchtypes
description: Call this api with 3 parameters (selected state, selected district and selected block from above api endpoint)
request:
{
    "selectedState":"Karnataka",
    "selectedDistrict":"Hubli",
    "selectedBlock":"Sirsi"    
}
response:
{
    "remaining_calls": 48,
    "data": [
        {
            "branch_type": "Branch Post Office"
        },
        {
            "branch_type": "Head Post Office"
        },
        {
            "branch_type": "Sub Post Office"
        }
    ]
}
----------------------------------------------------------------
sequence:4
api endpiont: /mockapis/serverpeuser/api/pincodes/pincode-list
description: Call this api with 4 parameters (selected state, selected district,  selected block, selected branchtype from above api endpoint)
request:
{
    "selectedState":"Karnataka",
    "selectedDistrict":"Hubli",
    "selectedBlock":"Sirsi",
    "selectedBranchType":"Sub Post office"
}
response:
{
    "remaining_calls": 48,
    "data": [
        {
            "id": 65397,
            "name": "Aminalli",
            "description": null,
            "branch_type": "Sub Post Office",
            "delivery_status": "Delivery",
            "circle": "Karnataka",
            "district": "Uttara Kannada",
            "division": "Sirsi",
            "region": "North Karnataka",
            "block": "Sirsi",
            "state": "Karnataka",
            "country": "India",
            "pincode": "581315"
        },
        {
            "id": 65417,
            "name": "Banavasi",
            "description": null,
            "branch_type": "Sub Post Office",
            "delivery_status": "Delivery",
            "circle": "Karnataka",
            "district": "Uttara Kannada",
            "division": "Sirsi",
            "region": "North Karnataka",
            "block": "Sirsi",
            "state": "Karnataka",
            "country": "India",
            "pincode": "581318"
        },
        ...
    ]
}
----------------------------------------------------------------
sequence:4
api endpiont: /mockapis/serverpeuser/api/pincodes/pincode-details
description: Call this api with a proper pincode number
request:
{
    "pincode":"573133"
}
response:
{
    "remaining_calls": 48,
    "data": [
        {
            "id": 62666,
            "name": "Agrahara",
            "description": null,
            "branch_type": "Branch Post Office",
            "delivery_status": "Delivery",
            "circle": "Karnataka",
            "district": "Hassan",
            "division": "Hassan",
            "region": "South Karnataka",
            "block": "Arkalgud",
            "state": "Karnataka",
            "country": "India",
            "pincode": "573133"
        },
        {
            "id": 62667,
            "name": "Doddahalli",
            "description": null,
            "branch_type": "Branch Post Office",
            "delivery_status": "Delivery",
            "circle": "Karnataka",
            "district": "Hassan",
            "division": "Hassan",
            "region": "South Karnataka",
            "block": "Arkalgud",
            "state": "Karnataka",
            "country": "India",
            "pincode": "573133"
        },
        ...
    ]
}
All the above api endopints are samples only and not exact matches, actual response/requests, please check in postman app.
Caution: The data is strictly for UI testing, learning & training purpose only. No reletion with any of the live scenario.