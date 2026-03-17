import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flagEmoji: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flagEmoji: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flagEmoji: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flagEmoji: '🇷🇺' },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文', flagEmoji: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flagEmoji: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flagEmoji: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flagEmoji: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flagEmoji: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flagEmoji: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flagEmoji: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flagEmoji: '🇵🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flagEmoji: '🇸🇪' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flagEmoji: '🇺🇦' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flagEmoji: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flagEmoji: '🇮🇩' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', flagEmoji: '🇹🇭' },
];

async function main() {
  console.log('Seeding languages...');
  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: lang,
      create: lang,
    });
  }
  console.log(`Seeded ${languages.length} languages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
