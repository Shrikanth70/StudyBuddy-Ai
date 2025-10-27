const Flashcard = require('../models/Flashcard');
const { generateAIResponse } = require('../config/aiConfig');

// Generate AI-powered flashcards
const generateAIFlashcards = async (req, res) => {
    try {
        const { topic, subject, difficulty = 'intermediate', numCards = 5 } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        const subjects = [
            'Accounting', 'Actuarial Science', 'Agriculture', 'Algorithms', 'Anatomy', 'Anthropology', 'Archaeology', 'Architecture', 'Art', 'Artificial Intelligence', 'Assembly Language', 'Astronomy', 'Bash/Shell Scripting', 'Biochemistry', 'Biology', 'Biomedical Engineering', 'Blockchain', 'Business Studies', 'C', 'C#', 'C++', 'Calculus', 'Chemical Engineering', 'Chemistry', 'Civil Engineering', 'Cloud Computing', 'Communication', 'Compiler Design', 'Computer Engineering', 'Computer Graphics', 'Computer Networks', 'Computer Science', 'Constitutional Law', 'Control Systems', 'Corporate Law', 'Creative Writing', 'Criminal Justice', 'Cultural Studies', 'Cybersecurity', 'Dance', 'Data Science', 'Data Structures', 'Database Management Systems', 'Dentistry', 'DevOps', 'Dietetics', 'Discrete Mathematics', 'Ecology', 'Economics', 'Education', 'Electrical Engineering', 'Electromagnetism', 'English', 'Entrepreneurship', 'Environmental Law', 'Environmental Science', 'Ethics', 'Fashion Design', 'Film Studies', 'Finance', 'Fine Arts', 'Fisheries', 'Forestry', 'Game Development', 'Gender Studies', 'Genetics', 'Geography', 'Geology', 'Go', 'Graphic Design', 'Haskell', 'Health Education', 'Hindi', 'History', 'Hospitality Management', 'HTML/CSS', 'Human Resources', 'Human Rights Law', 'Human-Computer Interaction', 'Industrial Engineering', 'Information Systems', 'Inorganic Chemistry', 'International Business', 'International Law', 'Internet of Things (IoT)', 'Java', 'JavaScript', 'Journalism', 'Kotlin', 'Law', 'Library Science', 'Linguistics', 'Linear Algebra', 'Literature', 'Logic', 'Lua', 'Machine Learning', 'Management', 'Marketing', 'Materials Science', 'Mathematics', 'MATLAB', 'Mechanical Engineering', 'Media Studies', 'Medicine', 'Meteorology', 'Microbiology', 'Mobile Development', 'Music', 'Nanotechnology', 'Nursing', 'Nutrition', 'Oceanography', 'Operations Management', 'Operating Systems', 'Organic Chemistry', 'Pathology', 'Perl', 'Pharmacology', 'Philosophy', 'Photography', 'Physical Chemistry', 'Physical Education', 'Physics', 'Physiology', 'Political Science', 'Programming Languages', 'Psychology', 'Public Health', 'Public Relations', 'Python', 'Quantum Physics', 'R', 'Religious Studies', 'Ruby', 'Rust', 'Scala', 'Sociology', 'Software Engineering', 'Software Testing', 'Sports Science', 'SQL', 'Statistics', 'Supply Chain Management', 'Swift', 'Theater', 'Theory of Computation', 'Thermodynamics', 'Tourism', 'TypeScript', 'Urban Planning', 'Veterinary Science', 'Web Development'
        ];

        let selectedSubject = subject;

        // Auto-select subject if not provided
        if (!selectedSubject) {
            const classificationPrompt = `Classify the following topic into one of these subjects: ${subjects.join(', ')}. Topic: "${topic}". Respond with only the subject name that best fits. If it doesn't fit any, respond with "General".`;

            const classificationResponse = await generateAIResponse(classificationPrompt, [], {}, []);

            if (classificationResponse.message) {
                const classified = classificationResponse.message.trim();
                selectedSubject = subjects.includes(classified) ? classified : 'General';
            } else {
                selectedSubject = 'General';
            }
        }

        // Create a focused prompt for diverse, natural flashcard generation
        const prompt = `Create ${numCards} diverse and natural flashcards for the topic "${topic}" in ${selectedSubject}.

Generate flashcards that reflect actual key points, facts, or concepts from the topic. Do NOT follow a fixed question pattern or template. Make each flashcard unique and context-aware.

Requirements:
- Create exactly ${numCards} flashcards
- Include different types: factual, conceptual, comparison-based, or example-based questions
- Keep questions and answers concise and learner-friendly
- Make them topic-relevant and realistic like real educational flashcards
- Vary the question formats naturally

Return the flashcards in this exact JSON format:
{
  "flashcards": [
    {
      "front": "Question text here",
      "back": "Answer text here",
      "hint": "Optional brief hint",
      "difficulty": "easy|medium|hard",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Ensure the questions are varied and don't repeat similar patterns. Focus on creating engaging, educational flashcards that would actually help students learn the topic effectively.`;

        // Generate flashcards using AI
        const aiResponse = await generateAIResponse(prompt, [], {}, [], { maxTokens: 3000 });

        if (aiResponse.metadata.error) {
            return res.status(500).json({
                success: false,
                error: 'AI service unavailable',
                fallback: generateFallbackFlashcards(topic, subject, difficulty, numCards)
            });
        }

        if (!aiResponse.message) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate flashcards',
                fallback: generateFallbackFlashcards(topic, subject, difficulty, numCards)
            });
        }

        // Parse the AI response to extract flashcards
        let generatedCards = [];
        try {
            // Try to extract JSON from the response
            const jsonMatch = aiResponse.message.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                generatedCards = parsed.flashcards || [];
            } else {
                // Fallback: try to parse the entire response as JSON
                const parsed = JSON.parse(aiResponse.message);
                generatedCards = parsed.flashcards || [];
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            return res.status(500).json({ success: false, error: 'Failed to parse generated flashcards' });
        }

        // Validate and ensure we have the right number of cards
        if (!Array.isArray(generatedCards) || generatedCards.length === 0) {
            return res.status(500).json({ success: false, error: 'No valid flashcards generated' });
        }

        // Ensure each card has required fields
        const validatedCards = generatedCards.slice(0, numCards).map((card, index) => ({
            front: card.front || `Question ${index + 1}`,
            back: card.back || 'Answer not available',
            hint: card.hint || '',
            difficulty: card.difficulty || 'medium',
            tags: Array.isArray(card.tags) ? card.tags : []
        }));

        res.json({
            success: true,
            flashcards: validatedCards,
            metadata: {
                topic,
                subject: selectedSubject,
                difficulty,
                numCards: validatedCards.length,
                generatedAt: new Date(),
                aiModel: aiResponse.metadata.model
            }
        });

    } catch (error) {
        console.error('Error generating flashcards:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate flashcards',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Fallback function for when AI is unavailable
function generateFallbackFlashcards(topic, subject, difficulty, numCards) {
    const cards = [];

    const templates = [
        {
            front: `What is the definition of ${topic} in ${subject}?`,
            back: `${topic} is a fundamental concept in ${subject} that involves key principles and applications.`,
            hint: 'Think about the core meaning',
            difficulty: 'easy',
            tags: ['definition', 'basic']
        },
        {
            front: `What are the main components of ${topic}?`,
            back: `The main components include: 1) Core principles, 2) Key applications, 3) Related concepts in ${subject}.`,
            hint: 'Consider the building blocks',
            difficulty: 'medium',
            tags: ['components', 'structure']
        },
        {
            front: `How does ${topic} relate to other concepts in ${subject}?`,
            back: `${topic} connects with broader themes in ${subject} through fundamental relationships and applications.`,
            hint: 'Look for connections',
            difficulty: 'hard',
            tags: ['relationships', 'advanced']
        },
        {
            front: `What are practical applications of ${topic} in ${subject}?`,
            back: `${topic} has numerous real-world applications including problem-solving and implementation in ${subject}.`,
            hint: 'Think about real-world use',
            difficulty: 'medium',
            tags: ['applications', 'practical']
        },
        {
            front: `What are the key benefits of understanding ${topic}?`,
            back: `Understanding ${topic} provides deeper insight into ${subject} and enables better problem-solving capabilities.`,
            hint: 'Consider the advantages',
            difficulty: 'easy',
            tags: ['benefits', 'importance']
        }
    ];

    for (let i = 0; i < numCards; i++) {
        const template = templates[i % templates.length];
        cards.push({
            front: template.front,
            back: template.back,
            hint: template.hint,
            difficulty: template.difficulty,
            tags: template.tags
        });
    }

    return cards;
}

module.exports = {
    generateAIFlashcards
};
