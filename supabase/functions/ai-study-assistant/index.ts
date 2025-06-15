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

    const { action, input, inputType, fileData, analysisData }: StudyRequest = await req.json();
    console.log('Processing request:', { action, inputType, hasInput: !!input });

    // Get user for trial logic
    let userId = "anonymous";
    let userIsPremium = false;
    
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
      userId = user.id;

      // Fetch profile to check premium
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("is_premium")
        .eq("id", userId)
        .maybeSingle();

      userIsPremium = !!profile?.is_premium;
    }

    if (action === 'analyze') {
      const analysisResult = await analyzeContent(input || '', inputType || 'text');
      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (action === 'generate-questions') {
      // ---- BEGIN FREE TRIAL LOGIC ----
      // For premium: generate full amount; for free: check usage
      let maxQuestions = 20;
      if (!userIsPremium) {
        maxQuestions = 5;
        if (userId === "anonymous") {
          // Not logged in, just allow the free limit (stateless trial, e.g. for demo users)
        } else {
          // Logged-in, check user_usage
          // Get today's date string (YYYY-MM-DD)
          const today = new Date().toISOString().slice(0, 10);
          // Fetch or create user_usage row
          let { data: usage, error: usageErr } = await supabaseClient
            .from("user_usage")
            .select()
            .eq("user_id", userId)
            .maybeSingle();
          if (usageErr) {
            console.error('Usage row error:', usageErr);
          }

          // If new user, create usage record
          if (!usage) {
            const { data: insertUsage } = await supabaseClient
              .from('user_usage')
              .insert({ user_id: userId, last_reset_date: today, questions_generated: 0 })
              .select()
              .maybeSingle();
            usage = insertUsage;
          }

          // Reset daily if necessary
          if (usage && usage.last_reset_date !== today) {
            // Reset usage
            await supabaseClient
              .from("user_usage")
              .update({ questions_generated: 0, last_reset_date: today })
              .eq("user_id", userId);
            usage.questions_generated = 0;
            usage.last_reset_date = today;
          }

          if (usage && usage.questions_generated >= maxQuestions) {
            // Out of free trial!
            return new Response(
              JSON.stringify({
                error: "Free trial limit reached. Please upgrade to premium for unlimited questions.",
                limitReached: true,
                questionsAllowed: maxQuestions,
                questionsUsed: usage.questions_generated,
              }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      const questionsResult = await generateQuestions(analysisData, userId, supabaseClient, maxQuestions);

      // After generating, increment usage count for non-premium
      if (!userIsPremium && userId !== "anonymous" && questionsResult?.questions?.length) {
        // Type-safe
        let add = questionsResult.questions.length;
        // Get today's usage (again, to be sure)
        let { data: usage } = await supabaseClient
          .from("user_usage")
          .select()
          .eq("user_id", userId)
          .maybeSingle();
        await supabaseClient
          .from("user_usage")
          .update({ questions_generated: (usage?.questions_generated || 0) + add })
          .eq("user_id", userId);
      }

      return new Response(JSON.stringify({
        ...questionsResult,
        limit: maxQuestions,
        freeTrial: !userIsPremium,
        // Propagate usage for frontend
        questionsAllowed: maxQuestions,
        questionsUsed: userId === 'anonymous' ? 0 : (userIsPremium ? 0 : (await getUserUsageToday(supabaseClient, userId, maxQuestions))),
      }), {
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

  console.log('Analyzing content with Gemini AI...', { inputLength: input.length, inputType });

  const prompt = inputType === 'topic' 
    ? `Analyze the following topic for study purposes: "${input}". 

Extract 4-6 key concepts and subtopics that students should focus on. Format your response as a clear study outline with main topics and their subtopics.

Please structure your response like this:
1. **Main Topic Name**
   - Subtopic 1
   - Subtopic 2
   - Subtopic 3

2. **Second Main Topic**
   - Subtopic 1
   - Subtopic 2
   - Subtopic 3

Focus on the most important concepts for academic study.`
    : `Analyze the following study material: "${input}". 

Extract the main topics and key concepts that students should focus on. Organize into 4-6 major topics with 3-5 subtopics each.

Please structure your response like this:
1. **Main Topic Name**
   - Key concept 1
   - Key concept 2
   - Key concept 3

2. **Second Main Topic**
   - Key concept 1
   - Key concept 2
   - Key concept 3

Focus on concepts that would be important for exams and understanding.`;

  try {
    // Updated endpoint to use a newer Gemini model and correct API version
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
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
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response received:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      // Handle cases where the API returns a successful status but no content
      if (data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error(`Content blocked by Gemini API: ${data.promptFeedback.blockReason}`);
      }
      throw new Error('Invalid response format from Gemini API');
    }
    
    const analysisText = data.candidates[0].content.parts[0].text;
    console.log('Analysis text:', analysisText);
    
    // Parse the analysis into structured topics
    const topics = parseAnalysisIntoTopics(analysisText);
    
    return {
      topics,
      totalTopics: topics.length,
      totalSubtopics: topics.reduce((acc: number, topic: any) => acc + topic.subtopics.length, 0)
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to analyze content: ${error.message}`);
  }
}

function parseAnalysisIntoTopics(analysisText: string) {
  console.log('Parsing analysis text:', analysisText);
  
  const lines = analysisText.split('\n').filter(line => line.trim());
  const topics = [];
  let currentTopic = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Main topic (starts with number, **, ##, or ###)
    if (trimmed.match(/^\d+\.\s*\*\*.*\*\*|^\d+\.\s+[A-Z]|^\*\*.*\*\*|^##/)) {
      if (currentTopic && currentTopic.subtopics.length > 0) {
        topics.push(currentTopic);
      }
      
      let title = trimmed
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/^##\s*/, '')
        .replace(/^###\s*/, '')
        .trim();
      
      currentTopic = {
        title: title,
        subtopics: []
      };
    }
    // Subtopic (starts with -, *, •, or is indented)
    else if (trimmed.match(/^[-*•]\s+/) && currentTopic) {
      const subtopic = trimmed.replace(/^[-*•]\s+/, '').trim();
      if (subtopic && currentTopic.subtopics.length < 6) {
        currentTopic.subtopics.push(subtopic);
      }
    }
    // Handle numbered subtopics or plain text after a main topic
    else if (currentTopic && trimmed && !trimmed.match(/^\d+\./)) {
      if (currentTopic.subtopics.length < 6) {
        currentTopic.subtopics.push(trimmed);
      }
    }
  }

  // Add the last topic
  if (currentTopic && currentTopic.subtopics.length > 0) {
    topics.push(currentTopic);
  }

  // Ensure we have at least some default topics if parsing fails
  if (topics.length === 0) {
    console.log('Parsing failed, using default topics');
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

  console.log('Parsed topics:', topics);
  return topics.slice(0, 6); // Limit to 6 topics max
}

async function generateQuestions(analysisData: any, userId: string, supabaseClient: any, maxQuestions: number = 20) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('Generating questions with Gemini AI...');

  const topicsText = analysisData.topics.map((topic: any) =>
    `${topic.title}: ${topic.subtopics.join(', ')}`
  ).join('\n');

  const prompt = `Based on these study topics, generate ${maxQuestions} exam-style questions with detailed answers:

${topicsText}

For each question, provide:
1. A clear, well-formed question (mix of multiple choice, short answer, and essay questions)
2. A comprehensive answer/explanation
3. Difficulty level (Easy/Medium/Hard)
4. The main topic it covers

Format each question like this:
**Question 1:** [Your question here]
**Answer:** [Detailed answer/explanation]
**Difficulty:** Easy/Medium/Hard
**Topic:** [Main topic name]

---

Make the questions educational and test understanding, not just memorization.`;

  try {
    // Updated endpoint to use a newer Gemini model and correct API version
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
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
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      if (data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error(`Content blocked by Gemini API: ${data.promptFeedback.blockReason}`);
      }
      throw new Error('Invalid response format from Gemini API');
    }
    
    const questionsText = data.candidates[0].content.parts[0].text;
    
    // Parse questions into structured format
    const questions = parseQuestionsFromText(questionsText, analysisData.topics).slice(0, maxQuestions);

    // Only save sessions for premium
    let sessionId = null;
    if (userId !== 'anonymous') {
      try {
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
        } else {
          sessionId = sessionData.id;
        }
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
      }
    }

    return {
      questions,
      sessionId,
      totalQuestions: questions.length,
    };
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

function parseQuestionsFromText(questionsText: string, topics: any[]) {
  const blocks = questionsText.split('---').filter(block => block.trim());
  const questions = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    const lines = block.split('\n').filter(line => line.trim());
    
    let question = '';
    let answer = '';
    let difficulty = 'Medium';
    let topic = topics[i % topics.length]?.title || 'General';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.match(/^\*\*Question \d+:\*\*/)) {
        question = trimmed.replace(/^\*\*Question \d+:\*\*\s*/, '');
      } else if (trimmed.match(/^\*\*Answer:\*\*/)) {
        answer = trimmed.replace(/^\*\*Answer:\*\*\s*/, '');
      } else if (trimmed.match(/^\*\*Difficulty:\*\*/)) {
        const diffMatch = trimmed.match(/(Easy|Medium|Hard)/i);
        if (diffMatch) {
          difficulty = diffMatch[1];
        }
      } else if (trimmed.match(/^\*\*Topic:\*\*/)) {
        topic = trimmed.replace(/^\*\*Topic:\*\*\s*/, '');
      } else if (question && !answer && trimmed && !trimmed.startsWith('**')) {
        // Continue question on next line
        question += ' ' + trimmed;
      } else if (answer && trimmed && !trimmed.startsWith('**')) {
        // Continue answer on next line
        answer += ' ' + trimmed;
      }
    }
    
    if (question && answer) {
      questions.push({
        id: questions.length + 1,
        question: question.trim(),
        answer: answer.trim(),
        difficulty: difficulty,
        topic: topic
      });
    }
  }

  // Generate default questions if parsing fails
  if (questions.length === 0) {
    topics.forEach((topic, topicIndex) => {
      topic.subtopics.slice(0, 3).forEach((subtopic: string, subIndex: number) => {
        questions.push({
          id: questions.length + 1,
          question: `Explain the concept of "${subtopic}" in relation to ${topic.title}.`,
          answer: `This question focuses on understanding ${subtopic} within the context of ${topic.title}. Consider the key principles, definitions, and practical applications.`,
          difficulty: subIndex < 1 ? 'Easy' : subIndex < 2 ? 'Medium' : 'Hard',
          topic: topic.title
        });
      });
    });
  }

  return questions.slice(0, 20); // Limit to 20 questions
}

// Utility to get current usage count for user
async function getUserUsageToday(supabaseClient: any, userId: string, maxQuestions:number): Promise<number> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data: usage } = await supabaseClient.from("user_usage").select().eq("user_id", userId).maybeSingle();
    if (!usage) return 0;
    if (usage.last_reset_date !== today) return 0;
    return usage.questions_generated || 0;
  } catch {
    return 0;
  }
}
