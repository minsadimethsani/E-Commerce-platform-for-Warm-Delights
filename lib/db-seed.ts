import "./load-env";
import { collection, doc, getDoc, getDocs, setDoc, writeBatch, query, limit, Timestamp } from "firebase/firestore";
import { db, runWithTimeout } from "./firebase";
import { products as localProducts } from "@/data/products";
import { UserProfile, Order, Review, Address } from "@/types/database";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 1. Seed Products
async function seedProductsIfEmpty(batch: any) {
  const productsRef = collection(db, "products");
  const q = query(productsRef, limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("Firestore products collection is empty. Seeding...");
    for (const p of localProducts) {
      const docRef = doc(db, "products", p.id);
      
      let ingredients: string[] = [];
      let careInstructions = "";
      
      if (p.category === "Cake") {
        ingredients = [
          "Organic unbleached cake flour",
          "pasture-raised egg yolks",
          "organic cane sugar",
          "pure grass-fed butter",
          "fresh whipping cream",
          "natural vanilla paste",
          "sea salt",
          "premium baking powder"
        ];
        careInstructions = "Keep refrigerated in an airtight cake container. Serve slightly chilled or let rest at room temperature for 15 minutes before serving for optimal cream texture. Best consumed within 3-4 days.";
      } else if (p.category === "Savory") {
        ingredients = [
          "Premium stone-ground wheat flour",
          "whole milk",
          "Greek feta / cheddar cheeses",
          "fresh organic spinach / vegetables",
          "pasture-raised eggs",
          "unsalted butter",
          "nutmeg",
          "sea salt",
          "white pepper"
        ];
        careInstructions = "Store refrigerated. To serve, reheat in a preheated oven at 180°C (350°F) for 5-8 minutes to restore the crispy, flaky crust. Avoid microwave reheating to prevent sogginess.";
      } else if (p.category === "Pastry") {
        ingredients = [
          "French style unbleached pastry flour",
          "premium grass-fed butter (82% fat) for lamination",
          "fresh whole milk",
          "yeast",
          "organic sugar",
          "water",
          "organic sea salt"
        ];
        careInstructions = "Best enjoyed fresh on the day of baking. If saving for later, store in a paper bag or airtight container at room temperature. Toast in the oven at 170°C for 2-3 minutes for maximum crispness.";
      } else if (p.category === "Cookie") {
        ingredients = [
          "Organic pastry flour",
          "dark / semi-sweet chocolate chunks",
          "organic light brown sugar",
          "grass-fed butter",
          "pasture-raised eggs",
          "Madagascar vanilla extract",
          "baking soda",
          "sea salt flakes"
        ];
        careInstructions = "Store at room temperature in an airtight jar or container. Stays fresh for up to 7 days. For that warm out-of-the-oven feel, pop in a toaster oven for 60 seconds!";
      } else {
        ingredients = [
          "Handpicked premium organic ingredients",
          "local stone-ground flour",
          "pasture-raised eggs",
          "pure butter",
          "cane sugar",
          "natural extracts"
        ];
        careInstructions = "Keep stored in a cool, dry place or in the refrigerator based on frosting needs. Bring to room temperature 1 hour before serving. Consume within 3 days.";
      }

      const seededProduct = {
        id: p.id,
        name: p.name,
        nameLowercase: p.name.toLowerCase(), // Index field for case-insensitive prefix search
        description: p.description,
        price: p.price,
        image: p.image,
        category: p.category,
        badge: p.badge || "",
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        isAvailable: true,
        ingredients,
        careInstructions,
        videoUrl: p.videoUrl || "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      batch.set(docRef, seededProduct);
    }
    return true;
  }
  return false;
}

// 2. Seed Users
async function seedUsersIfEmpty(batch: any) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("Firestore users collection is empty. Seeding...");
    
    const sampleAddress: Address = {
      id: "addr-1",
      street: "123 Baker Street",
      city: "Sweetwater",
      state: "CA",
      postalCode: "94016",
      country: "USA",
      isDefault: true
    };

    const usersList: UserProfile[] = [
      {
        uid: "user-1",
        email: "customer@example.com",
        displayName: "John Doe",
        phoneNumber: "+15550192834",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        role: "customer",
        shippingAddresses: [sampleAddress],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        uid: "user-2",
        email: "pierre@warmdelights.com",
        displayName: "Chef Pierre",
        phoneNumber: "+15559876543",
        role: "baker",
        shippingAddresses: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        uid: "user-3",
        email: "admin@warmdelights.com",
        displayName: "Sarah Connor",
        role: "admin",
        shippingAddresses: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const u of usersList) {
      const docRef = doc(db, "users", u.uid);
      batch.set(docRef, u);
    }
    return true;
  }
  return false;
}

// 3. Seed Reviews
async function seedReviewsIfEmpty(batch: any) {
  const reviewsRef = collection(db, "reviews");
  const q = query(reviewsRef, limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("Firestore reviews collection is empty. Seeding...");
    
    const reviewsList: Review[] = [
      {
        id: "rev-1",
        productId: "prod-1",
        userId: "user-1",
        userName: "John Doe",
        rating: 5,
        comment: "Absolutely delicious! The dark chocolate ganache is extremely rich and smooth.",
        createdAt: Timestamp.now()
      },
      {
        id: "rev-2",
        productId: "prod-8",
        userId: "user-1",
        userName: "John Doe",
        rating: 5,
        comment: "The almond butter croissant is flaky perfection. Best I've had outside Paris!",
        createdAt: Timestamp.now()
      },
      {
        id: "rev-3",
        productId: "prod-3",
        userId: "user-1",
        userName: "John Doe",
        rating: 4,
        comment: "Delicious quiche. Great combination of spinach and feta, crust is very buttery.",
        createdAt: Timestamp.now()
      }
    ];

    for (const r of reviewsList) {
      const docRef = doc(db, "reviews", r.id);
      batch.set(docRef, r);
    }
    return true;
  }
  return false;
}

// 4. Seed Orders
async function seedOrdersIfEmpty(batch: any) {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("Firestore orders collection is empty. Seeding...");

    const shippingAddress: Address = {
      id: "addr-1",
      street: "123 Baker Street",
      city: "Sweetwater",
      state: "CA",
      postalCode: "94016",
      country: "USA",
      isDefault: true
    };

    const ordersList: Order[] = [
      {
        id: "order-1",
        userId: "user-1",
        items: [
          {
            productId: "prod-1",
            name: "Signature Chocolate Fudge",
            price: 38.00,
            quantity: 2,
            image: "/hero_bakery.png"
          },
          {
            productId: "prod-8",
            name: "Almond Butter Croissant",
            price: 5.00,
            quantity: 1,
            image: "/category_savories.png"
          }
        ],
        subtotal: 81.00,
        tax: 6.48,
        shippingFee: 5.00,
        total: 92.48,
        status: "pending",
        shippingAddress,
        paymentDetails: {
          method: "stripe",
          paymentId: "ch_sample_12345",
          status: "paid"
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "order-2",
        userId: "user-1",
        items: [
          {
            productId: "prod-3",
            name: "Spinach & Feta Quiche",
            price: 18.50,
            quantity: 1,
            image: "/category_savories.png"
          }
        ],
        subtotal: 18.50,
        tax: 1.48,
        shippingFee: 5.00,
        total: 24.98,
        status: "delivered",
        shippingAddress,
        paymentDetails: {
          method: "cod",
          status: "paid"
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const o of ordersList) {
      const docRef = doc(db, "orders", o.id);
      batch.set(docRef, o);
    }
    return true;
  }
  return false;
}

// 5. Seed Categories
async function seedCategoriesIfEmpty(batch: any) {
  const categoriesRef = collection(db, "categories");
  const q = query(categoriesRef, limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("Firestore categories collection is empty. Seeding...");
    const defaultCategories = [
      { id: "cake", name: "Cake", subcategories: ["Sponge Cake", "Fudge Cake", "Cheesecakes"] },
      { id: "savory", name: "Savory", subcategories: ["Quiches", "Bread", "Pies"] },
      { id: "pastry", name: "Pastry", subcategories: ["Croissants", "Tarts", "Danishes"] },
      { id: "cookie", name: "Cookie", subcategories: ["Chocolate Chip", "Macarons", "Shortbread"] },
      { id: "custom", name: "Custom", subcategories: ["Wedding Cakes", "Birthday Cakes", "Custom Hampers"] }
    ];

    for (const cat of defaultCategories) {
      const docRef = doc(db, "categories", cat.id);
      batch.set(docRef, cat);
    }
    return true;
  }
  return false;
}

// 6. Seed Badges
async function seedBadgesIfEmpty(batch: any) {
  const badgesRef = collection(db, "badges");
  const q = query(badgesRef, limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("Firestore badges collection is empty. Seeding...");
    const defaultBadges = [
      { id: "bestseller", name: "Bestseller" },
      { id: "new", name: "New" },
      { id: "seasonal", name: "Seasonal" },
      { id: "chef-special", name: "Chef Special" }
    ];

    for (const badge of defaultBadges) {
      const docRef = doc(db, "badges", badge.id);
      batch.set(docRef, badge);
    }
    return true;
  }
  return false;
}

// Module-level cache to check seeding only once per application instance lifetime
let isSeedingChecked = false;

/**
 * Check Firestore settings to see if seeding was already performed in the past.
 */
async function isDatabaseSeeded(): Promise<boolean> {
  try {
    const docRef = doc(db, "settings", "seed_status");
    const docSnap = await runWithTimeout(getDoc(docRef), 15000);
    return docSnap.exists() && docSnap.data()?.seeded === true;
  } catch (error) {
    console.error("Error checking seed status in Firestore settings:", error);
    return false;
  }
}

export async function seedAllCollectionsIfEmpty(force: boolean = false) {
  if (isSeedingChecked && !force) {
    return;
  }
  try {
    if (!force) {
      // Check Firestore settings first to prevent auto-re-seeding on empty collections
      const alreadySeeded = await isDatabaseSeeded();
      if (alreadySeeded) {
        isSeedingChecked = true;
        return;
      }
    }



    const batch = writeBatch(db);
    
    // Execute all check/seed functions in parallel to avoid sequential network roundtrips
    const [
      seededProd,
      seededUsers,
      seededReviews,
      seededOrders,
      seededCategories,
      seededBadges
    ] = await Promise.all([
      seedProductsIfEmpty(batch),
      seedUsersIfEmpty(batch),
      seedReviewsIfEmpty(batch),
      seedOrdersIfEmpty(batch),
      seedCategoriesIfEmpty(batch),
      seedBadgesIfEmpty(batch),
    ]);

    if (seededProd || seededUsers || seededReviews || seededOrders || seededCategories || seededBadges) {
      await batch.commit();
      
      // Save seed status setting to Firestore
      const settingsRef = doc(db, "settings", "seed_status");
      await setDoc(settingsRef, { seeded: true, seededAt: Timestamp.now() });
      console.log("Firestore database collections updated and marked as seeded successfully!");
    }
    
    // Mark as successfully checked/seeded to skip database reads on subsequent requests
    isSeedingChecked = true;
  } catch (error) {
    console.error("Failed to seed collections in Firestore:", error);
  }
}

// Support direct CLI execution
const isDirectRun = 
  (typeof require !== 'undefined' && require.main === module) ||
  (typeof process !== 'undefined' && process.argv[1] && 
   (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) || 
    path.resolve(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))));

if (isDirectRun) {
  (async () => {
    console.log("Starting manual database seeding...");
    await seedAllCollectionsIfEmpty(true);
    console.log("Manual database seeding operation completed.");
    process.exit(0);
  })();
}


