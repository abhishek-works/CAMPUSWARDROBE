require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const College = require('../models/College');

const colleges = [
  { name: 'IIT Delhi', domain: 'iitd.ac.in', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'IIT Bombay', domain: 'iitb.ac.in', location: { city: 'Mumbai', state: 'Maharashtra' } },
  { name: 'IIT Madras', domain: 'iitm.ac.in', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'IIT Kanpur', domain: 'iitk.ac.in', location: { city: 'Kanpur', state: 'Uttar Pradesh' } },
  { name: 'IIT Kharagpur', domain: 'iitkgp.ac.in', location: { city: 'Kharagpur', state: 'West Bengal' } },
  { name: 'NIT Trichy', domain: 'nitt.edu', location: { city: 'Trichy', state: 'Tamil Nadu' } },
  { name: 'NIT Warangal', domain: 'nitw.ac.in', location: { city: 'Warangal', state: 'Telangana' } },
  { name: 'NIT Surathkal', domain: 'nitk.ac.in', location: { city: 'Mangalore', state: 'Karnataka' } },
  { name: 'BITS Pilani', domain: 'bits-pilani.ac.in', location: { city: 'Pilani', state: 'Rajasthan' } },
  { name: 'VIT Vellore', domain: 'vit.ac.in', location: { city: 'Vellore', state: 'Tamil Nadu' } },
  { name: 'SRM Chennai', domain: 'srmist.edu.in', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'SRCC DU', domain: 'srcc.edu', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Hindu College DU', domain: 'hinducollege.ac.in', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'St. Stephens DU', domain: 'ststephens.edu', location: { city: 'New Delhi', state: 'Delhi' } },
  // Requested colleges
  { name: 'KIET Group of Institutions', domain: 'kiet.edu', location: { city: 'Ghaziabad', state: 'Uttar Pradesh' } },
  { name: 'ABES Engineering College', domain: 'abes.ac.in', location: { city: 'Ghaziabad', state: 'Uttar Pradesh' } },
  { name: 'AKGEC', domain: 'akgec.ac.in', location: { city: 'Ghaziabad', state: 'Uttar Pradesh' } },
  { name: 'ABSIT', domain: 'absit.edu.in', location: { city: 'Ghaziabad', state: 'Uttar Pradesh' } },
  { name: 'RKGIT', domain: 'rkgit.edu.in', location: { city: 'Ghaziabad', state: 'Uttar Pradesh' } },
  { name: 'SRM Delhi NCR', domain: 'srmup.in', location: { city: 'Modinagar', state: 'Uttar Pradesh' } }, // Assuming domain srmup.in based on SRM Modinagar campus
  { name: 'ITS Engineering College', domain: 'its.edu.in', location: { city: 'Greater Noida', state: 'Uttar Pradesh' } }
];

const seedColleges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding defaults...');
    
    // Clear existing
    await College.deleteMany();
    console.log('Cleared existing colleges.');

    // Insert new
    await College.insertMany(colleges);
    console.log('Colleges seeded successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedColleges();
