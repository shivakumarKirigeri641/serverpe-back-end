const getRandomPassengers = (reservation_type = "GENERAL") => {
  const maleNames = [
    "Aarav",
    "Arjun",
    "Rohan",
    "Vikram",
    "Rahul",
    "Sanjay",
    "Karthik",
    "Ravi",
    "Varun",
    "Ayaan",
    "Nikhil",
    "Pranav",
    "Suresh",
    "Ajay",
    "Ramesh",
    "Dev",
    "Manoj",
    "Vikas",
    "Shiv",
    "Rajesh",
    "Harish",
    "Dinesh",
    "Rohit",
    "Krishna",
    "Deepak",
    "Siddharth",
    "Abhishek",
    "Yash",
    "Kunal",
    "Mohit",
    "Gaurav",
    "Ankit",
    "Ashwin",
    "Sandeep",
    "Arvind",
    "Naveen",
    "Hari",
    "Vijay",
    "Raghu",
    "Balaji",
    "Santosh",
    "Tarun",
    "Tejas",
    "Nitin",
    "Raj",
    "Bharath",
    "Harsha",
    "Amol",
    "Suraj",
    "Jay",
    "Vinay",
    "Anil",
    "Ritesh",
    "Hemant",
    "Kapil",
    "Ragav",
    "Suhas",
    "Uday",
    "Sagar",
    "Omkar",
    "Vishal",
    "Rohin",
    "Sameer",
    "Ravindra",
    "Anirudh",
    "Prem",
    "Harendra",
    "Lalit",
    "Sudhir",
    "Keshav",
    "Mohan",
    "Chandan",
    "Pradeep",
    "Tushar",
    "Naveen",
    "Pavan",
    "Ashok",
    "Raghavendra",
    "Kiran",
    "Pratap",
    "Arul",
    "Balakrishna",
    "Rameshwar",
    "Venu",
    "Kamal",
    "Ramakrishnan",
    "Dilip",
    "Charan",
    "Jitendra",
    "Mahesh",
    "Umesh",
    "Rajendra",
    "Anup",
    "Ravish",
    "Abhinav",
    "Krish",
    "Hariram",
    "Devan",
    "Niraj",
    "Basant",
    "Girish",
    "Subhash",
  ];
  const femaleNames = [
    "Diya",
    "Sneha",
    "Priya",
    "Ananya",
    "Meera",
    "Pooja",
    "Nisha",
    "Isha",
    "Aishwarya",
    "Kavya",
    "Ritika",
    "Divya",
    "Simran",
    "Shreya",
    "Neha",
    "Lakshmi",
    "Bhavana",
    "Aarti",
    "Radha",
    "Sunita",
    "Swathi",
    "Chitra",
    "Uma",
    "Latha",
    "Gayathri",
    "Keerthi",
    "Manisha",
    "Soumya",
    "Preethi",
    "Tanya",
    "Pallavi",
    "Renu",
    "Vaishnavi",
    "Deepa",
    "Suma",
    "Bhuvana",
    "Harini",
    "Sandhya",
    "Vidya",
    "Anitha",
    "Sowmya",
    "Monika",
    "Saranya",
    "Madhuri",
    "Aparna",
    "Sangeetha",
    "Kiranmayi",
    "Rekha",
    "Nandini",
    "Rashmi",
    "Jyothi",
    "Leela",
    "Ambika",
    "Ameena",
    "Sushma",
    "Komal",
    "Kusum",
    "Kanchana",
    "Bhavya",
    "Supriya",
    "Bindu",
    "Arpita",
    "Padma",
    "Asha",
    "Ankita",
    "Neelam",
    "Savita",
    "Ranjitha",
    "Poonam",
    "Charitha",
    "Rajeshwari",
    "Maya",
    "Shanthi",
    "Gomathi",
    "Indira",
    "Kalyani",
    "Lalitha",
    "Megha",
    "Shruti",
    "Reshma",
    "Anju",
    "Prema",
    "Hemalatha",
    "Sumitra",
    "Priyanka",
    "Vandana",
    "Snehal",
    "Chandana",
    "Mamatha",
    "Sindhu",
    "Sujatha",
    "Mahima",
    "Pavithra",
    "Keerthana",
    "Divyashree",
    "Kavitha",
    "Tanuja",
    "Deepti",
    "Navya",
    "Revathi",
    "Apeksha",
    "Tanvi",
    "Aarti",
    "Parvathi",
  ];

  let passengerCount;
  let genderPreference = null;

  // Determine passenger count and gender rules based on quota
  switch (reservation_type.toUpperCase()) {
    case "LADIES":
      passengerCount = Math.floor(Math.random() * 2) + 1; // 1–2 passengers
      genderPreference = "F"; // only female
      break;
    case "PWD":
      passengerCount = 1; // exactly 1 passenger
      break;
    default:
      passengerCount = Math.floor(Math.random() * 6) + 1; // 1–6 passengers
      break;
  }

  const passengers = [];

  for (let i = 0; i < passengerCount; i++) {
    const gender = genderPreference || (Math.random() < 0.5 ? "M" : "F");
    const nameList = gender === "M" ? maleNames : femaleNames;
    const name = nameList[Math.floor(Math.random() * nameList.length)];

    // Age rules
    let age;
    if (reservation_type.toUpperCase() === "LADIES") {
      // LADIES quota: only adult females, 18–59
      age = Math.floor(Math.random() * (59 - 18 + 1)) + 18;
    } else if (reservation_type.toUpperCase() === "PWD") {
      // PWD: adult passenger
      age = Math.floor(Math.random() * (59 - 18 + 1)) + 18;
    } else if (passengerCount === 1) {
      // Single passenger: must be adult 18–59
      age = Math.floor(Math.random() * (59 - 18 + 1)) + 18;
    } else {
      // GENERAL or other: any age 1–80
      age = Math.floor(Math.random() * 80) + 1;
    }

    passengers.push({
      passenger_name: name,
      passenger_age: age,
      passenger_gender: gender,
      passenger_ischild: age < 6,
      passenger_issenior:
        (gender === "M" && age >= 60) || (gender === "F" && age >= 50),
    });
  }

  // ✅ Ensure at least one adult passenger in all cases
  const hasAdult = passengers.some((p) => p.passenger_age >= 18);
  if (!hasAdult) {
    // Force one random passenger to be adult (18–59)
    const idx = Math.floor(Math.random() * passengers.length);
    passengers[idx].passenger_age =
      Math.floor(Math.random() * (59 - 18 + 1)) + 18;
    passengers[idx].passenger_ischild = false;
    passengers[idx].passenger_issenior =
      (passengers[idx].passenger_gender === "M" &&
        passengers[idx].passenger_age >= 60) ||
      (passengers[idx].passenger_gender === "F" &&
        passengers[idx].passenger_age >= 50);
  }

  return passengers;
};

module.exports = getRandomPassengers;
