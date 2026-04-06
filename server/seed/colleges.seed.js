require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const colleges = [
  { name: 'IIT Delhi', domain: 'iitd.ac.in', city: 'New Delhi', state: 'Delhi' },
  { name: 'IIT Bombay', domain: 'iitb.ac.in', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'IIT Madras', domain: 'iitm.ac.in', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'IIT Kanpur', domain: 'iitk.ac.in', city: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'IIT Kharagpur', domain: 'iitkgp.ac.in', city: 'Kharagpur', state: 'West Bengal' },
  { name: 'NIT Trichy', domain: 'nitt.edu', city: 'Trichy', state: 'Tamil Nadu' },
  { name: 'NIT Warangal', domain: 'nitw.ac.in', city: 'Warangal', state: 'Telangana' },
  { name: 'NIT Surathkal', domain: 'nitk.ac.in', city: 'Mangalore', state: 'Karnataka' },
  { name: 'BITS Pilani', domain: 'bits-pilani.ac.in', city: 'Pilani', state: 'Rajasthan' },
  { name: 'VIT Vellore', domain: 'vit.ac.in', city: 'Vellore', state: 'Tamil Nadu' },
  { name: 'SRM Chennai', domain: 'srmist.edu.in', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'SRCC DU', domain: 'srcc.edu', city: 'New Delhi', state: 'Delhi' },
  { name: 'Hindu College DU', domain: 'hinducollege.ac.in', city: 'New Delhi', state: 'Delhi' },
  { name: 'St. Stephens DU', domain: 'ststephens.edu', city: 'New Delhi', state: 'Delhi' },
  // Requested colleges
  { name: 'KIET Group of Institutions', domain: 'kiet.edu', city: 'Ghaziabad', state: 'Uttar Pradesh' },
  { name: 'ABES Engineering College', domain: 'abes.ac.in', city: 'Ghaziabad', state: 'Uttar Pradesh' },
  { name: 'AKGEC', domain: 'akgec.ac.in', city: 'Ghaziabad', state: 'Uttar Pradesh' },
  { name: 'ABSIT', domain: 'absit.edu.in', city: 'Ghaziabad', state: 'Uttar Pradesh' },
  { name: 'RKGIT', domain: 'rkgit.edu.in', city: 'Ghaziabad', state: 'Uttar Pradesh' },
  { name: 'SRM Delhi NCR', domain: 'srmup.in', city: 'Modinagar', state: 'Uttar Pradesh' },
  { name: 'ITS Engineering College', domain: 'its.edu.in', city: 'Greater Noida', state: 'Uttar Pradesh' }
];

const seedColleges = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected for seeding defaults...');
    
    // Clear existing
    await prisma.college.deleteMany();
    console.log('Cleared existing colleges.');

    // Insert new
    await prisma.college.createMany({
      data: colleges
    });
    console.log('Colleges seeded successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedColleges();
