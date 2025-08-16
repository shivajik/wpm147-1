import { db } from "./server/db";
import { subscriptionPlans } from "./shared/schema";

const planData = [
  {
    name: "free",
    displayName: "Free",
    description: "Get Started with Basic Monitoring",
    monthlyPrice: 0, // Free
    yearlyPrice: 0, // Free
    features: [
      "Basic uptime monitoring",
      "Monthly WordPress updates",
      "Email support",
      "1 website monitoring",
      "Basic analytics dashboard"
    ],
    isActive: true
  },
  {
    name: "maintain",
    displayName: "Maintain",
    description: "Standard Site Maintenance",
    monthlyPrice: 2999, // $29.99
    yearlyPrice: 29999, // $299.99 (save $60)
    features: [
      "Weekly WordPress updates",
      "24/7 emergency support", 
      "24/7 uptime monitoring",
      "Google Analytics integration",
      "Cloud backups (4x daily)"
    ],
    isActive: true
  },
  {
    name: "protect",
    displayName: "Protect", 
    description: "Sites Needing Edits and Security",
    monthlyPrice: 4999, // $49.99
    yearlyPrice: 49999, // $499.99 (save $100)
    features: [
      "All features from Maintain",
      "24/7 unlimited website edits",
      "Security optimization",
      "Malware scanning & removal",
      "SSL certificate management",
      "WordPress firewall protection"
    ],
    isActive: true
  },
  {
    name: "perform",
    displayName: "Perform",
    description: "Advanced Functionality Sites", 
    monthlyPrice: 7999, // $79.99
    yearlyPrice: 79999, // $799.99 (save $160)
    features: [
      "All features from Protect",
      "Speed optimization",
      "Mobile optimization", 
      "Image optimization",
      "Complete malware removal",
      "Performance monitoring",
      "SEO optimization",
      "Advanced analytics"
    ],
    isActive: true
  }
];

async function seedPlans() {
  try {
    console.log("Seeding subscription plans...");
    
    for (const plan of planData) {
      await db.insert(subscriptionPlans).values(plan).onConflictDoUpdate({
        target: subscriptionPlans.name,
        set: {
          displayName: plan.displayName,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: plan.features,
          isActive: plan.isActive,
          updatedAt: new Date()
        }
      });
      console.log(`✓ Seeded plan: ${plan.displayName}`);
    }
    
    console.log("All subscription plans seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }
}

seedPlans();