// Seed subscription plans into the database via API
const subscriptionPlans = [
  {
    name: "free",
    displayName: "Free Plan",
    description: "Basic WordPress maintenance for small sites",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Up to 1 website",
      "Basic health monitoring", 
      "Manual updates only",
      "Community support"
    ]
  },
  {
    name: "maintain",
    displayName: "Maintain",
    description: "Essential maintenance for growing websites",
    monthlyPrice: 2900, // $29.00
    yearlyPrice: 29000, // $290.00 (2 months free)
    features: [
      "Up to 5 websites",
      "Automated plugin/theme updates",
      "Weekly health reports",
      "Email support",
      "Backup monitoring"
    ]
  },
  {
    name: "protect",
    displayName: "Protect", 
    description: "Advanced security and performance optimization",
    monthlyPrice: 5900, // $59.00
    yearlyPrice: 59000, // $590.00 (2 months free)
    features: [
      "Up to 15 websites",
      "Security scanning & malware protection",
      "Performance optimization",
      "Priority email support",
      "Advanced reporting",
      "Uptime monitoring"
    ]
  },
  {
    name: "perform",
    displayName: "Perform",
    description: "Enterprise-grade management for agencies",
    monthlyPrice: 11900, // $119.00
    yearlyPrice: 119000, // $1,190.00 (2 months free)
    features: [
      "Unlimited websites",
      "White-label reports",
      "Advanced SEO analysis",
      "Phone support",
      "Custom integrations",
      "Multi-user access",
      "API access"
    ]
  }
];

async function seedPlans() {
  console.log('🌱 Seeding subscription plans...');
  
  for (const plan of subscriptionPlans) {
    try {
      const response = await fetch('http://localhost:5000/api/subscription-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Using demo token
        },
        body: JSON.stringify(plan)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created plan: ${plan.displayName}`);
      } else {
        console.log(`❌ Failed to create plan: ${plan.displayName} - ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Error creating plan ${plan.displayName}:`, error.message);
    }
  }
  
  console.log('🎉 Subscription plan seeding completed!');
}

// Run the seeding
seedPlans();