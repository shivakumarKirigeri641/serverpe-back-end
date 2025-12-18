Create a api documentation for mock train reservation .docx file or .pdf file.
Requirements are as follows:
mock train reservation apis

GET method Explanation:
api endpiont:/mockapis/serverpeuser/api/mocktrain/reserved/stations
method: get
Description:Fetches list of all available stations with id, zone, address, code, name etc.
response sample:
 "success": true,
    "data": [
        {
            "id": 41,
            "code": "ACND",
            "station_name": "A N DEV NAGAR",
            "zone": "NR",
            "address": "Amanigunj, Faizabad, Uttar Pradesh, In.."
        },
        {
            "id": 338,
            "code": "ASBS",
            "station_name": "A S BHALE SULTN",
            "zone": "NR",
            "address": "Misharauli, Uttar Pradesh, India"
        },
        {
            "id": 14,
            "code": "ABB",
            "station_name": "ABADA",
            "zone": "SER",
            "address": "Dhulagori, Howrah, West Bengal 711313,.."
        },
		...
].
api endpiont:/mockapis/serverpeuser/api/mocktrain/reserved/coach-type
method: get
Description:Fetches list of all available coaches code, name etc.
response sample:
 {
    "success": true,
    "data": [
        {
            "coach_code": "1A",
            "coach_name": "First AC"
        },
        {
            "coach_code": "2A",
            "coach_name": "Second AC"
        },
        {
            "coach_code": "3A",
            "coach_name": "Third AC"
        },
        {
            "coach_code": "E3",
            "coach_name": "Third AC Economy"
        },
        {
            "coach_code": "EA",
            "coach_name": "Executive Anubhuti Class"
        },
        {
            "coach_code": "FC",
            "coach_name": "First Class"
        },
        {
            "coach_code": "CC",
            "coach_name": "AC Chair Car"
        },
        {
            "coach_code": "EC",
            "coach_name": "Executive Chair Car"
        },
        {
            "coach_code": "SL",
            "coach_name": "Sleeper Class"
        },
        {
            "coach_code": "2S",
            "coach_name": "Second Sitting"
        }
    ]
}
api endpiont:/mockapis/serverpeuser/api/mocktrain/reserved/reservation-type
method: get
Description:Fetches list of all available reservation-types with type_code, description.
response sample:
 {
    "success": true,
    "data": [
        {
            "type_code": "GEN",
            "description": "General"
        },
        {
            "type_code": "TTL",
            "description": "Tatkal Lower"
        },
        {
            "type_code": "PTL",
            "description": "Premium Tatkal Lower"
        },
        {
            "type_code": "LADIES",
            "description": "Ladies Lower Berth"
        },
        {
            "type_code": "PWD",
            "description": "Person With Disability Lower Berth"
        },
        {
            "type_code": "DUTY",
            "description": "Person with railway duty"
        },
        {
            "type_code": "SENIOR",
            "description": "Senior citizen"
        }
    ]
}
The above all GET apis must be called when you load your UI during your development of mock sample train reservation.
----------------------------------------------------------------------------------------------------------------------
POST method Explanation:
These apis must be called sequentially mentioned.
Sequence 1:
api endpoint:/mockapis/serverpeuser/api/mocktrain/reserved/search-trains
method:POST
description:This api fetches the all available trains list for the give source_code, destination_cod and Date_of_journey
Sample request body:
{        
    "source_code": "ypr",
    "destination_code": "hvr",
    "doj": "2025-12-23",
    "coach_type":null,
    "reservation_type":null    
}
The above mentioned parameters are required to get the train list with all seat & status details.
Note: as list is huge, I am showing 2 trains information for sample response.
Sample response you get:
"success": true,
    "remaining_calls": 69,
    "data": {
        "source": "YESVANTPUR JN",
        "source_code": "YPR",
        "destination": "HAVERI",
        "destination_code": "HVR",
        "date_of_journey": "2025-12-23",
        "trains_list": [
            {
                "train_number": "17391",
                "train_name": "SBC UBL EXP",
                "train_type": "Mail Express",
                "station_from": "KSR BANGALORE CY JN",
                "station_to": "HUBBALLI JN",
                "source_code": "YPR",
                "destination_code": "HVR",
                "scheduled_departure": "00:27:00",
                "estimated_arrival": "06:48:00",
                "running_day": 1,
                "running_days": "S M T W T F S",
                "journey_duration": "6 hours 21 minutes",
                "distance": 388,
                "seat_count_gen_sl": "705",
                "seat_count_rac_sl": "101",
                "seat_count_rac_share_sl": "101",
                "seat_count_ttl_sl": "50",
                "seat_count_ptl_sl": "50",
                "seat_count_ladies_sl": "30",
                "seat_count_pwd_sl": "20",
                "seat_count_duty_sl": "20",
                "seat_count_senior_sl": "30",
                "seat_count_gen_3a": "-",
                "seat_count_rac_3a": "-",
                "seat_count_rac_share_3a": "-",
                "seat_count_ttl_3a": "-",
                "seat_count_ptl_3a": "-",
                "seat_count_ladies_3a": "-",
                "seat_count_pwd_3a": "-",
                "seat_count_duty_3a": "-",
                "seat_count_senior_3a": "-",
                "seat_count_gen_2a": "-",
                "seat_count_rac_2a": "-",
                "seat_count_ttl_2a": "-",
                "seat_count_ptl_2a": "-",
                "seat_count_ladies_2a": "-",
                "seat_count_pwd_2a": "-",
                "seat_count_senior_2a": "-",
                "seat_count_gen_1a": "-",
                "seat_count_rac_1a": "-",
                "seat_count_rac_share_1a": "-",
                "seat_count_ttl_1a": "-",
                "seat_count_ptl_1a": "-",
                "seat_count_ladies_1a": "-",
                "seat_count_pwd_1a": "-",
                "seat_count_duty_1a": "-",
                "seat_count_senior_1a": "-",
                "seat_count_gen_cc": "-",
                "seat_count_ttl_cc": "-",
                "seat_count_ptl_cc": "-",
                "seat_count_rac_cc": "-",
                "seat_count_rac_shared_cc": "-",
                "seat_count_ladies_cc": "-",
                "seat_count_pwd_cc": "-",
                "seat_count_duty_cc": "-",
                "seat_count_senior_cc": "-",
                "seat_count_gen_ec": "-",
                "seat_count_ttl_ec": "-",
                "seat_count_ptl_ec": "-",
                "seat_count_rac_ec": "-",
                "seat_count_rac_shared_ec": "-",
                "seat_count_ladies_ec": "-",
                "seat_count_pwd_ec": "-",
                "seat_count_senior_ec": "-",
                "seat_count_gen_ea": "-",
                "seat_count_ttl_ea": "-",
                "seat_count_ptl_ea": "-",
                "seat_count_ladies_ea": "-",
                "seat_count_pwd_ea": "-",
                "seat_count_senior_ea": "-",
                "seat_count_gen_e3": "-",
                "seat_count_ttl_e3": "-",
                "seat_count_ptl_e3": "-",
                "seat_count_ladies_e3": "-",
                "seat_count_pwd_e3": "-",
                "seat_count_senior_e3": "-",
                "seat_count_gen_fc": "-",
                "seat_count_ttl_fc": "-",
                "seat_count_ptl_fc": "-",
                "seat_count_ladies_fc": "-",
                "seat_count_pwd_fc": "-",
                "seat_count_senior_fc": "-",
                "seat_count_duty_fc": "-",
                "seat_count_gen_2s": "-",
                "seat_count_ttl_2s": "-",
                "seat_count_ptl_2s": "-",
                "seat_count_ladies_2s": "-",
                "seat_count_pwd_2s": "-",
                "seat_count_senior_2s": "-",
                "fare_gen_sl": "388.00",
                "fare_ttl_sl": "638.00",
                "fare_ptl_sl": "788.00",
                "fare_pwd_sl": "155.200",
                "fare_senior_sl": "194.000",
                "fare_gen_3a": "-",
                "fare_ttl_3a": "-",
                "fare_ptl_3a": "-",
                "fare_pwd_3a": "-",
                "fare_senior_3a": "-",
                "fare_gen_2a": "-",
                "fare_ttl_2a": "-",
                "fare_ptl_2a": "-",
                "fare_pwd_2a": "-",
                "fare_senior_2a": "-",
                "fare_gen_1a": "-",
                "fare_ttl_1a": "-",
                "fare_ptl_1a": "-",
                "fare_pwd_1a": "-",
                "fare_senior_1a": "-",
                "fare_gen_cc": "-",
                "fare_ttl_cc": "-",
                "fare_ptl_cc": "-",
                "fare_pwd_cc": "-",
                "fare_senior_cc": "-",
                "fare_gen_ec": "-",
                "fare_ttl_ec": "-",
                "fare_ptl_ec": "-",
                "fare_pwd_ec": "-",
                "fare_senior_ec": "-",
                "fare_gen_ea": "-",
                "fare_ttl_ea": "-",
                "fare_ptl_ea": "-",
                "fare_pwd_ea": "-",
                "fare_senior_ea": "-",
                "fare_gen_e3": "-",
                "fare_ttl_e3": "-",
                "fare_ptl_e3": "-",
                "fare_pwd_e3": "-",
                "fare_senior_e3": "-",
                "fare_gen_fc": "-",
                "fare_ttl_fc": "-",
                "fare_ptl_fc": "-",
                "fare_pwd_fc": "-",
                "fare_senior_fc": "-",
                "fare_gen_2s": "-",
                "fare_ttl_2s": "-",
                "fare_ptl_2s": "-",
                "fare_pwd_2s": "-",
                "fare_senior_2s": "-"
            },
            {
                "train_number": "12079",
                "train_name": "JANSHATABDI EXP",
                "train_type": "Janshatabdi Express",
                "station_from": "KSR BANGALORE CY JN",
                "station_to": "HUBBALLI JN",
                "source_code": "YPR",
                "destination_code": "HVR",
                "scheduled_departure": "06:12:00",
                "estimated_arrival": "11:14:00",
                "running_day": 1,
                "running_days": "S M T W T F S",
                "journey_duration": "5 hours 2 minutes",
                "distance": 388,
                "seat_count_gen_sl": "-",
                "seat_count_rac_sl": "-",
                "seat_count_rac_share_sl": "-",
                "seat_count_ttl_sl": "-",
                "seat_count_ptl_sl": "-",
                "seat_count_ladies_sl": "-",
                "seat_count_pwd_sl": "-",
                "seat_count_duty_sl": "-",
                "seat_count_senior_sl": "-",
                "seat_count_gen_3a": "-",
                "seat_count_rac_3a": "-",
                "seat_count_rac_share_3a": "-",
                "seat_count_ttl_3a": "-",
                "seat_count_ptl_3a": "-",
                "seat_count_ladies_3a": "-",
                "seat_count_pwd_3a": "-",
                "seat_count_duty_3a": "-",
                "seat_count_senior_3a": "-",
                "seat_count_gen_2a": "-",
                "seat_count_rac_2a": "-",
                "seat_count_ttl_2a": "-",
                "seat_count_ptl_2a": "-",
                "seat_count_ladies_2a": "-",
                "seat_count_pwd_2a": "-",
                "seat_count_senior_2a": "-",
                "seat_count_gen_1a": "-",
                "seat_count_rac_1a": "-",
                "seat_count_rac_share_1a": "-",
                "seat_count_ttl_1a": "-",
                "seat_count_ptl_1a": "-",
                "seat_count_ladies_1a": "-",
                "seat_count_pwd_1a": "-",
                "seat_count_duty_1a": "-",
                "seat_count_senior_1a": "-",
                "seat_count_gen_cc": "154",
                "seat_count_ttl_cc": "19",
                "seat_count_ptl_cc": "19",
                "seat_count_rac_cc": "-",
                "seat_count_rac_shared_cc": "-",
                "seat_count_ladies_cc": "-",
                "seat_count_pwd_cc": "-",
                "seat_count_duty_cc": "-",
                "seat_count_senior_cc": "-",
                "seat_count_gen_ec": "-",
                "seat_count_ttl_ec": "-",
                "seat_count_ptl_ec": "-",
                "seat_count_rac_ec": "-",
                "seat_count_rac_shared_ec": "-",
                "seat_count_ladies_ec": "-",
                "seat_count_pwd_ec": "-",
                "seat_count_senior_ec": "-",
                "seat_count_gen_ea": "-",
                "seat_count_ttl_ea": "-",
                "seat_count_ptl_ea": "-",
                "seat_count_ladies_ea": "-",
                "seat_count_pwd_ea": "-",
                "seat_count_senior_ea": "-",
                "seat_count_gen_e3": "-",
                "seat_count_ttl_e3": "-",
                "seat_count_ptl_e3": "-",
                "seat_count_ladies_e3": "-",
                "seat_count_pwd_e3": "-",
                "seat_count_senior_e3": "-",
                "seat_count_gen_fc": "-",
                "seat_count_ttl_fc": "-",
                "seat_count_ptl_fc": "-",
                "seat_count_ladies_fc": "-",
                "seat_count_pwd_fc": "-",
                "seat_count_senior_fc": "-",
                "seat_count_duty_fc": "-",
                "seat_count_gen_2s": "1037",
                "seat_count_ttl_2s": "130",
                "seat_count_ptl_2s": "130",
                "seat_count_ladies_2s": "-",
                "seat_count_pwd_2s": "-",
                "seat_count_senior_2s": "-",
                "fare_gen_sl": "-",
                "fare_ttl_sl": "-",
                "fare_ptl_sl": "-",
                "fare_pwd_sl": "-",
                "fare_senior_sl": "-",
                "fare_gen_3a": "-",
                "fare_ttl_3a": "-",
                "fare_ptl_3a": "-",
                "fare_pwd_3a": "-",
                "fare_senior_3a": "-",
                "fare_gen_2a": "-",
                "fare_ttl_2a": "-",
                "fare_ptl_2a": "-",
                "fare_pwd_2a": "-",
                "fare_senior_2a": "-",
                "fare_gen_1a": "-",
                "fare_ttl_1a": "-",
                "fare_ptl_1a": "-",
                "fare_pwd_1a": "-",
                "fare_senior_1a": "-",
                "fare_gen_cc": "776.00",
                "fare_ttl_cc": "1176.00",
                "fare_ptl_cc": "1376.00",
                "fare_pwd_cc": "-",
                "fare_senior_cc": "-",
                "fare_gen_ec": "-",
                "fare_ttl_ec": "-",
                "fare_ptl_ec": "-",
                "fare_pwd_ec": "-",
                "fare_senior_ec": "-",
                "fare_gen_ea": "-",
                "fare_ttl_ea": "-",
                "fare_ptl_ea": "-",
                "fare_pwd_ea": "-",
                "fare_senior_ea": "-",
                "fare_gen_e3": "-",
                "fare_ttl_e3": "-",
                "fare_ptl_e3": "-",
                "fare_pwd_e3": "-",
                "fare_senior_e3": "-",
                "fare_gen_fc": "-",
                "fare_ttl_fc": "-",
                "fare_ptl_fc": "-",
                "fare_pwd_fc": "-",
                "fare_senior_fc": "-",
                "fare_gen_2s": "194.00",
                "fare_ttl_2s": "444.00",
                "fare_ptl_2s": "594.00",
                "fare_pwd_2s": "-",
                "fare_senior_2s": "-"
            },
		]
	}
Note: the response parameter 'Remaining_calls' is the notification that how many api calls you can make or remaining.
Specific parameter descriptions other then understandable parameters are as follows:
"seat_count_gen_sl": "-",->General sleeper seat count.('-' tells not applicable (NA))
"seat_count_rac_sl": "-",->RAC sleeper seat count.('-' tells not applicable (NA))
"seat_count_ttl_sl": "-",->Tatkal sleeper seat count.('-' tells not applicable (NA))
"seat_count_ptl_sl": "-",->Premium Tatkal sleeper seat count.('-' tells not applicable (NA))
"seat_count_ladies_sl": "-",->General sleeper seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_sl": "-",->General sleeper seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_duty_sl": "-",->General sleeper seat count for duty staffs.('-' tells not applicable (NA))
"seat_count_senior_sl": "-",->General sleeper seat count for senior citizens.('-' tells not applicable (NA))
"seat_count_gen_3a": "-",->General Third AC seat count.('-' tells not applicable (NA))
"seat_count_rac_3a": "-",->RAC Third AC seat count.('-' tells not applicable (NA))
"seat_count_ttl_3a": "-",->Tatkal Third AC seat count.('-' tells not applicable (NA))
"seat_count_ptl_3a": "-",->Premium Tatkal Third AC seat count.('-' tells not applicable (NA))
"seat_count_ladies_3a": "-",->General Third AC seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_3a": "-",->General Third AC seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_duty_3a": "-",->General Third AC seat count for duty staffs.('-' tells not applicable (NA))
"seat_count_senior_3a": "-",->General Third AC seat count for senior citizens.('-' tells not applicable (NA))
"seat_count_gen_2a": "-",->General Second AC seat count.('-' tells not applicable (NA))
"seat_count_ttl_2a": "-",->Tatkal Second AC seat count.('-' tells not applicable (NA))
"seat_count_ptl_2a": "-",->Premium Tatkal Second AC seat count.('-' tells not applicable (NA))
"seat_count_ladies_2a": "-",->General Second AC seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_2a": "-",->General Second AC seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_senior_2a": "-",->General Second AC seat count for senior citizens.('-' tells not applicable (NA))
"seat_count_gen_1a": "-",->General First class AC seat count.('-' tells not applicable (NA))
"seat_count_rac_1a": "-",->RAC First class AC seat count.('-' tells not applicable (NA))
"seat_count_ttl_1a": "-",->Tatkal First class AC seat count.('-' tells not applicable (NA))
"seat_count_ptl_1a": "-",->Premium Tatkal First class AC seat count.('-' tells not applicable (NA))
"seat_count_ladies_1a": "-",->General First class AC seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_1a": "-",->General First class AC seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_duty_1a": "-",->General First class AC seat count for duty staffs.('-' tells not applicable (NA))
"seat_count_senior_1a": "-",->General First class AC seat count for senior citizens.('-' tells not applicable (NA))
"seat_count_gen_cc": "-",->General AC chair car seat count.('-' tells not applicable (NA))
"seat_count_rac_cc": "-",->RAC AC chair car seat count.('-' tells not applicable (NA))
"seat_count_ttl_cc": "-",->Tatkal AC chair car seat count.('-' tells not applicable (NA))
"seat_count_ptl_cc": "-",->Premium Tatkal AC chair car seat count.('-' tells not applicable (NA))
"seat_count_ladies_cc": "-",->General AC chair car seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_cc": "-",->General AC chair car seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_duty_cc": "-",->General AC chair car seat count for duty staffs.('-' tells not applicable (NA))
"seat_count_senior_cc": "-",->General AC chair car seat count for senior citizens.('-' tells not applicable (NA))
"seat_count_gen_ec": "-",->General AC Economic chair car seat count.('-' tells not applicable (NA))
"seat_count_rac_ec": "-",->RAC AC Economic chair car seat count.('-' tells not applicable (NA))
"seat_count_rac_share_ec": "-",->RAC (sharing seat) AC Economic chair car seat count.('-' tells not applicable (NA))
"seat_count_ttl_ec": "-",->Tatkal AC Economic chair car seat count.('-' tells not applicable (NA))
"seat_count_ptl_ec": "-",->Premium Tatkal AC Economic chair car seat count.('-' tells not applicable (NA))
"seat_count_ladies_ec": "-",->General AC Economic chair car seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_ec": "-",->General AC Economic chair car seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_duty_ec": "-",->General AC Economic chair car seat count for duty staffs.('-' tells not applicable (NA))
"seat_count_senior_ec": "-",->General AC Economic chair car seat count for senior citizens.('-' tells not applicable (NA))
"seat_count_gen_ea": "-",->General Executive Anubhuti seat count.('-' tells not applicable (NA))
"seat_count_rac_ea": "-",->RAC Executive Anubhuti seat count.('-' tells not applicable (NA))
"seat_count_rac_share_ea": "-",->RAC (sharing seat) Executive Anubhuti seat count.('-' tells not applicable (NA))
"seat_count_ttl_ea": "-",->Tatkal Executive Anubhuti seat count.('-' tells not applicable (NA))
"seat_count_ptl_ea": "-",->Premium Tatkal Executive Anubhuti seat count.('-' tells not applicable (NA))
"seat_count_ladies_ea": "-",->General Executive Anubhuti seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_ea": "-",->General Executive Anubhuti seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_duty_ea": "-",->General Executive Anubhuti seat count for duty staffs.('-' tells not applicable (NA))
"seat_count_senior_ea": "-",->General Executive Anubhuti seat count for senior citizens.('-' tells not applicable (NA))
"seat_count_gen_e3": "-",->General AC Three-Tier economy seat count.('-' tells not applicable (NA))
"seat_count_rac_e3": "-",->RAC AC Three-Tier economy seat count.('-' tells not applicable (NA))
"seat_count_rac_share_e3": "-",->RAC (sharing seat) AC Three-Tier economy seat count.('-' tells not applicable (NA))
"seat_count_ttl_e3": "-",->Tatkal AC Three-Tier economy seat count.('-' tells not applicable (NA))
"seat_count_ptl_e3": "-",->Premium Tatkal AC Three-Tier economy seat count.('-' tells not applicable (NA))
"seat_count_ladies_e3": "-",->General AC Three-Tier economy seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_e3": "-",->General AC Three-Tier economy seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_duty_e3": "-",->General AC Three-Tier economy seat count for duty staffs.('-' tells not applicable (NA))
"seat_count_senior_e3": "-",->General AC Three-Tier economy seat count for senior citizens.('-' tells not applicable (NA))
"seat_count_gen_fc": "-",->General First class non_AC seat count.('-' tells not applicable (NA))
"seat_count_rac_fc": "-",->RAC First class non_AC seat count.('-' tells not applicable (NA))
"seat_count_rac_share_fc": "-",->RAC (sharing seat) First class non_AC seat count.('-' tells not applicable (NA))
"seat_count_ttl_fc": "-",->Tatkal First class non_AC seat count.('-' tells not applicable (NA))
"seat_count_ptl_fc": "-",->Premium Tatkal First class non_AC seat count.('-' tells not applicable (NA))
"seat_count_ladies_fc": "-",->General First class non_AC seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_fc": "-",->General First class non_AC seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_duty_fc": "-",->General First class non_AC seat count for duty staffs.('-' tells not applicable (NA))
"seat_count_senior_fc": "-",->General First class non_AC seat count for senior citizens.('-' tells not applicable (NA))
"seat_count_gen_fc": "-",->General Second-Class seat count.('-' tells not applicable (NA))
"seat_count_rac_2s": "-",->RAC Second-Class seat count.('-' tells not applicable (NA))
"seat_count_rac_share_2s": "-",->RAC (sharing seat) Second-Class seat count.('-' tells not applicable (NA))
"seat_count_ttl_2s": "-",->Tatkal Second-Class seat count.('-' tells not applicable (NA))
"seat_count_ptl_2s": "-",->Premium Tatkal Second-Class seat count.('-' tells not applicable (NA))
"seat_count_ladies_2s": "-",->General Second-Class seat count for ladies.('-' tells not applicable (NA))
"seat_count_pwd_2s": "-",->General Second-Class seat count for physically handicapped.('-' tells not applicable (NA))
"seat_count_duty_2s": "-",->General Second-Class seat count for duty staffs.('-' tells not applicable (NA))
"seat_count_senior_2s": "-",->General Second-Class seat count for senior citizens.('-' tells not applicable (NA))
"fare_gen_sl": "-",->General Fare for sleeper coach.('-' tells not applicable (NA))
"fare_ttl_sl": "-",->Tatkal Fare for sleeper coach.('-' tells not applicable (NA))
"fare_ptl_sl": "-",->Premium Tatkal Fare for sleeper coach.('-' tells not applicable (NA))
"fare_pwd_sl": "-",->General Fare for sleeper coach physically handicapped.('-' tells not applicable (NA))
"fare_senior_sl": "-",->General Fare for sleeper coach senior citizens.('-' tells not applicable (NA))
"fare_gen_3a": "-",->General Fare for third ac.('-' tells not applicable (NA))
"fare_ttl_3a": "-",->Tatkal Fare for third ac.('-' tells not applicable (NA))
"fare_ptl_3a": "-",->Premium Tatkal Fare for third ac.('-' tells not applicable (NA))
"fare_pwd_3a": "-",->General Fare for third ac physically handicapped.('-' tells not applicable (NA))
"fare_senior_3a": "-",->General Fare for third ac senior citizens.('-' tells not applicable (NA))
"fare_gen_2a": "-",->General Fare for second ac.('-' tells not applicable (NA))
"fare_ttl_2a": "-",->Tatkal Fare for second ac.('-' tells not applicable (NA))
"fare_ptl_2a": "-",->Premium Tatkal Fare for second ac.('-' tells not applicable (NA))
"fare_pwd_2a": "-",->General Fare for second ac physically handicapped.('-' tells not applicable (NA))
"fare_senior_2a": "-",->General Fare for second ac senior citizens.('-' tells not applicable (NA))
"fare_gen_1a": "-",->General Fare for first class ac.('-' tells not applicable (NA))
"fare_ttl_1a": "-",->Tatkal Fare for first class ac.('-' tells not applicable (NA))
"fare_ptl_1a": "-",->Premium Tatkal Fare for first class ac.('-' tells not applicable (NA))
"fare_pwd_1a": "-",->General Fare for first class ac physically handicapped.('-' tells not applicable (NA))
"fare_senior_1a": "-",->General Fare for first class ac senior citizens.('-' tells not applicable (NA))
"fare_gen_cc": "-",->General Fare for AC chair car.('-' tells not applicable (NA))
"fare_ttl_cc": "-",->Tatkal Fare for AC chair car.('-' tells not applicable (NA))
"fare_ptl_cc": "-",->Premium Tatkal Fare for AC chair car.('-' tells not applicable (NA))
"fare_pwd_cc": "-",->General Fare for AC chair car physically handicapped.('-' tells not applicable (NA))
"fare_senior_cc": "-",->General Fare for AC chair car senior citizens.('-' tells not applicable (NA))
"fare_gen_ec": "-",->General Fare for AC economic chair car.('-' tells not applicable (NA))
"fare_ttl_ec": "-",->Tatkal Fare for AC economic chair car.('-' tells not applicable (NA))
"fare_ptl_ec": "-",->Premium Tatkal Fare for AC economic chair car.('-' tells not applicable (NA))
"fare_pwd_ec": "-",->General Fare for AC economic chair car physically handicapped.('-' tells not applicable (NA))
"fare_senior_ec": "-",->General Fare for AC economic chair car senior citizens.('-' tells not applicable (NA))
"fare_gen_ea": "-",->General Fare for Executive Anubhuti.('-' tells not applicable (NA))
"fare_ttl_ea": "-",->Tatkal Fare for Executive Anubhuti.('-' tells not applicable (NA))
"fare_ptl_ea": "-",->Premium Tatkal Fare for Executive Anubhuti.('-' tells not applicable (NA))
"fare_pwd_ea": "-",->General Fare for Executive Anubhuti physically handicapped.('-' tells not applicable (NA))
"fare_senior_ea": "-",->General Fare for Executive Anubhuti senior citizens.('-' tells not applicable (NA))
"fare_gen_e3": "-",->General Fare for AC 3 tier economic.('-' tells not applicable (NA))
"fare_ttl_e3": "-",->Tatkal Fare for AC 3 tier economic.('-' tells not applicable (NA))
"fare_ptl_e3": "-",->Premium Tatkal Fare for AC 3 tier economic.('-' tells not applicable (NA))
"fare_pwd_e3": "-",->General Fare for AC 3 tier economic physically handicapped.('-' tells not applicable (NA))
"fare_senior_e3": "-",->General Fare for AC 3 tier economic senior citizens.('-' tells not applicable (NA))
"fare_gen_fc": "-",->General Fare for First class non-AC.('-' tells not applicable (NA))
"fare_ttl_fc": "-",->Tatkal Fare for First class non-AC.('-' tells not applicable (NA))
"fare_ptl_fc": "-",->Premium Tatkal Fare for First class non-AC.('-' tells not applicable (NA))
"fare_pwd_fc": "-",->General Fare for First class non-AC physically handicapped.('-' tells not applicable (NA))
"fare_senior_fc": "-",->General Fare for First class non-AC senior citizens.('-' tells not applicable (NA))
"fare_gen_fc": "-",->General Fare for Second sitting.('-' tells not applicable (NA))
"fare_ttl_2s": "-",->Tatkal Fare for Second sitting.('-' tells not applicable (NA))
"fare_ptl_2s": "-",->Premium Tatkal Fare for Second sitting.('-' tells not applicable (NA))
"fare_pwd_2s": "-",->General Fare for Second sitting physically handicapped.('-' tells not applicable (NA))
"fare_senior_2s": "-",->General Fare for Second sitting senior citizens.('-' tells not applicable (NA))
Note:These are the sample response parameters, actual response you can go through using  postman. Its upto your whether you show 'NA' or hide them whicever are not applicable.
-------------------------------------------------------------------------------
Sequence 2:
api endpoint:/mockapis/serverpeuser/api/mocktrain/reserved/proceed-booking
method:POST
description:Select the train which you want and the call this api & this must be called after selecting the train information from above api response.
Sample request body:
{
    "train_number": "17391",
    "doj": "2025-12-23",
    "coach_type": "sl",
    "source_code": "ypr",
    "destination_code": "hvr",
    "mobile_number": "98********",
    "reservation_type": "gen",
    "passenger_details": [
        {
            "passenger_name":"blabla",
            "passenger_gender":"M",
            "passenger_age":36,
            "passenger_ischild": false,
            "passenger_issenior": false
        }

    ]
}
The above mentioned parameters are required to get the summary of reservation.
Sample response you get:
{
    "success": true,
    "remaining_calls": 68,
    "data": {
        "booked_details": {
            "id": 62,
            "fktrain_number": 1641,
            "date_of_journey": "2025-12-23",
            "fksource_code": 8918,
            "fkdestination_code": 3239,
            "fkreservation_type": 1,
            "fkcoach_type": 9,
            "mobile_number": "98********",
            "proceed_status": false,
            "adult_count": 1,
            "child_count": 0,
            "fkboarding_at": 8918,
            "created_at": "2025-12-18T09:38:25.118Z",
            "updated_at": "2025-12-18T09:38:25.118Z",
            "pnr": null,
            "pnr_status": null,
            "ticket_expiry_status": false,
            "train_number": "17391",
            "coach_code": "SL",
            "type_code": "GEN",
            "source_code": "YPR",
            "source_name": "YESVANTPUR JN",
            "destination_code": "HVR",
            "destination_name": "HAVERI",
            "boarding_point": "YPR",
            "boarding_point_name": "YESVANTPUR JN"
        },
        "passenger_details": [
            {
                "id": 1071693,
                "fkbookingdata": 62,
                "p_name": "blabla",
                "p_age": 36,
                "p_gender": "M",
                "preferred_berth": null,
                "seat_status": null,
                "created_at": "2025-12-18T09:38:25.118Z",
                "updated_at": "2025-12-18T09:38:25.118Z",
                "current_seat_status": null,
                "updated_seat_status": null,
                "is_child": false,
                "is_senior": false,
                "is_adult": true,
                "base_fare": null,
                "cancellation_status": false,
                "refund_amount": null
            }
        ],
        "fare_details": {
            "base_fare": 388,
            "GST": "18.00",
            "convience": "1.30",
            "gross_fare": 462.884
        }
    }
}
Note:you get all summary details with fare calculations
-----------------------------------------------------------------------------
-------------------------------------------------------------------------------
Sequence 3:
api endpoint:/mockapis/serverpeuser/api/mocktrain/reserved/confirm-ticket
method:POST
description:Enter the id number you got from above api response. Calling this api is nothing but confirm & pay booking option/button. Dont' worry, payment is fake here.
request body:
{
    "booking_id":62,
    "can_send_mock_ticket_sms":true
}
Parameters: booking_id is mandatory to be provided with proper id obtained from previous api call( sequence 2).
can_send_mock_ticket_sms parmeter is to get the sms of mock confirmation ticket to your mentioned mobile number in sequence 2, set false otherwise.
sample response:
{
    "success": true,
    "remaining_calls": 67,
    "data": {
        "result_updated_bookingdetails": {
            "id": 62,
            "fktrain_number": 1641,
            "date_of_journey": "2025-12-23",
            "fksource_code": 8918,
            "fkdestination_code": 3239,
            "fkreservation_type": 1,
            "fkcoach_type": 9,
            "mobile_number": "9886122415",
            "proceed_status": true,
            "adult_count": 1,
            "child_count": 0,
            "fkboarding_at": 8918,
            "created_at": "2025-12-18T09:38:25.118Z",
            "updated_at": "2025-12-18T09:38:25.118Z",
            "pnr": "PNR001520",
            "pnr_status": "CNF",
            "ticket_expiry_status": false,
            "train_number": "17391",
            "train_name": "SBC UBL EXP",
            "coach_code": "SL",
            "type_code": "GEN",
            "source_code": "YPR",
            "source_name": "YESVANTPUR JN",
            "destination_code": "HVR",
            "destination_name": "HAVERI",
            "scheduled_departure": "00:27:00",
            "estimated_arrival": "06:48:00",
            "boarding_point": "YPR",
            "boarding_point_name": "YESVANTPUR JN"
        },
        "result_udpated_passengerdetails": [
            {
                "id": 1071693,
                "fkbookingdata": 62,
                "p_name": "Amruta",
                "p_age": 36,
                "p_gender": "F",
                "preferred_berth": null,
                "seat_status": "CNF",
                "created_at": "2025-12-18T09:38:25.118Z",
                "updated_at": "2025-12-18T09:38:25.118Z",
                "current_seat_status": "SL10/57/LB",
                "updated_seat_status": "SL10/57/LB",
                "is_child": false,
                "is_senior": false,
                "is_adult": true,
                "base_fare": "388",
                "cancellation_status": false,
                "refund_amount": null
            }
        ],
        "fare_details": {
            "base_fare": 388,
            "GST": "18.00",
            "convience": "1.30",
            "gross_fare": 462.884
        }
    }
}
Hope you know the response parameters as name indicates.
--------------------------------------------------------------------------------------
The following apis can be called independently.
api endpoint:/mockapis/serverpeuser/api/mocktrain/reserved/pnr-status
method:POST
description:Enter the id number you got from above api response. Calling this api is nothing but confirm & pay booking option/button. Dont' worry, payment is fake here.
request body:
{
    "pnr":"PNR001520",
}
Note:you need to pass pnr number after your confirmation booking done, otherwise it shows invalid pnr.
response:
{
    "success": true,
    "remaining_calls": 66,
    "data": {
        "id": 1071630,
        "train_number": "17310",
        "source_code": "UBL",
        "destination_code": "DVG",
        "coach_code": "SL",
        "type_code": "GEN",
        "date_of_journey": "2025-12-06",
        "mobile_number": "9876543210",
        "p_name": "Shiva",
        "p_gender": "M",
        "p_age": 33,
        "is_senior": false,
        "is_child": false,
        "base_fare": "144",
        "refund_amount": null,
        "current_seat_status": "SL7/72/SU",
        "updated_seat_status": "SL7/72/SU",
        "cancellation_status": false
    }
}
--------------------------------------------------------------------------------------
api endpoint:/mockapis/serverpeuser/api/mocktrain/reserved/booking-history
method:POST
description:Enter the mobile number to get the booking history. The mobile number you have given at the time of proceed-booking (sequence 2), need to be given here.
request body:
{
    "mobile_number":"98********",
}
response:
{
    "success": true,
    "remaining_calls": 64,
    "data": {
        "status": 200,
        "success": true,
        "data": [
            {
                "id": 58,
                "fktrain_number": 1641,
                "date_of_journey": "2025-12-23",
                "fksource_code": 8918,
                "fkdestination_code": 3239,
                "fkreservation_type": 1,
                "fkcoach_type": 9,
                "mobile_number": "98********",
                "proceed_status": true,
                "adult_count": 1,
                "child_count": 0,
                "fkboarding_at": 8918,
                "created_at": "2025-12-17T06:52:57.800Z",
                "updated_at": "2025-12-17T06:52:57.800Z",
                "pnr": "PNR001523",
                "pnr_status": "CNF",
                "ticket_expiry_status": false,
                "train_number": "17391",
                "p_name": "Amruta",
                "p_gender": "F",
                "p_age": 36,
                "preferred_berth": null,
                "seat_status": "CNF",
                "current_seat_status": "SL10/58/MB",
                "updated_seat_status": "SL10/58/MB",
                "is_child": false,
                "is_senior": false,
                "base_fare": "388",
                "cancellation_status": false,
                "refund_amount": null,
                "coach_code": "SL",
                "type_code": "GEN",
                "source_code": "YPR",
                "source_name": "YESVANTPUR JN",
                "destination_code": "HVR",
                "destination_name": "HAVERI",
                "boarding_point": "YPR",
                "boarding_point_name": "YESVANTPUR JN"
            },
            {
                "id": 62,
                "fktrain_number": 1641,
                "date_of_journey": "2025-12-23",
                "fksource_code": 8918,
                "fkdestination_code": 3239,
                "fkreservation_type": 1,
                "fkcoach_type": 9,
                "mobile_number": "98********",
                "proceed_status": true,
                "adult_count": 1,
                "child_count": 0,
                "fkboarding_at": 8918,
                "created_at": "2025-12-18T09:38:25.118Z",
                "updated_at": "2025-12-18T09:38:25.118Z",
                "pnr": "PNR001520",
                "pnr_status": "CNF",
                "ticket_expiry_status": false,
                "train_number": "17391",
                "p_name": "Amruta",
                "p_gender": "F",
                "p_age": 36,
                "preferred_berth": null,
                "seat_status": "CNF",
                "current_seat_status": "SL10/57/LB",
                "updated_seat_status": "SL10/57/LB",
                "is_child": false,
                "is_senior": false,
                "base_fare": "388",
                "cancellation_status": false,
                "refund_amount": null,
                "coach_code": "SL",
                "type_code": "GEN",
                "source_code": "YPR",
                "source_name": "YESVANTPUR JN",
                "destination_code": "HVR",
                "destination_name": "HAVERI",
                "boarding_point": "YPR",
                "boarding_point_name": "YESVANTPUR JN"
            }
        ],
        "message": "Booking history fetched successfully!"
    }
}
Note: Its up to you how you can show the history page in your UI.
--------------------------------------------------------------------------------------
api endpoint:/mockapis/serverpeuser/api/mocktrain/reserved/cancel-ticket
method:POST
description:Enter the pnr number and id of a passenger(s) you got from above confirm-ticket api endpoint response. this will cancel the ticket for that mentioned passengers only.
request body:
{
    "pnr": "PNR001521",
    "passengerids":[
        1071674
    ]
}
Sample response:
{
    "success": true,
    "remaining_calls": 61,
    "data": {
        "result_bookingdata": {
            "id": 18,
            "train_number": "17391",
            "source_code": "SBC",
            "pnr_status": "CAN",
            "destination_code": "UBL",
            "coach_code": "SL",
            "type_code": "GEN",
            "date_of_journey": "2025-11-29",
            "mobile_number": "98*******"
        },
        "passenger_details": [
            {
                "id": 1071632,
                "fkbookingdata": 18,
                "p_name": "jkl",
                "p_age": 66,
                "p_gender": "M",
                "preferred_berth": null,
                "seat_status": "CNF",
                "created_at": "2025-11-25T12:58:56.580Z",
                "updated_at": "2025-11-25T12:58:56.580Z",
                "current_seat_status": "SL1/30/UB",
                "updated_seat_status": "SL1/30/UB",
                "is_child": false,
                "is_senior": true,
                "is_adult": false,
                "base_fare": "235",
                "cancellation_status": true,
                "refund_amount": 235
            }
        ]
    }
}
--------------------------------------------------------------------------------------
api endpoint:/mockapis/serverpeuser/api/mocktrain/reserved/train-schedule
method:POST
description:Enter the train number and you will get the train schedule full details.
request body:
{
    "train_number": "11312"
}
Sample response:
{
    "success": true,
    "remaining_calls": 56,
    "data": {
        "train_details": {
            "train_number": "11312",
            "train_name": "SOLAPUR EXP",
            "train_type": "Mail Express",
            "zone": "CR",
            "station_from": "HASSAN",
            "station_to": "SOLAPUR JN",
            "train_runs_on_mon": "Y",
            "train_runs_on_tue": "Y",
            "train_runs_on_wed": "Y",
            "train_runs_on_thu": "Y",
            "train_runs_on_fri": "Y",
            "train_runs_on_sat": "Y",
            "train_runs_on_sun": "Y"
        },
        "train_schedule_details": [
            {
                "station_sequence": 1,
                "kilometer": 0,
                "station_code": "HAS",
                "station_name": "HASSAN",
                "arrival": null,
                "departure": "16:05:00",
                "running_day": 1
            },
            {
                "station_sequence": 2,
                "kilometer": 42,
                "station_code": "SBGA",
                "station_name": "SHRAVANBELAGOLA",
                "arrival": "16:39:00",
                "departure": "16:40:00",
                "running_day": 1
            },
            {
                "station_sequence": 3,
                "kilometer": 76,
                "station_code": "BGNR",
                "station_name": "B.G. NAGAR",
                "arrival": "17:02:00",
                "departure": "17:03:00",
                "running_day": 1
            },
            {
                "station_sequence": 4,
                "kilometer": 91,
                "station_code": "YY",
                "station_name": "YEDIYURU",
                "arrival": "17:15:00",
                "departure": "17:16:00",
                "running_day": 1
            },
            {
                "station_sequence": 5,
                "kilometer": 108,
                "station_code": "KIGL",
                "station_name": "KUNIGAL",
                "arrival": "17:28:00",
                "departure": "17:29:00",
                "running_day": 1
            },
            {
                "station_sequence": 6,
                "kilometer": 153,
                "station_code": "NMGA",
                "station_name": "NELAMANGALA",
                "arrival": "17:59:00",
                "departure": "18:01:00",
                "running_day": 1
            },
            {
                "station_sequence": 7,
                "kilometer": 174,
                "station_code": "YPR",
                "station_name": "YESVANTPUR JN",
                "arrival": "19:50:00",
                "departure": "20:50:00",
                "running_day": 1
            },
            {
                "station_sequence": 8,
                "kilometer": 187,
                "station_code": "YNK",
                "station_name": "YELHANKA JN",
                "arrival": "21:09:00",
                "departure": "21:10:00",
                "running_day": 1
            },
            {
                "station_sequence": 9,
                "kilometer": 382,
                "station_code": "ATP",
                "station_name": "ANANTAPUR",
                "arrival": "00:08:00",
                "departure": "00:10:00",
                "running_day": 2
            },
            {
                "station_sequence": 10,
                "kilometer": 450,
                "station_code": "GTL",
                "station_name": "GUNTAKAL JN",
                "arrival": "01:13:00",
                "departure": "01:15:00",
                "running_day": 2
            },
            {
                "station_sequence": 11,
                "kilometer": 543,
                "station_code": "MALM",
                "station_name": "MANTHRALAYAM RD",
                "arrival": "02:28:00",
                "departure": "02:30:00",
                "running_day": 2
            },
            {
                "station_sequence": 12,
                "kilometer": 571,
                "station_code": "RC",
                "station_name": "RAICHUR",
                "arrival": "03:03:00",
                "departure": "03:05:00",
                "running_day": 2
            },
            {
                "station_sequence": 13,
                "kilometer": 640,
                "station_code": "YG",
                "station_name": "YADGIR",
                "arrival": "03:58:00",
                "departure": "04:00:00",
                "running_day": 2
            },
            {
                "station_sequence": 14,
                "kilometer": 679,
                "station_code": "WADI",
                "station_name": "WADI",
                "arrival": "05:15:00",
                "departure": "05:17:00",
                "running_day": 2
            },
            {
                "station_sequence": 15,
                "kilometer": 689,
                "station_code": "SDB",
                "station_name": "SHAHABAD",
                "arrival": "05:30:00",
                "departure": "05:32:00",
                "running_day": 2
            },
            {
                "station_sequence": 16,
                "kilometer": 715,
                "station_code": "KLBG",
                "station_name": "KALABURAGI JN",
                "arrival": "05:50:00",
                "departure": "05:55:00",
                "running_day": 2
            },
            {
                "station_sequence": 17,
                "kilometer": 828,
                "station_code": "SUR",
                "station_name": "SOLAPUR JN",
                "arrival": "08:10:00",
                "departure": null,
                "running_day": 2
            }
        ]
    }
}
Note: Names in parameter self explanatory.
-----------------------------------------------------------------------------------------------
api endpoint:/mockapis/serverpeuser/api/mocktrain/reserved/live-station
method:POST
description:This api gives  you list of trains which arrives and list of trains departs from mentioned station_code and at given next_hours from the current time.(next_hours can be 2, 4 or 8).
The response parameter 'status' tells you train status.
request body:
{
    "station_code":"MYS",
    "next_hours":2
}
Sample response:
{
    "success": true,
    "remaining_calls": 55,
    "data": {
        "trains_list": [
            {
                "train_number": "20624",
                "train_name": "MALGUDI EXP",
                "train_type": "Superfast Express",
                "station_from": "KSR BANGALORE CY JN",
                "station_to": "MYSORE JN",
                "station_name": "MYSORE JN",
                "arrival_time": "2025-12-18T10:50:00.000Z",
                "departure_time": null,
                "status": "Departed",
                "eta_hhmm": "00:29"
            },
            {
                "train_number": "16226",
                "train_name": "SMET MYS EXP",
                "train_type": "Mail Express",
                "station_from": "SHIMOGA TOWN",
                "station_to": "MYSORE JN",
                "station_name": "MYSORE JN",
                "arrival_time": "2025-12-18T11:20:00.000Z",
                "departure_time": null,
                "status": "Departed",
                "eta_hhmm": "00:59"
            },
            {
                "train_number": "16219",
                "train_name": "CMNR TPTY EXP",
                "train_type": "Mail Express",
                "station_from": "CHAMARAJANAGAR",
                "station_to": "TIRUPATI",
                "station_name": "MYSORE JN",
                "arrival_time": "2025-12-18T11:30:00.000Z",
                "departure_time": "2025-12-18T11:40:00.000Z",
                "status": "Yet to arrive",
                "eta_hhmm": "01:09"
            },
            {
                "train_number": "12614",
                "train_name": "WODEYAR EXPRESS",
                "train_type": "Superfast Express",
                "station_from": "KSR BANGALORE CY JN",
                "station_to": "MYSORE JN",
                "station_name": "MYSORE JN",
                "arrival_time": "2025-12-18T12:15:00.000Z",
                "departure_time": null,
                "status": "Departed",
                "eta_hhmm": "01:54"
            }
        ],
        "message": "Trains list fetched successfully!"
    }
}api endpoint:/mockapis/serverpeuser/api/mocktrain/reserved/train-live-running-status
method:POST
description:This api gives  where the mentioned train is from given train_number in request parameter.
The response parameter 'status' tells you train status.
request body:
{
    "train_number":"12080"
}
Sample response:
{
    "success": true,
    "remaining_calls": 54,
    "data": {
        "trains_list": [
            {
                "station_sequence": 1,
                "station_code": "UBL",
                "station_name": "HUBBALLI JN",
                "arrival_time": null,
                "departure_time": "2025-12-18 14:05:00",
                "kilometer": 0,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Departed",
                "km_ran_from_last_departed": 0,
                "km_remaining_to_next": 0,
                "eta_hours": "0",
                "eta_minutes": "0"
            },
            {
                "station_sequence": 2,
                "station_code": "HVR",
                "station_name": "HAVERI",
                "arrival_time": "2025-12-18 15:12:00",
                "departure_time": "2025-12-18 15:13:00",
                "kilometer": 76,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Departed",
                "km_ran_from_last_departed": 0,
                "km_remaining_to_next": 0,
                "eta_hours": "0",
                "eta_minutes": "0"
            },
            {
                "station_sequence": 3,
                "station_code": "RNR",
                "station_name": "RANIBENNUR",
                "arrival_time": "2025-12-18 15:39:00",
                "departure_time": "2025-12-18 15:40:00",
                "kilometer": 108,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Departed",
                "km_ran_from_last_departed": 0,
                "km_remaining_to_next": 23,
                "eta_hours": "0",
                "eta_minutes": "0"
            },
            {
                "station_sequence": 4,
                "station_code": "HRR",
                "station_name": "HARIHAR",
                "arrival_time": "2025-12-18 16:01:00",
                "departure_time": "2025-12-18 16:02:00",
                "kilometer": 131,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Yet to Arrive",
                "km_ran_from_last_departed": 23,
                "km_remaining_to_next": 0,
                "eta_hours": "0",
                "eta_minutes": "8"
            },
            {
                "station_sequence": 5,
                "station_code": "DVG",
                "station_name": "DAVANGERE",
                "arrival_time": "2025-12-18 16:16:00",
                "departure_time": "2025-12-18 16:18:00",
                "kilometer": 144,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Yet to Arrive",
                "km_ran_from_last_departed": 36,
                "km_remaining_to_next": 0,
                "eta_hours": "0",
                "eta_minutes": "23"
            },
            {
                "station_sequence": 6,
                "station_code": "JRU",
                "station_name": "CHIKJAJUR JN",
                "arrival_time": "2025-12-18 16:52:00",
                "departure_time": "2025-12-18 16:53:00",
                "kilometer": 190,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Yet to Arrive",
                "km_ran_from_last_departed": 82,
                "km_remaining_to_next": 0,
                "eta_hours": "0",
                "eta_minutes": "59"
            },
            {
                "station_sequence": 7,
                "station_code": "RRB",
                "station_name": "BIRUR JN",
                "arrival_time": "2025-12-18 17:39:00",
                "departure_time": "2025-12-18 17:40:00",
                "kilometer": 259,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Yet to Arrive",
                "km_ran_from_last_departed": 151,
                "km_remaining_to_next": 0,
                "eta_hours": "1",
                "eta_minutes": "46"
            },
            {
                "station_sequence": 8,
                "station_code": "ASK",
                "station_name": "ARSIKERE JN",
                "arrival_time": "2025-12-18 18:17:00",
                "departure_time": "2025-12-18 18:20:00",
                "kilometer": 304,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Yet to Arrive",
                "km_ran_from_last_departed": 196,
                "km_remaining_to_next": 0,
                "eta_hours": "2",
                "eta_minutes": "24"
            },
            {
                "station_sequence": 9,
                "station_code": "TTR",
                "station_name": "TIPTUR",
                "arrival_time": "2025-12-18 18:34:00",
                "departure_time": "2025-12-18 18:35:00",
                "kilometer": 330,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Yet to Arrive",
                "km_ran_from_last_departed": 222,
                "km_remaining_to_next": 0,
                "eta_hours": "2",
                "eta_minutes": "41"
            },
            {
                "station_sequence": 10,
                "station_code": "TK",
                "station_name": "TUMKUR",
                "arrival_time": "2025-12-18 19:28:00",
                "departure_time": "2025-12-18 19:30:00",
                "kilometer": 400,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Yet to Arrive",
                "km_ran_from_last_departed": 292,
                "km_remaining_to_next": 0,
                "eta_hours": "3",
                "eta_minutes": "35"
            },
            {
                "station_sequence": 11,
                "station_code": "YPR",
                "station_name": "YESVANTPUR JN",
                "arrival_time": "2025-12-18 20:25:00",
                "departure_time": "2025-12-18 20:27:00",
                "kilometer": 464,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Yet to Arrive",
                "km_ran_from_last_departed": 356,
                "km_remaining_to_next": 0,
                "eta_hours": "4",
                "eta_minutes": "32"
            },
            {
                "station_sequence": 12,
                "station_code": "SBC",
                "station_name": "KSR BANGALORE CY JN",
                "arrival_time": "2025-12-18 21:15:00",
                "departure_time": null,
                "kilometer": 470,
                "train_number": "12080",
                "runs_today": true,
                "train_status_at_station": "Yet to Arrive",
                "km_ran_from_last_departed": 362,
                "km_remaining_to_next": 0,
                "eta_hours": "5",
                "eta_minutes": "22"
            }
        ],
        "message": "Trains details fetched successfully!"
    }
}
-------------------------------------------------------------------------
All the above api endopints are samples only and not exact matches, actual response/requests, please check in postman app.
Caution: The data is strictly for UI testing, learning & training purpose only. No reletion with any of the live scenario.