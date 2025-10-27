const StudyNote = require('../models/StudyNote');
const { generateAIResponse } = require('../config/aiConfig');

// Generate AI-powered study notes
const generateAINotes = async (req, res) => {
    try {
        const { topic, subject, difficulty = 'intermediate' } = req.body;

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

        // Create a focused prompt for reliable note generation with structured format
        const prompt = `Create complete study notes for "${topic}" in ${selectedSubject}.

For ${difficulty} learners, provide a clear and structured response using markdown formatting:

# ${topic} (${selectedSubject})

## Overview
Brief introduction and importance (2-3 sentences).

## Key Concepts
- **Core definition**: [definition here]
- **Essential terms**: 4-6 key terms with brief explanations
- **Fundamental principles**: Main principles explained

## Detailed Explanation
Break down into 2-4 logical sections with step-by-step explanations and examples.

### Section 1: [First major concept]
[Step-by-step explanation with examples]

### Section 2: [Second major concept]
[Step-by-step explanation with examples]

## Practical Examples
${difficulty === 'beginner' ? '3-4' : difficulty === 'intermediate' ? '4-5' : '5-6'} real-world examples with clear explanations.

## Practice Exercises
${difficulty === 'beginner' ? '3-4' : difficulty === 'intermediate' ? '4-5' : '5-6'} practice problems/questions with detailed solutions.

## Key Takeaways
- [Main point 1]
- [Main point 2]
- [Main point 3]

## Additional Resources
Here are some recommended resources to deepen your understanding:

### 📚 Related Topics to Explore
- **Topic 1**: Brief description of why this related topic is important
- **Topic 2**: Brief description of why this related topic is important
- **Topic 3**: Brief description of why this related topic is important

### 🔍 Further Reading
- **Book/Article 1**: "Title of recommended book or article" - Brief explanation of its relevance
- **Book/Article 2**: "Title of recommended book or article" - Brief explanation of its relevance

### 🌐 Online Resources
- **Website/Resource 1**: Brief description and why it's helpful
- **Website/Resource 2**: Brief description and why it's helpful

Use proper markdown formatting with headings, bold text for emphasis, bullet points, numbered lists, and code blocks where appropriate. Make it educational and easy to follow for students.`;

        // Generate notes using AI with increased max tokens
        const aiResponse = await generateAIResponse(prompt, [], {}, [], { maxTokens: 4000 });

        if (aiResponse.metadata.error) {
            return res.status(500).json({
                success: false,
                error: 'AI service unavailable',
                fallback: generateFallbackNotes(topic, selectedSubject, difficulty)
            });
        }

        if (!aiResponse.message) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate notes',
                fallback: generateFallbackNotes(topic, selectedSubject, difficulty)
            });
        }

        res.json({
            success: true,
            notes: aiResponse.message,
            metadata: {
                topic,
                subject: selectedSubject,
                difficulty,
                generatedAt: new Date(),
                aiModel: aiResponse.metadata.model,
                processingTime: aiResponse.metadata.processingTime,
                confidence: aiResponse.metadata.confidence
            }
        });

    } catch (error) {
        console.error('Error generating notes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate notes',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Fallback function for when AI is unavailable
function generateFallbackNotes(topic, subject, difficulty) {
    const sections = [
        `# ${topic} (${subject})`,
        '',
        '## Overview',
        `This section provides an introduction to ${topic} in ${subject}. ${topic} is an important concept that helps in understanding broader principles in the field.`,
        '',
        '## Key Concepts',
        `- **Definition**: ${topic} refers to fundamental aspects within ${subject}`,
        `- **Importance**: Understanding ${topic} is crucial for mastering ${subject}`,
        `- **Applications**: ${topic} has practical applications in real-world scenarios`,
        '',
        '## Detailed Explanation',
        `### Core Principles`,
        `The core principles of ${topic} include:`,
        `- Basic understanding of the concept`,
        `- Application in different contexts`,
        `- Relationship with other topics in ${subject}`,
        '',
        '### Step-by-Step Breakdown',
        `1. **Step 1**: Start with the fundamentals`,
        `2. **Step 2**: Build upon the basic concepts`,
        `3. **Step 3**: Apply the knowledge practically`,
        '',
        '## Practical Examples',
        `- **Example 1**: Basic application of ${topic}`,
        `- **Example 2**: Advanced use case in ${subject}`,
        `- **Example 3**: Real-world scenario demonstrating ${topic}`,
        '',
        '## Practice Exercises',
        `1. **Exercise 1**: Basic practice problem`,
        `2. **Exercise 2**: Intermediate application`,
        `3. **Exercise 3**: Advanced problem-solving`,
        '',
        '## Key Takeaways',
        `- ${topic} is fundamental to ${subject}`,
        `- Practice and application are key to mastery`,
        `- Understanding context is important for real-world application`,
        '',
        '## Additional Resources',
        '### Related Topics to Explore',
        `- Related Topic 1: Brief description`,
        `- Related Topic 2: Brief description`,
        '',
        '### Further Reading',
        `- Recommended Book/Article 1: Brief explanation`,
        `- Recommended Book/Article 2: Brief explanation`,
        '',
        '### Online Resources',
        `- Resource 1: Brief description`,
        `- Resource 2: Brief description`
    ];

    return sections.join('\n');
}

module.exports = {
    generateAINotes
};
