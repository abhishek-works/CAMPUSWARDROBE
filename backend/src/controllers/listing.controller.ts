import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";
import { uploadToCloudinary } from "../utils/cloudinary";

const formatListing = (listing: any) => {
  if (!listing) return null;
  let parsedImages: string[] = [];
  try {
    if (Array.isArray(listing.images)) {
      parsedImages = listing.images;
    } else if (typeof listing.images === "string") {
      parsedImages = JSON.parse(listing.images);
    }
  } catch {
    parsedImages = listing.images ? [listing.images] : [];
  }
  return {
    ...listing,
    images: parsedImages,
  };
};

export const createListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      size,
      gender = "UNISEX",
      category,
      brand,
      condition = "Like New",
      color,
      dailyPrice,
      nightPrice,
      securityDeposit,
      availableFrom,
      availableTo,
      pickupLocation,
      notes,
      images,
    } = req.body;

    if (!title || !description || !category || !size || !dailyPrice) {
      res.status(400).json({ error: "Title, description, category, size, and day price are required." });
      return;
    }

    let imageUrls: string[] = [];

    // Check if images were passed as JSON string / array in body
    if (images) {
      try {
        imageUrls = typeof images === "string" ? JSON.parse(images) : images;
      } catch {
        imageUrls = [images];
      }
    }

    // Upload uploaded files if provided via multipart
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      try {
        const uploadPromises = (req.files as Express.Multer.File[]).map(
          (file) => uploadToCloudinary(file.buffer, "campuswardrobe/listings")
        );
        const results = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...results.map((r) => r.url)];
      } catch (err) {
        console.warn("Cloudinary upload fallback:", err);
      }
    }

    if (imageUrls.length === 0) {
      imageUrls = ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"];
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        size,
        gender,
        category,
        brand: brand || null,
        condition: condition || "Like New",
        color: color || null,
        dailyPrice: parseFloat(dailyPrice),
        nightPrice: nightPrice ? parseFloat(nightPrice) : parseFloat(dailyPrice) * 2.2,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
        images: JSON.stringify(imageUrls),
        availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
        availableTo: availableTo ? new Date(availableTo) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        pickupLocation: pickupLocation || "Campus Gate / Kundan Chaiwala Stall",
        notes: notes || null,
        college: req.user!.college,
        ownerId: req.user!.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            college: true,
            collegeId: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
    });

    res.status(201).json({ listing: formatListing(listing), message: "Clothing listed successfully on campus marketplace!" });
  } catch (error) {
    next(error);
  }
};

export const getListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "24",
      category,
      gender,
      size,
      condition,
      color,
      brand,
      minPrice,
      maxPrice,
      search,
      college,
      sort = "newest",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // College Isolation: Filter by requested college or user's college or default
    const authReq = req as AuthRequest;
    const targetCollege = (college as string) || authReq.user?.college || "KIET Group of Institutions";

    const where: any = {
      status: "ACTIVE",
      college: { contains: targetCollege },
    };

    if (category && category !== "All") {
      where.category = { equals: category as string };
    }
    if (gender && gender !== "ALL") {
      where.gender = { equals: gender as string };
    }
    if (size) {
      where.size = { equals: size as string };
    }
    if (condition) {
      where.condition = { equals: condition as string };
    }
    if (color) {
      where.color = { contains: color as string };
    }
    if (brand) {
      where.brand = { contains: brand as string };
    }

    if (minPrice || maxPrice) {
      where.dailyPrice = {};
      if (minPrice) where.dailyPrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.dailyPrice.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { brand: { contains: q } },
        { category: { contains: q } },
        { color: { contains: q } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low") orderBy = { dailyPrice: "asc" };
    if (sort === "price-high") orderBy = { dailyPrice: "desc" };
    if (sort === "night-price-low") orderBy = { nightPrice: "asc" };
    if (sort === "rating") orderBy = { owner: { rating: "desc" } };

    const [rawListings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              college: true,
              collegeId: true,
              avatarUrl: true,
              rating: true,
            },
          },
          _count: {
            select: { bookings: true, reviews: true, favorites: true },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const listings = rawListings.map(formatListing);

    res.json({
      listings,
      college: targetCollege,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            college: true,
            collegeId: true,
            avatarUrl: true,
            rating: true,
            totalRatings: true,
            phone: true,
          },
        },
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                collegeId: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        bookings: {
          where: {
            status: {
              in: ["CONFIRMED", "READY_FOR_PICKUP", "PICKED_UP"],
            },
          },
          select: {
            startDate: true,
            endDate: true,
            status: true,
          },
        },
        _count: {
          select: { bookings: true, reviews: true, favorites: true },
        },
      },
    });

    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    // Fetch similar clothes from same college
    const rawSimilar = await prisma.listing.findMany({
      where: {
        college: listing.college,
        category: listing.category,
        id: { not: listing.id },
        status: "ACTIVE",
      },
      take: 4,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            collegeId: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
    });

    res.json({
      listing: formatListing(listing),
      similarListings: rawSimilar.map(formatListing),
    });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    if (existing.ownerId !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to edit this listing" });
      return;
    }

    let imageUrls: string[] = [];
    try {
      imageUrls = typeof existing.images === "string" ? JSON.parse(existing.images) : existing.images;
    } catch {
      imageUrls = [];
    }

    if (req.body.images) {
      try {
        imageUrls = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
      } catch {
        // keep existing
      }
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = (req.files as Express.Multer.File[]).map(
        (file) => uploadToCloudinary(file.buffer, "campuswardrobe/listings")
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = [...imageUrls, ...results.map((r) => r.url)];
    }

    const updateData: any = { images: JSON.stringify(imageUrls) };
    const fields = [
      "title", "description", "size", "gender", "category", "brand", "condition", "color", "pickupLocation", "notes", "status"
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (req.body.dailyPrice) updateData.dailyPrice = parseFloat(req.body.dailyPrice);
    if (req.body.nightPrice) updateData.nightPrice = parseFloat(req.body.nightPrice);
    if (req.body.securityDeposit !== undefined) updateData.securityDeposit = parseFloat(req.body.securityDeposit);
    if (req.body.availableFrom) updateData.availableFrom = new Date(req.body.availableFrom);
    if (req.body.availableTo) updateData.availableTo = new Date(req.body.availableTo);

    const listing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            college: true,
            collegeId: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
    });

    res.json({ listing: formatListing(listing), message: "Listing updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    if (existing.ownerId !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to delete this listing" });
      return;
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        listingId: id,
        status: { in: ["CONFIRMED", "READY_FOR_PICKUP", "PICKED_UP"] },
      },
    });

    if (activeBookings > 0) {
      res.status(400).json({
        error: "Cannot delete a listing with active rentals",
      });
      return;
    }

    await prisma.listing.delete({ where: { id } });

    res.json({ message: "Listing removed successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMyListings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const listings = await prisma.listing.findMany({
      where: { ownerId: req.user!.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bookings: true, reviews: true, favorites: true },
        },
        bookings: {
          include: {
            renter: {
              select: {
                id: true,
                name: true,
                collegeId: true,
                avatarUrl: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    res.json({ listings: listings.map(formatListing) });
  } catch (error) {
    next(error);
  }
};

