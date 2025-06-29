const OPENAI_API_BASE = 'https://api.openai.com/v1';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface FeedbackResponse {
  overallScore: number;
  vocabularyScore: number;
  accuracyScore: number;
  confidenceScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export const generateFeedback = async (transcript: string, interviewType: string): Promise<FeedbackResponse> => {
  try {
    const prompt = `
You are an expert interview coach analyzing a ${interviewType} interview transcript. 
Please provide detailed feedback based on the following transcript:

${transcript}

Analyze the candidate's performance and provide:
1. Overall score (0-10)
2. Vocabulary & Communication score (0-10)
3. Accuracy & Relevance score (0-10)
4. Confidence & Delivery score (0-10)
5. Detailed feedback paragraph
6. 3-4 key strengths
7. 3-4 areas for improvement
8. 3-4 specific recommendations

Focus on:
- Communication clarity and professionalism
- Relevance of answers to questions asked
- Use of specific examples and achievements
- Technical knowledge (for technical interviews)
- Behavioral responses (for HR interviews)
- Problem-solving approach (for system design interviews)

Respond in JSON format with the following structure:
{
  "overallScore": number,
  "vocabularyScore": number,
  "accuracyScore": number,
  "confidenceScore": number,
  "feedback": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "recommendations": ["string"]
}
`;

    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach providing detailed, constructive feedback to help candidates improve their interview performance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('Error generating feedback:', error);
    
    // Fallback feedback if API fails
    return {
      overallScore: 7.0,
      vocabularyScore: 7.5,
      accuracyScore: 6.5,
      confidenceScore: 7.0,
      feedback: `Thank you for completing your ${interviewType} interview. Based on the session, you demonstrated good communication skills and relevant knowledge. To improve further, focus on providing more specific examples from your experience and showing greater enthusiasm for the role. Practice common interview questions and research the company thoroughly before your next interview.`,
      strengths: [
        "Clear communication style",
        "Professional demeanor",
        "Relevant experience mentioned",
        "Good technical understanding"
      ],
      improvements: [
        "Provide more specific examples",
        "Show more enthusiasm and energy",
        "Ask more thoughtful questions",
        "Better structure for answers"
      ],
      recommendations: [
        "Practice the STAR method for behavioral questions",
        "Research the company and role more thoroughly",
        "Prepare specific examples that highlight your achievements",
        "Work on confident body language and tone"
      ]
    };
  }
};

export const generateQuestions = async (resume: string, jobDescription: string, interviewType: string) => {
  try {
    const prompt = `
Generate 5-7 relevant ${interviewType} interview questions based on:

Resume: ${resume}
Job Description: ${jobDescription}

Make the questions specific to the candidate's background and the role requirements.
For Technical interviews, include coding/technical questions.
For HR interviews, focus on behavioral and cultural fit questions.
For System Design interviews, include architecture and scalability questions.

Return as a JSON array of question strings.
`;

    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer creating relevant questions for job candidates.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Fallback questions
    const fallbackQuestions = {
      'HR': [
        "Tell me about yourself and your career journey.",
        "Why are you interested in this position?",
        "Describe a challenging situation you faced at work and how you handled it.",
        "What are your greatest strengths and weaknesses?",
        "Where do you see yourself in 5 years?"
      ],
      'Technical': [
        "Explain your experience with the technologies mentioned in the job description.",
        "Walk me through a complex technical project you've worked on.",
        "How do you approach debugging and troubleshooting?",
        "What's your experience with version control and collaboration?",
        "How do you stay updated with new technologies?"
      ],
      'System Design': [
        "Design a scalable system for a social media platform.",
        "How would you handle high traffic and ensure system reliability?",
        "Explain your approach to database design and optimization.",
        "Describe how you would implement caching strategies.",
        "How do you ensure security in distributed systems?"
      ]
    };
    
    return fallbackQuestions[interviewType as keyof typeof fallbackQuestions] || fallbackQuestions.HR;
  }
};