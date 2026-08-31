"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting seed for CAMPUSWARDROBE (KIET Group of Institutions)...");
    // Clean existing data
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    console.log("🧹 Cleaned existing data");
    const hashedPassword = await bcrypt_1.default.hash("Password123", 12);
    const collegeName = "KIET Group of Institutions";
    // Create Admin
    const admin = await prisma.user.create({
        data: {
            name: "CampusWardrobe Admin",
            email: "admin@kiet.edu",
            collegeId: "ADMIN001",
            college: collegeName,
            password: hashedPassword,
            phone: "9876500000",
            role: "ADMIN",
            isEmailVerified: true,
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
            wallet: { create: { balance: 5000 } },
        },
    });
    // Create KIET Demo Students
    const u1 = await prisma.user.create({
        data: {
            name: "Abhishek Sharma",
            email: "2327cs1190@kiet.edu",
            collegeId: "2327CS1190",
            college: collegeName,
            password: hashedPassword,
            phone: "9876543210",
            isEmailVerified: true,
            rating: 4.9,
            totalRatings: 14,
            avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300",
            wallet: { create: { balance: 1400 } },
        },
    });
    const u2 = await prisma.user.create({
        data: {
            name: "Priyanshu Kumar",
            email: "2327cs1185@kiet.edu",
            collegeId: "2327CS1185",
            college: collegeName,
            password: hashedPassword,
            phone: "9876543211",
            isEmailVerified: true,
            rating: 4.8,
            totalRatings: 19,
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
            wallet: { create: { balance: 2200 } },
        },
    });
    const u3 = await prisma.user.create({
        data: {
            name: "Sneha Singh",
            email: "2327cs1178@kiet.edu",
            collegeId: "2327CS1178",
            college: collegeName,
            password: hashedPassword,
            phone: "9876543212",
            isEmailVerified: true,
            rating: 4.95,
            totalRatings: 26,
            avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
            wallet: { create: { balance: 3100 } },
        },
    });
    const u4 = await prisma.user.create({
        data: {
            name: "Aman Verma",
            email: "2327cs1210@kiet.edu",
            collegeId: "2327CS1210",
            college: collegeName,
            password: hashedPassword,
            phone: "9876543213",
            isEmailVerified: true,
            rating: 4.6,
            totalRatings: 9,
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
            wallet: { create: { balance: 850 } },
        },
    });
    const u5 = await prisma.user.create({
        data: {
            name: "Riya Gupta",
            email: "2327cs1164@kiet.edu",
            collegeId: "2327CS1164",
            college: collegeName,
            password: hashedPassword,
            phone: "9876543214",
            isEmailVerified: true,
            rating: 4.75,
            totalRatings: 11,
            avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
            wallet: { create: { balance: 1750 } },
        },
    });
    console.log("👥 Created KIET demo users:", [u1.collegeId, u2.collegeId, u3.collegeId, u4.collegeId, u5.collegeId].join(", "));
    // High quality clothing photos
    const imgSuit = [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
        "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800",
    ];
    const imgHoodie = [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800",
        "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800",
    ];
    const imgDenim = [
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800",
        "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800",
    ];
    const imgLehenga = [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
    ];
    const imgKurta = [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
    ];
    const imgShirt = [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
    ];
    const imgJeans = [
        "https://images.unsplash.com/photo-1542272604-780c96856592?w=800",
    ];
    const imgPartyBlazer = [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
    ];
    const imgNehruJacket = [
        "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800",
    ];
    const now = new Date();
    const availableFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const availableTo = new Date(now.getFullYear(), now.getMonth() + 6, 30);
    const listings = await Promise.all([
        prisma.listing.create({
            data: {
                title: "Navy Blue Slim-Fit Suit",
                description: "Premium Raymond 2-piece navy blue suit with matching trousers. Immaculate condition, dry-cleaned, tailored slim fit. Ideal for placement interviews, college presentations, farewells, and formal banquets.",
                size: "M",
                gender: "MALE",
                category: "Formal",
                brand: "Raymond",
                condition: "Like New",
                color: "Navy Blue",
                dailyPrice: 300,
                nightPrice: 800,
                securityDeposit: 1000,
                images: JSON.stringify(imgSuit),
                availableFrom,
                availableTo,
                pickupLocation: "Near Kundan Chaiwala / Main Gate",
                notes: "Comes in a suit bag with wooden hanger. Please return dry-cleaned or handle with care.",
                college: collegeName,
                ownerId: u2.id,
            },
        }),
        prisma.listing.create({
            data: {
                title: "Black Graphic Oversized Hoodie",
                description: "Super comfy, heavy-blend 400 GSM oversized streetwear hoodie. Minimalist aesthetic typography on back, cozy fleece lining. Perfect for winter college fests, late-night hackathons, or chill café outings.",
                size: "L",
                gender: "UNISEX",
                category: "Hoodies",
                brand: "H&M Studio",
                condition: "Like New",
                color: "Jet Black",
                dailyPrice: 150,
                nightPrice: 350,
                securityDeposit: 500,
                images: JSON.stringify(imgHoodie),
                availableFrom,
                availableTo,
                pickupLocation: "Boys Hostel 3 Gate",
                notes: "Freshly washed. Very warm and stylish.",
                college: collegeName,
                ownerId: u1.id,
            },
        }),
        prisma.listing.create({
            data: {
                title: "Vintage Washed Denim Jacket",
                description: "Classic authentic Levi's trucker jacket with custom sherpa collar. Heavyweight denim with subtle fading that elevates any outfit. Looks great paired with hoodies or plain tees.",
                size: "M",
                gender: "UNISEX",
                category: "Jackets",
                brand: "Levi's",
                condition: "Good",
                color: "Washed Blue",
                dailyPrice: 200,
                nightPrice: 500,
                securityDeposit: 700,
                images: JSON.stringify(imgDenim),
                availableFrom,
                availableTo,
                pickupLocation: "Central Library Lawn / Reception",
                notes: "Sturdy jacket, easy pickup between 10 AM and 6 PM.",
                college: collegeName,
                ownerId: u4.id,
            },
        }),
        prisma.listing.create({
            data: {
                title: "Crimson Red Velvet Designer Lehenga",
                description: "Exquisite raw silk and velvet lehenga set with intricate gold zari and sequins work. Worn once for KIET Epoque fest. Includes flared skirt, padded blouse (fits 32-36), and sheer dupatta.",
                size: "S",
                gender: "FEMALE",
                category: "Ethnic",
                brand: "Mohey by Manyavar",
                condition: "Brand New",
                color: "Crimson Red",
                dailyPrice: 600,
                nightPrice: 1500,
                securityDeposit: 2500,
                images: JSON.stringify(imgLehenga),
                availableFrom,
                availableTo,
                pickupLocation: "Girls Hostel 1 Visitor Lounge",
                notes: "Strictly dry clean only. Blouse has margins for adjustment.",
                college: collegeName,
                ownerId: u3.id,
            },
        }),
        prisma.listing.create({
            data: {
                title: "Pure Cotton Lucknowi Chikan White Kurta",
                description: "Breathable pure cotton white kurta with intricate hand-embroidered Lucknowi Chikankari work. Light, classy, and perfect for Diwali fests, traditional day, campus pujas, or farewell photoshoots.",
                size: "L",
                gender: "MALE",
                category: "Traditional",
                brand: "FabIndia",
                condition: "Like New",
                color: "Pristine White",
                dailyPrice: 180,
                nightPrice: 400,
                securityDeposit: 600,
                images: JSON.stringify(imgKurta),
                availableFrom,
                availableTo,
                pickupLocation: "Admin Block / Kundan Chaiwala Stall",
                notes: "Includes matching white pajama / drawstring bottom.",
                college: collegeName,
                ownerId: u1.id,
            },
        }),
        prisma.listing.create({
            data: {
                title: "Sky Blue Non-Iron Placement Shirt",
                description: "Crisp formal shirt crafted from 100% Egyptian Giza cotton. Wrinkle-resistant finish ensures you stay sharp through 8-hour placement interview marathons.",
                size: "M",
                gender: "MALE",
                category: "Shirts",
                brand: "Arrow New York",
                condition: "Like New",
                color: "Sky Blue",
                dailyPrice: 120,
                nightPrice: 250,
                securityDeposit: 400,
                images: JSON.stringify(imgShirt),
                availableFrom,
                availableTo,
                pickupLocation: "CS Department Lobby",
                notes: "Freshly pressed. Collar stays included.",
                college: collegeName,
                ownerId: u2.id,
            },
        }),
        prisma.listing.create({
            data: {
                title: "Distressed Slim Tapered Black Jeans",
                description: "Comfort-stretch premium denim with subtle knee distress and a tailored taper. Pairs seamlessly with party shirts or oversized sweatshirts.",
                size: "M",
                gender: "UNISEX",
                category: "Jeans",
                brand: "Zara Man",
                condition: "Good",
                color: "Black",
                dailyPrice: 140,
                nightPrice: 300,
                securityDeposit: 500,
                images: JSON.stringify(imgJeans),
                availableFrom,
                availableTo,
                pickupLocation: "Kundan Chaiwala Front Seating",
                notes: "Waist 32, Inseam 30.",
                college: collegeName,
                ownerId: u4.id,
            },
        }),
        prisma.listing.create({
            data: {
                title: "Midnight Velvet Tuxedo Blazer",
                description: "Deep midnight blue velvet blazer with satin peak lapels. Statement piece for cultural night, celebrity nights, DJ fests, and formal gala dinners.",
                size: "M",
                gender: "MALE",
                category: "Party",
                brand: "Blackberrys",
                condition: "Brand New",
                color: "Midnight Blue",
                dailyPrice: 350,
                nightPrice: 900,
                securityDeposit: 1500,
                images: JSON.stringify(imgPartyBlazer),
                availableFrom,
                availableTo,
                pickupLocation: "Boys Hostel 2 Common Room",
                notes: "Includes velvet lapel pin.",
                college: collegeName,
                ownerId: u5.id,
            },
        }),
        prisma.listing.create({
            data: {
                title: "Raw Silk Banarasi Nehru / Modi Jacket",
                description: "Vibrant emerald green Banarasi silk sleeveless Nehru jacket with metallic embossed buttons. Instantly turns any simple kurta into an ethnic statement.",
                size: "L",
                gender: "MALE",
                category: "Ethnic",
                brand: "Tasva by Tarun Tahiliani",
                condition: "Like New",
                color: "Emerald Green",
                dailyPrice: 220,
                nightPrice: 550,
                securityDeposit: 800,
                images: JSON.stringify(imgNehruJacket),
                availableFrom,
                availableTo,
                pickupLocation: "Main Auditorium Gate",
                notes: "Chest 40-42. High quality lining.",
                college: collegeName,
                ownerId: u2.id,
            },
        }),
    ]);
    console.log(`👗 Created ${listings.length} campus listings with Day/Night pricing`);
    // Create sample Bookings with QR tokens
    const qrToken1 = crypto_1.default.randomBytes(24).toString("hex");
    const booking1 = await prisma.booking.create({
        data: {
            bookingCode: "CW-2327CS1190-1025",
            listingId: listings[0].id, // Navy Suit owned by u2 (Priyanshu)
            renterId: u1.id, // Abhishek
            lenderId: u2.id, // Priyanshu
            startDate: new Date("2026-09-10"),
            endDate: new Date("2026-09-12"),
            rentalType: "DAY",
            totalDays: 2,
            rentalAmount: 600,
            depositAmount: 1000,
            totalAmount: 1600,
            platformFee: 90,
            qrToken: qrToken1,
            status: "CONFIRMED",
        },
    });
    const qrToken2 = crypto_1.default.randomBytes(24).toString("hex");
    const booking2 = await prisma.booking.create({
        data: {
            bookingCode: "CW-2327CS1185-1048",
            listingId: listings[1].id, // Hoodie owned by u1 (Abhishek)
            renterId: u2.id, // Priyanshu
            lenderId: u1.id, // Abhishek
            startDate: new Date("2026-08-20"),
            endDate: new Date("2026-08-22"),
            rentalType: "NIGHT",
            totalDays: 2,
            rentalAmount: 700,
            depositAmount: 500,
            totalAmount: 1200,
            platformFee: 105,
            qrToken: qrToken2,
            status: "COMPLETED",
            pickupTime: new Date("2026-08-20T19:30:00Z"),
            returnTime: new Date("2026-08-22T21:00:00Z"),
        },
    });
    console.log("📋 Created sample active & completed bookings");
    // Sample Reviews
    await prisma.review.create({
        data: {
            bookingId: booking2.id,
            listingId: listings[1].id,
            authorId: u2.id,
            targetId: u1.id,
            rating: 5,
            clothingRating: 5,
            comment: "Super warm hoodie! Picked it up directly near Kundan Chaiwala stall. Abhishek is super polite and responsive. 10/10 campus rental experience!",
        },
    });
    // Sample Favorites
    await prisma.favorite.createMany({
        data: [
            { userId: u1.id, listingId: listings[0].id },
            { userId: u1.id, listingId: listings[3].id },
            { userId: u2.id, listingId: listings[1].id },
            { userId: u3.id, listingId: listings[7].id },
        ],
    });
    // Sample Messages
    await prisma.message.createMany({
        data: [
            {
                senderId: u1.id,
                receiverId: u2.id,
                listingId: listings[0].id,
                bookingId: booking1.id,
                content: "Hi Priyanshu, will you be available near Kundan Chaiwala tomorrow around 4 PM for the pickup?",
                read: true,
            },
            {
                senderId: u2.id,
                receiverId: u1.id,
                listingId: listings[0].id,
                bookingId: booking1.id,
                content: "Yes Abhishek! I have lectures till 3:30 PM, so 4:00 PM at Kundan Chaiwala is perfect. See you there with the QR pass!",
                read: false,
            },
        ],
    });
    // Sample Notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: u1.id,
                type: "BOOKING_CONFIRMED",
                title: "Booking Confirmed! 🎉",
                message: "Your booking for Navy Blue Slim-Fit Suit has been confirmed. Show your QR pass at pickup spot.",
                link: "/dashboard/bookings",
                read: false,
            },
            {
                userId: u2.id,
                type: "NEW_BOOKING",
                title: "New Rental Request",
                message: "Abhishek Sharma (2327CS1190) booked your Navy Blue Slim-Fit Suit for 10-12 Sept.",
                link: "/dashboard/listings",
                read: false,
            },
        ],
    });
    console.log("\n✅ KIET CAMPUSWARDROBE database seeded successfully!");
    console.log("\n========================================================");
    console.log("🏫 College: KIET Group of Institutions");
    console.log("🔑 Default Password for all: Password123");
    console.log("--------------------------------------------------------");
    console.log("1. Abhishek Sharma  - College ID: 2327CS1190 (2327cs1190@kiet.edu)");
    console.log("2. Priyanshu Kumar  - College ID: 2327CS1185 (2327cs1185@kiet.edu)");
    console.log("3. Sneha Singh      - College ID: 2327CS1178 (2327cs1178@kiet.edu)");
    console.log("4. Aman Verma       - College ID: 2327CS1210 (2327cs1210@kiet.edu)");
    console.log("5. Riya Gupta       - College ID: 2327CS1164 (2327cs1164@kiet.edu)");
    console.log("6. Admin Account    - Email: admin@kiet.edu");
    console.log("========================================================\n");
}
main()
    .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map