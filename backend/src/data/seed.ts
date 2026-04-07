import mongoose from 'mongoose';
import { Scenario } from '../models/Scenario';
import { User } from '../models/User';
import { TeacherReview } from '../models/TeacherReview';
import bcrypt from 'bcryptjs';

const scenarios = [
  {
    title: 'At the Restaurant',
    titleVietnamese: 'Tại Nhà Hàng',
    description: 'Practice ordering food, asking for recommendations, and making reservations at a restaurant.',
    descriptionVietnamese: 'Luyện tập gọi món ăn, hỏi đề xuất, và đặt bàn tại nhà hàng.',
    category: 'daily-life',
    level: 'beginner',
    difficulty: 2,
    tags: ['food', 'ordering', 'restaurant', 'basic'],
    role: {
      name: 'Friendly Restaurant Server',
      personality: 'warm, helpful, patient',
      accent: 'American',
      speakingStyle: 'slow and clear, friendly',
    },
    prompts: [
      {
        order: 1,
        text: "Hi there! Welcome to Sunrise Cafe. My name is Sarah. Do you have a reservation today?",
        context: 'Greeting the guest and asking about reservation',
      },
      {
        order: 2,
        text: "Great! Right this way, please. Here is your table. Can I get you something to drink first?",
        context: 'Guiding to table and taking drink order',
      },
    ],
    vocabulary: [
      { word: 'menu', phonetic: '/ˈmenjuː/', meaningVietnamese: 'thực đơn', example: 'Here is our menu.' },
      { word: 'recommend', phonetic: '/ˌrekəˈmend/', meaningVietnamese: 'đề xuất', example: 'What do you recommend?' },
      { word: 'appetizer', phonetic: '/ˈæpɪtaɪzər/', meaningVietnamese: 'món khai vị', example: 'Would you like an appetizer?' },
      { word: 'dessert', phonetic: '/dɪˈzɜːrt/', meaningVietnamese: 'món tráng miệng', example: 'Any room for dessert?' },
      { word: 'bill', phonetic: '/bɪl/', meaningVietnamese: 'hóa đơn', example: 'Can I have the bill, please?' },
    ],
    grammarPoints: [
      'Using "Would you like..." for offers',
      'Using "Can I have..." for requests',
      'Present simple for habits and preferences',
    ],
    expectedPhrases: [
      'I would like...',
      'Can I have the bill?',
      'What do you recommend?',
      'I am allergic to...',
    ],
    flaggablePhrases: [],
    estimatedDuration: 10,
    isActive: true,
  },
  {
    title: 'Job Interview',
    titleVietnamese: 'Phỏng Vấn Xin Việc',
    description: 'Practice common job interview questions, talking about your experience, and asking about the company.',
    descriptionVietnamese: 'Luyện tập các câu hỏi phỏng vấn thông thường, nói về kinh nghiệm, và hỏi về công ty.',
    category: 'business',
    level: 'intermediate',
    difficulty: 6,
    tags: ['job', 'interview', 'career', 'professional'],
    role: {
      name: 'Hiring Manager',
      personality: 'professional, thorough, encouraging',
      accent: 'American',
      speakingStyle: 'formal, clear questions',
    },
    prompts: [
      {
        order: 1,
        text: "Good morning! Please have a seat. I'm Dr. Jennifer Adams, the HR Director. Thank you for coming in today. How was your commute?",
        context: 'Welcome and small talk',
      },
      {
        order: 2,
        text: "Lovely! Now, let's get started. Can you tell me about yourself and what brings you to this position?",
        context: 'Opening the formal interview',
      },
    ],
    vocabulary: [
      { word: 'qualifications', phonetic: '/ˌkwɒlɪfɪˈkeɪʃənz/', meaningVietnamese: 'trình độ, bằng cấp', example: 'What are your qualifications?' },
      { word: 'experience', phonetic: '/ɪkˈspɪəriəns/', meaningVietnamese: 'kinh nghiệm', example: 'Do you have experience in this field?' },
      { word: 'strengths', phonetic: '/streŋθs/', meaningVietnamese: 'điểm mạnh', example: 'What are your greatest strengths?' },
      { word: 'salary', phonetic: '/ˈsæləri/', meaningVietnamese: 'lương', example: 'What are your salary expectations?' },
      { word: 'colleagues', phonetic: '/ˈkɒliːɡz/', meaningVietnamese: 'đồng nghiệp', example: 'Do you work well with colleagues?' },
    ],
    grammarPoints: [
      'Using past tense to describe experience',
      'Conditional for hypothetical situations',
      'Superlatives for achievements',
    ],
    expectedPhrases: [
      'I am passionate about...',
      'My greatest strength is...',
      'I have worked as...',
      'Where do you see yourself in five years?',
    ],
    flaggablePhrases: [],
    estimatedDuration: 20,
    isActive: true,
  },
  {
    title: 'At the Airport',
    titleVietnamese: 'Tại Sân Bay',
    description: 'Practice checking in, going through security, and asking for directions at the airport.',
    descriptionVietnamese: 'Luyện tập làm thủ tục, qua kiểm tra an ninh, và hỏi đường tại sân bay.',
    category: 'travel',
    level: 'elementary',
    difficulty: 3,
    tags: ['airport', 'travel', 'directions', 'check-in'],
    role: {
      name: 'Airport Information Staff',
      personality: 'efficient, helpful, clear',
      accent: 'American',
      speakingStyle: 'concise, helpful',
    },
    prompts: [
      {
        order: 1,
        text: "Good afternoon! Welcome to JFK International Airport. How can I help you today?",
        context: 'Greeting at information desk',
      },
    ],
    vocabulary: [
      { word: 'terminal', phonetic: '/ˈtɜːrmɪnəl/', meaningVietnamese: 'nhà ga', example: 'Which terminal are you flying from?' },
      { word: 'boarding pass', phonetic: '/ˈbɔːrdɪŋ pæs/', meaningVietnamese: 'thẻ lên máy bay', example: 'May I see your boarding pass?' },
      { word: 'gate', phonetic: '/ɡeɪt/', meaningVietnamese: 'cửa ra máy bay', example: 'Your gate is B12.' },
      { word: 'luggage', phonetic: '/ˈlʌɡɪdʒ/', meaningVietnamese: 'hành lý', example: 'Where can I collect my luggage?' },
      { word: 'departure', phonetic: '/dɪˈpɑːrtʃər/', meaningVietnamese: 'khởi hành', example: 'Your departure is at gate A5.' },
    ],
    grammarPoints: [
      'Imperatives for directions',
      'Using "Can/Could you tell me..." for requests',
      'Prepositions of place (at, in, on)',
    ],
    expectedPhrases: [
      'Where is the...',
      'How do I get to...',
      'What time does...',
      'I am looking for...',
    ],
    flaggablePhrases: [],
    estimatedDuration: 10,
    isActive: true,
  },
  {
    title: 'Making Friends',
    titleVietnamese: 'Làm Quen Bạn Mới',
    description: 'Practice introducing yourself, making small talk, and building friendships in social situations.',
    descriptionVietnamese: 'Luyện tập giới thiệu bản thân, trò chuyện nhỏ, và xây dựng tình bạn trong các tình huống xã hội.',
    category: 'social',
    level: 'pre-intermediate',
    difficulty: 4,
    tags: ['social', 'friendship', 'introduction', 'small-talk'],
    role: {
      name: 'Friendly Classmate',
      personality: 'open, curious, warm',
      accent: 'American',
      speakingStyle: 'casual, friendly, engaging',
    },
    prompts: [
      {
        order: 1,
        text: "Hey! I don't think we've met before. I'm Alex. Are you new here?",
        context: 'First meeting and introduction',
      },
      {
        order: 2,
        text: "That's cool! So, where are you from? And what do you like to do for fun?",
        context: 'Continuing conversation with follow-up questions',
      },
    ],
    vocabulary: [
      { word: 'hobby', phonetic: '/ˈhɒbi/', meaningVietnamese: 'sở thích', example: 'What are your hobbies?' },
      { word: 'share', phonetic: '/ʃeər/', meaningVietnamese: 'chia sẻ', example: 'I would like to share my experience.' },
      { word: 'common', phonetic: '/ˈkɒmən/', meaningVietnamese: 'chung, phổ biến', example: 'We have something in common!' },
      { word: 'suggest', phonetic: '/səɡˈdʒest/', meaningVietnamese: 'đề nghị, gợi ý', example: 'Can you suggest a good restaurant?' },
    ],
    grammarPoints: [
      'Present simple for habits and preferences',
      'Question forms for getting to know someone',
      'Using "so" to continue conversation',
    ],
    expectedPhrases: [
      'Nice to meet you!',
      'Where are you from?',
      'What do you do in your free time?',
      'We should hang out sometime!',
    ],
    flaggablePhrases: [],
    estimatedDuration: 15,
    isActive: true,
  },
  {
    title: 'Business Meeting',
    titleVietnamese: 'Cuộc Họp Kinh Doanh',
    description: 'Practice presenting ideas, discussing proposals, and negotiating in a professional business meeting.',
    descriptionVietnamese: 'Luyện tập trình bày ý tưởng, thảo luận đề xuất, và đàm phán trong cuộc họp kinh doanh chuyên nghiệp.',
    category: 'business',
    level: 'upper-intermediate',
    difficulty: 8,
    tags: ['business', 'meeting', 'presentation', 'negotiation'],
    role: {
      name: 'Business Partner',
      personality: 'analytical, professional, decisive',
      accent: 'British',
      speakingStyle: 'formal, precise',
    },
    prompts: [
      {
        order: 1,
        text: "Good morning, everyone. Let's get started. I've reviewed the proposal, and I have some questions. Shall we begin with the financial projections?",
        context: 'Opening a formal business meeting',
      },
    ],
    vocabulary: [
      { word: 'proposal', phonetic: '/prəˈpəʊzəl/', meaningVietnamese: 'đề xuất', example: 'Can you explain your proposal?' },
      { word: 'deadline', phonetic: '/ˈdedlaɪn/', meaningVietnamese: 'thời hạn', example: 'We need to meet the deadline.' },
      { word: 'negotiate', phonetic: '/nɪˈɡəʊʃieɪt/', meaningVietnamese: 'đàm phán', example: 'We need to negotiate the terms.' },
      { word: 'stakeholder', phonetic: '/ˈsteɪkhəʊldər/', meaningVietnamese: 'bên liên quan', example: 'All stakeholders must agree.' },
    ],
    grammarPoints: [
      'Passive voice for formal writing',
      'Conditional for hypothetical business scenarios',
      'Modals for polite suggestions (would, could, might)',
    ],
    expectedPhrases: [
      'If I understand correctly...',
      'Could you elaborate on that?',
      'In my opinion...',
      'Let me summarize...',
    ],
    flaggablePhrases: [],
    estimatedDuration: 25,
    isActive: true,
  },
  {
    title: 'Academic Discussion',
    titleVietnamese: 'Thảo Luận Học Thuật',
    description: 'Practice discussing research, debating topics, and presenting arguments in an academic setting.',
    descriptionVietnamese: 'Luyện tập thảo luận nghiên cứu, tranh luận chủ đề, và trình bày lập luận trong môi trường học thuật.',
    category: 'academic',
    level: 'advanced',
    difficulty: 9,
    tags: ['academic', 'debate', 'research', 'university'],
    role: {
      name: 'University Professor',
      personality: 'intellectual, critical, fair-minded',
      accent: 'British',
      speakingStyle: 'scholarly, precise, thought-provoking',
    },
    prompts: [
      {
        order: 1,
        text: "Good afternoon. Today's seminar focuses on the ethics of artificial intelligence. Before we begin, I'd like each of you to share your initial thoughts on the key challenges. Who would like to start?",
        context: 'Opening an academic seminar',
      },
    ],
    vocabulary: [
      { word: 'hypothesis', phonetic: '/haɪˈpɒθɪsɪs/', meaningVietnamese: 'giả thuyết', example: 'What is your hypothesis?' },
      { word: 'methodology', phonetic: '/ˌmeθəˈdɒlədʒi/', meaningVietnamese: 'phương pháp nghiên cứu', example: 'The methodology needs to be rigorous.' },
      { word: 'empirical', phonetic: '/ɪmˈpɪrɪkəl/', meaningVietnamese: 'thực nghiệm', example: 'We need empirical evidence.' },
      { word: 'paradigm', phonetic: '/ˈpærədaɪm/', meaningVietnamese: 'mô hình, paradigm', example: 'This represents a paradigm shift.' },
    ],
    grammarPoints: [
      'Academic hedging (might, may, could)',
      'Complex argument structures',
      'Referencing and citation language',
    ],
    expectedPhrases: [
      'According to research...',
      'I would argue that...',
      'On the contrary...',
      'This raises the question of...',
    ],
    flaggablePhrases: [],
    estimatedDuration: 30,
    isActive: true,
  },
  {
    title: 'At the Doctor\'s Office',
    titleVietnamese: 'Tại Phòng Khám Bác Sĩ',
    description: 'Practice describing symptoms, understanding medical advice, and asking questions about treatment.',
    descriptionVietnamese: 'Luyện tập mô tả triệu chứng, hiểu lời khuyên y tế, và hỏi về phương pháp điều trị.',
    category: 'daily-life',
    level: 'elementary',
    difficulty: 3,
    tags: ['health', 'doctor', 'medical', 'symptoms'],
    role: {
      name: 'Caring Doctor',
      personality: 'professional, patient, reassuring',
      accent: 'American',
      speakingStyle: 'clear, gentle, thorough',
    },
    prompts: [
      {
        order: 1,
        text: "Hello! I'm Dr. Martinez. Please, have a seat. So, what brings you in today? How are you feeling?",
        context: 'Initial consultation',
      },
    ],
    vocabulary: [
      { word: 'symptom', phonetic: '/ˈsɪmptəm/', meaningVietnamese: 'triệu chứng', example: 'What symptoms are you experiencing?' },
      { word: 'prescription', phonetic: '/prɪˈskrɪpʃən/', meaningVietnamese: 'đơn thuốc', example: 'I\'ll write you a prescription.' },
      { word: 'allergy', phonetic: '/ˈælədʒi/', meaningVietnamese: 'dị ứng', example: 'Do you have any allergies?' },
      { word: 'appointment', phonetic: '/əˈpɔɪntmənt/', meaningVietnamese: 'lịch hẹn', example: 'Let me make an appointment for you.' },
    ],
    grammarPoints: [
      'Present perfect for symptoms',
      'Adverbs of frequency',
      'Giving advice with "should" and "ought to"',
    ],
    expectedPhrases: [
      'I have been feeling...',
      'It hurts when...',
      'How often should I...',
      'Are there any side effects?',
    ],
    flaggablePhrases: [],
    estimatedDuration: 15,
    isActive: true,
  },
  {
    title: 'Shopping for Clothes',
    titleVietnamese: 'Mua Sắm Quần Áo',
    description: 'Practice asking about sizes, trying on clothes, and discussing prices while shopping.',
    descriptionVietnamese: 'Luyện tập hỏi về kích cỡ, thử quần áo, và thảo luận giá cả khi mua sắm.',
    category: 'daily-life',
    level: 'beginner',
    difficulty: 2,
    tags: ['shopping', 'clothes', 'sizes', 'prices'],
    role: {
      name: 'Helpful Shop Assistant',
      personality: 'friendly, attentive, patient',
      accent: 'American',
      speakingStyle: 'casual, helpful',
    },
    prompts: [
      {
        order: 1,
        text: "Hi there! Welcome to Fashion Hub. Can I help you find something today?",
        context: 'Greeting the customer',
      },
    ],
    vocabulary: [
      { word: 'size', phonetic: '/saɪz/', meaningVietnamese: 'kích cỡ', example: 'What size do you wear?' },
      { word: 'fit', phonetic: '/fɪt/', meaningVietnamese: 'vừa vặn', example: 'How does this fit?' },
      { word: 'discount', phonetic: '/ˈdɪskaʊnt/', meaningVietnamese: 'giảm giá', example: 'Is there any discount?' },
      { word: 'changing room', phonetic: '/ˈtʃeɪndʒɪŋ ruːm/', meaningVietnamese: 'phòng thử đồ', example: 'The fitting room is over there.' },
    ],
    grammarPoints: [
      'Comparative and superlative adjectives',
      'Using "too" and "enough"',
      'Polite requests with "Can/Could I..."',
    ],
    expectedPhrases: [
      'Do you have this in a larger size?',
      'How much does this cost?',
      'Can I try this on?',
      'I\'ll take it!',
    ],
    flaggablePhrases: [],
    estimatedDuration: 10,
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/esl_speak');
    console.log('Connected to MongoDB');

    await Scenario.deleteMany({});
    console.log('Cleared existing scenarios');

    await Scenario.insertMany(scenarios);
    console.log(`Inserted ${scenarios.length} scenarios`);

    const teacherEmail = 'teacher@eslspeak.com';
    const existingTeacher = await User.findOne({ email: teacherEmail });
    if (!existingTeacher) {
      const teacherHash = await bcrypt.hash('teacher123', 12);
      await User.create({
        email: teacherEmail,
        passwordHash: teacherHash,
        name: 'Demo Teacher',
        role: 'teacher',
        level: 'advanced',
        currentZPD: { minLevel: 5, maxLevel: 6, currentLevel: 6 },
      });
      console.log('Created demo teacher account');
    }

    const adminEmail = 'admin@eslspeak.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminHash = await bcrypt.hash('admin123', 12);
      await User.create({
        email: adminEmail,
        passwordHash: adminHash,
        name: 'Admin',
        role: 'admin',
        level: 'advanced',
        currentZPD: { minLevel: 5, maxLevel: 6, currentLevel: 6 },
      });
      console.log('Created admin account');
    }

    console.log('\n Seed completed successfully!');
    console.log('\nDemo Accounts:');
    console.log('  Teacher: teacher@eslspeak.com / teacher123');
    console.log('  Admin:   admin@eslspeak.com / admin123');
    console.log('\nScenarios seeded:');
    scenarios.forEach(s => {
      console.log(`  - [${s.level}] ${s.title} (${s.titleVietnamese})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
