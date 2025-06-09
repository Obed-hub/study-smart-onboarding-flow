
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudyRequest {
  action: 'analyze' | 'generate-questions';
  input?: string;
  inputType?: 'text' | 'topic' | 'pdf';
  fileData?: any;
  analysisData?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { action, input, inputType, fileData, analysisData }: StudyRequest = await req.json();
    console.log('Processing request:', { action, inputType, hasInput: !!input });

    if (action === 'analyze') {
      const analysisResult = await analyzeContent(input || '', inputType || 'text');
      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (action === 'generate-questions') {
      const questionsResult = await generateQuestions(analysisData, user.id, supabaseClient);
      return new Response(JSON.stringify(questionsResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in ai-study-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeContent(input: string, inputType: string) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('Analyzing content with Gemini AI...');

  const prompt = inputType === 'topic' 
    ? `Analyze the following topic for study purposes: "${input}". Extract 4-6 key concepts and subtopics that students should focus on. Format as a study outline.`
    : `Analyze the following study material: "${input}". Extract the main topics and key concepts that students should focus on. Organize into 4-6 major topics with 3-5 subtopics each.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 2048,
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const analysisText = data.candidates[0].content.parts[0].text;
  
  // Parse the analysis into structured topics
  const topics = parseAnalysisIntoTopics(analysisText);
  
  return {
    topics,
    totalTopics: topics.length,
    totalSubtopics: topics.reduce((acc: number, topic: any) => acc + topic.subtopics.length, 0)
  };
}

function parseAnalysisIntoTopics(analysisText: string) {
  // Simple parsing logic to extract topics and subtopics
  const lines = analysisText.split('\n').filter(line => line.trim());
  const topics = [];
  let currentTopic = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Main topic (starts with number or ##)
    if (trimmed.match(/^\d+\.|\*\*.*\*\*|##/)) {
      if (currentTopic) {
        topics.push(currentTopic);
      }
      currentTopic = {
        title: trimmed.replace(/^\d+\.\s*|\*\*|\s*\*\*|##\s*/g, ''),
        subtopics: []
      };
    }
    // Subtopic (starts with -, *, or is indented)
    else if (trimmed.match(/^[-*•]\s+/) && currentTopic) {
      currentTopic.subtopics.push(trimmed.replace(/^[-*•]\s+/, ''));
    }
    // Fallback for unformatted content
    else if (trimmed && currentTopic && currentTopic.subtopics.length < 5) {
      currentTopic.subtopics.push(trimmed);
    }
  }

  if (currentTopic) {
    topics.push(currentTopic);
  }

  // Ensure we have at least some default topics if parsing fails
  if (topics.length === 0) {
    return [
      {
        title: "Key Concepts",
        subtopics: ["Main principles", "Core definitions", "Important theories", "Practical applications"]
      },
      {
        title: "Study Focus Areas",
        subtopics: ["Primary topics", "Secondary concepts", "Review materials", "Practice areas"]
      }
    ];
  }

  return topics.slice(0, 6); // Limit to 6 topics max
}

async function generateQuestions(analysisData: any, userId: string, supabaseClient: any) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('Generating questions with Gemini AI...');

  const topicsText = analysisData.topics.map((topic: any) => 
    `${topic.title}: ${topic.subtopics.join(', ')}`
  ).join('\n');

  const prompt = `Based on these study topics, generate 15-20 exam-style questions with detailed answers:

${topicsText}

For each question, provide:
1. The question (varied types: multiple choice, short answer, essay)
2. A comprehensive answer/explanation
3. The difficulty level (Easy/Medium/Hard)
4. The main topic it covers

Format as a structured list.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 4096,
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const questionsText = data.candidates[0].content.parts[0].text;
  
  // Parse questions into structured format
  const questions = parseQuestionsFromText(questionsText, analysisData.topics);

  // Save to database
  const { data: sessionData, error } = await supabaseClient
    .from('study_sessions')
    .insert({
      user_id: userId,
      title: `Study Session - ${new Date().toLocaleDateString()}`,
      topics: analysisData.topics,
      questions: questions,
      input_type: 'text',
      source: 'gemini-ai'
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to save study session');
  }

  return {
    questions,
    sessionId: sessionData.id,
    totalQuestions: questions.length
  };
}

function parseQuestionsFromText(questionsText: string, topics: any[]) {
  const lines = questionsText.split('\n').filter(line => line.trim());
  const questions = [];
  let currentQuestion = null;
  let answerLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Question line (starts with number)
    if (trimmed.match(/^\d+\./)) {
      // Save previous question
      if (currentQuestion) {
        currentQuestion.answer = answerLines.join(' ').trim();
        questions.push(currentQuestion);
        answerLines = [];
      }
      
      currentQuestion = {
        id: questions.length + 1,
        question: trimmed.replace(/^\d+\.\s*/, ''),
        answer: '',
        difficulty: 'Medium',
        topic: topics[questions.length % topics.length]?.title || 'General'
      };
    }
    // Answer or explanation lines
    else if (currentQuestion && trimmed) {
      if (trimmed.toLowerCase().includes('answer:') || 
          trimmed.toLowerCase().includes('explanation:')) {
        answerLines.push(trimmed.replace(/^(answer|explanation):\s*/i, ''));
      } else if (trimmed.toLowerCase().includes('difficulty:')) {
        const difficulty = trimmed.match(/(easy|medium|hard)/i);
        if (difficulty) {
          currentQuestion.difficulty = difficulty[1];
        }
      } else if (!trimmed.match(/^\d+\./) && answerLines.length > 0) {
        answerLines.push(trimmed);
      }
    }
  }

  // Add the last question
  if (currentQuestion) {
    currentQuestion.answer = answerLines.join(' ').trim() || 'Answer not provided';
    questions.push(currentQuestion);
  }

  // Generate default questions if parsing fails
  if (questions.length === 0) {
    topics.forEach((topic, topicIndex) => {
      topic.subtopics.forEach((subtopic: string, subIndex: number) => {
        questions.push({
          id: questions.length + 1,
          question: `Explain the concept of "${subtopic}" in relation to ${topic.title}.`,
          answer: `This question focuses on understanding ${subtopic} within the context of ${topic.title}. Consider the key principles, definitions, and practical applications.`,
          difficulty: subIndex < 2 ? 'Easy' : subIndex < 4 ? 'Medium' : 'Hard',
          topic: topic.title
        });
      });
    });
  }

  return questions.slice(0, 20); // Limit to 20 questions
}
