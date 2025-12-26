import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...");

  // Create sample Duplikas
  const [inbora] = await db.insert(schema.duplikas).values({
    name: "Inbora",
    handle: "inbora",
    role: "Beauty YouTuber",
    bio: "Expert in K-Beauty trends and skincare routines.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    firstMessage: "Hey there! Ask me anything about my latest video or skincare routine! ✨",
    isPublic: false,
    conversations: 1200,
    followers: 2000,
  }).returning();

  const [chris] = await db.insert(schema.duplikas).values({
    name: "Chris, the Talking Dog",
    handle: "chris-dog",
    role: "Pet Influencer",
    bio: "Barking wisdom and treat reviews.",
    avatar: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150&h=150",
    firstMessage: "Woof! Ready to learn about the best treats and toys? 🐕",
    isPublic: true,
    conversations: 50000,
    followers: 50000,
  }).returning();

  const [maria] = await db.insert(schema.duplikas).values({
    name: "Chef Maria",
    handle: "chef-maria",
    role: "Culinary Expert",
    bio: "Italian recipes and cooking tips.",
    avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=150&h=150",
    firstMessage: "Ciao! Ready to cook some amazing Italian dishes? 🍝",
    isPublic: true,
    conversations: 12000,
    followers: 12000,
  }).returning();

  // Add facts for Inbora
  await db.insert(schema.facts).values([
    { duplikaId: inbora.id, text: "I've been doing K-Beauty for over 5 years" },
    { duplikaId: inbora.id, text: "My favorite ingredient is snail mucin" },
    { duplikaId: inbora.id, text: "I have combination skin with an oily T-zone" },
  ]);

  // Add Q&A pairs for Inbora
  await db.insert(schema.qaPairs).values([
    {
      duplikaId: inbora.id,
      question: "What's your morning routine?",
      answer: "I start with a gentle cleanser, then toner, essence, serum, eye cream, moisturizer, and SPF!"
    },
    {
      duplikaId: inbora.id,
      question: "Best product for dry skin?",
      answer: "I love the COSRX Snail Mucin Essence - it's incredibly hydrating and great for all skin types!"
    },
  ]);

  // Add facts for Chef Maria
  await db.insert(schema.facts).values([
    { duplikaId: maria.id, text: "Born and raised in Tuscany, Italy" },
    { duplikaId: maria.id, text: "Trained at Le Cordon Bleu in Paris" },
    { duplikaId: maria.id, text: "Specializes in traditional Italian pasta dishes" },
  ]);

  // Add content items for Chef Maria
  await db.insert(schema.contentItems).values([
    { duplikaId: maria.id, type: "image", src: "/images/maria-1.jpg" },
    { duplikaId: maria.id, type: "image", src: "/images/maria-2.jpg" },
    { duplikaId: maria.id, type: "image", src: "/images/maria-3.jpg" },
  ]);

  // Add facts for Chris
  await db.insert(schema.facts).values([
    { duplikaId: chris.id, text: "I'm a 3-year-old Golden Retriever" },
    { duplikaId: chris.id, text: "My favorite treats are peanut butter bones" },
    { duplikaId: chris.id, text: "I love playing fetch at the beach" },
  ]);

  // Add content items for Chris
  await db.insert(schema.contentItems).values([
    { duplikaId: chris.id, type: "image", src: "/images/chris-1.jpg" },
    { duplikaId: chris.id, type: "image", src: "/images/chris-2.jpg" },
    { duplikaId: chris.id, type: "image", src: "/images/chris-3.jpg" },
  ]);

  console.log("Database seeded successfully!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
