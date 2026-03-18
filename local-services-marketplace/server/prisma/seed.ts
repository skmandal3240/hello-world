import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = [
    { name: 'Cleaning', slug: 'cleaning', icon: '🧹', description: 'Home and office cleaning services' },
    { name: 'Plumbing', slug: 'plumbing', icon: '🔧', description: 'Pipe repairs, installation, and maintenance' },
    { name: 'Electrical', slug: 'electrical', icon: '⚡', description: 'Wiring, repairs, and installations' },
    { name: 'Tutoring', slug: 'tutoring', icon: '📚', description: 'Academic tutoring for all subjects and levels' },
    { name: 'Landscaping', slug: 'landscaping', icon: '🌿', description: 'Lawn care, gardening, and yard work' },
    { name: 'Moving', slug: 'moving', icon: '📦', description: 'Local moving and packing services' },
    { name: 'Handyman', slug: 'handyman', icon: '🔨', description: 'General repairs and home maintenance' },
    { name: 'Pet Care', slug: 'pet-care', icon: '🐾', description: 'Dog walking, pet sitting, and grooming' },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Seed a demo customer
  const customerPw = await bcrypt.hash('password123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@demo.com' },
    update: {},
    create: {
      email: 'customer@demo.com',
      passwordHash: customerPw,
      name: 'Alex Johnson',
      role: UserRole.CUSTOMER,
    },
  });

  // Seed a demo provider
  const providerPw = await bcrypt.hash('password123', 10);
  const provider = await prisma.user.upsert({
    where: { email: 'provider@demo.com' },
    update: {},
    create: {
      email: 'provider@demo.com',
      passwordHash: providerPw,
      name: 'Maria Garcia',
      role: UserRole.PROVIDER,
    },
  });

  const cleaningCat = await prisma.serviceCategory.findUnique({ where: { slug: 'cleaning' } });

  if (cleaningCat && !await prisma.providerProfile.findUnique({ where: { userId: provider.id } })) {
    const profile = await prisma.providerProfile.create({
      data: {
        userId: provider.id,
        bio: 'Professional cleaner with 5+ years experience. Eco-friendly products available.',
        location: 'San Francisco, CA',
        zipCode: '94102',
        hourlyRate: 45,
        yearsExp: 5,
        isVerified: true,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 24,
      },
    });

    await prisma.service.create({
      data: {
        providerId: profile.id,
        categoryId: cleaningCat.id,
        title: 'Deep Home Cleaning',
        description: 'Thorough top-to-bottom cleaning of your home including kitchen, bathrooms, and all rooms.',
        price: 120,
        priceType: 'fixed',
      },
    });
  }

  console.log('Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
