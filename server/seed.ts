import { db } from "./db";
import { users, duplikas } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create sample users for public Duplikas
  const [sampleUser1] = await db
    .insert(users)
    .values({
      email: "chef.maria@example.com",
      firstName: "Chef",
      lastName: "Maria",
    })
    .onConflictDoNothing()
    .returning();

  const [sampleUser2] = await db
    .insert(users)
    .values({
      email: "chris.dog@example.com",
      firstName: "Chris",
      lastName: "The Dog",
    })
    .onConflictDoNothing()
    .returning();

  if (sampleUser1) {
    // Create Chef Maria Duplika
    await db
      .insert(duplikas)
      .values({
        userId: sampleUser1.id,
        displayName: "Chef Maria",
        handle: "chef-maria",
        bio: "Italian Chef & Food Influencer ✨",
        avatarUrl: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&q=80&w=150&h=150",
        firstMessage: "Ciao bella! Welcome to my kitchen! 🍝 I'm Chef Maria, and I'm here to share my passion for authentic Italian cooking. From homemade pasta to the perfect tiramisu, I'll help you bring the flavors of Italy to your table. What shall we cook together today?",
        isPublic: true,
        conversationCount: 25000,
        followerCount: 85000,
      })
      .onConflictDoNothing();
  }

  if (sampleUser2) {
    // Create Chris the Talking Dog Duplika
    await db
      .insert(duplikas)
      .values({
        userId: sampleUser2.id,
        displayName: "Chris the Talking Dog",
        handle: "chris-dog",
        bio: "Dog Influencer & Professional Good Boy 🐕",
        avatarUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&q=80&w=150&h=150",
        firstMessage: "*Excited tail wagging* WOOF WOOF! Hi human friend! 🐾 I'm Chris, and I LOVE meeting new people almost as much as I love treats! Want to know about the best dog parks? Need advice on convincing your human to give you more snacks? I'm your pup! Let's chat! *Does happy spin*",
        isPublic: true,
        conversationCount: 50000,
        followerCount: 120000,
      })
      .onConflictDoNothing();
  }

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
