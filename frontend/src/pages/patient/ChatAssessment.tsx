import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { mentalHealthService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Heart, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Brain,
  Loader2,
  Mic,
  MicOff,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  isStreaming?: boolean;
  streamedContent?: string;
  prediction?: {
    disorder: string;
    confidence: number;
    confidence_level: string;
    recommendation: string;
  };
  reactions?: {
    helpful: boolean;
    notHelpful: boolean;
  };
  suggestions?: string[];
  metadata?: {
    wordCount?: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
    confidence?: number;
  };
}

interface ConversationState {
  currentTopic: string;
  responses: number[];
  topicIndex: number;
  isComplete: boolean;
  userAge?: number;
}

// Advanced AI conversation system with dynamic responses
const conversationTopics = [
  {
    id: 'greeting',
    botMessage: "Hello! I'm your AI mental health companion 🤖✨\n\nI'm here to have a thoughtful conversation with you about your wellbeing. Think of me as a knowledgeable friend who's here to listen and help.\n\n**What I can do:**\n• Have natural conversations about your mental health\n• Provide personalized insights and recommendations\n• Help you understand your feelings better\n• Connect you with the right resources\n\nBefore we begin, what would you like me to call you?",
    type: 'greeting'
  },
  {
    id: 'age',
    botMessage: "Nice to meet you! Before we start, could you tell me your age? This helps me provide more personalized insights.",
    type: 'age'
  },
  {
    id: 'interest_pleasure',
    botMessage: "Let's start with something simple. Over the past couple of weeks, how has your interest in doing things you usually enjoy been? Like hobbies, spending time with friends, or activities you normally love?",
    type: 'assessment',
    questionIndex: 0
  },
  {
    id: 'feeling_down',
    botMessage: "I appreciate you sharing that with me. Now, during these past two weeks, have you been feeling down, sad, or hopeless? It's completely normal to have these feelings sometimes.",
    type: 'assessment',
    questionIndex: 1
  },
  {
    id: 'sleep_problems',
    botMessage: "Thank you for being open. How has your sleep been lately? Are you having trouble falling asleep, staying asleep, or maybe sleeping too much?",
    type: 'assessment',
    questionIndex: 2
  },
  {
    id: 'tired_energy',
    botMessage: "Sleep definitely affects how we feel! Speaking of energy, have you been feeling more tired than usual or having less energy to do things?",
    type: 'assessment',
    questionIndex: 3
  },
  {
    id: 'appetite_changes',
    botMessage: "Energy levels can really impact our daily life. How about your appetite? Have you noticed any changes in how much you want to eat or your relationship with food?",
    type: 'assessment',
    questionIndex: 4
  },
  {
    id: 'feeling_bad_self',
    botMessage: "I understand. Sometimes our relationship with food reflects how we're feeling overall. Have you been having negative thoughts about yourself lately? Feeling like you've let yourself or others down?",
    type: 'assessment',
    questionIndex: 5
  },
  {
    id: 'trouble_concentration',
    botMessage: "Those thoughts can be really difficult to deal with. Have you noticed any trouble concentrating on things like work, reading, or watching TV?",
    type: 'assessment',
    questionIndex: 6
  },
  {
    id: 'feeling_nervous',
    botMessage: "Concentration issues are more common than you might think. Now, let's talk about anxiety - have you been feeling nervous, anxious, or on edge recently?",
    type: 'assessment',
    questionIndex: 7
  },
  {
    id: 'stop_worrying',
    botMessage: "Anxiety can be really challenging. When you do start worrying about things, do you find it hard to stop or control those worried thoughts?",
    type: 'assessment',
    questionIndex: 8
  },
  {
    id: 'worrying_much',
    botMessage: "Worry can definitely feel overwhelming sometimes. Do you find yourself worrying too much about different things in your life?",
    type: 'assessment',
    questionIndex: 9
  },
  {
    id: 'trouble_relaxing',
    botMessage: "It sounds like your mind has been quite busy. Have you been having trouble relaxing or finding it hard to sit still?",
    type: 'assessment',
    questionIndex: 10
  },
  {
    id: 'easily_annoyed',
    botMessage: "Restlessness can be exhausting. Have you been feeling more irritable than usual, or getting annoyed or angry more easily?",
    type: 'assessment',
    questionIndex: 11
  },
  {
    id: 'afraid_awful',
    botMessage: "Irritability often comes with stress. Have you been feeling afraid that something awful might happen?",
    type: 'assessment',
    questionIndex: 12
  },
  {
    id: 'thoughts_death',
    botMessage: "Fear and worry can be really heavy feelings. This next question is important - have you had any thoughts about death or hurting yourself? Please know that if you're having these thoughts, you're not alone and help is available.",
    type: 'assessment',
    questionIndex: 13
  },
  {
    id: 'overwhelmed',
    botMessage: "Thank you for trusting me with that. Have you been feeling overwhelmed by your daily responsibilities or life in general?",
    type: 'assessment',
    questionIndex: 14
  },
  {
    id: 'jumpy_startled',
    botMessage: "Feeling overwhelmed is completely understandable. Have you been feeling jumpy or easily startled by sounds or movements?",
    type: 'assessment',
    questionIndex: 15
  },
  {
    id: 'lost_interest',
    botMessage: "Being on edge can be really draining. Have you lost interest in activities or things that used to bring you joy?",
    type: 'assessment',
    questionIndex: 16
  },
  {
    id: 'mood_swings',
    botMessage: "Loss of interest in things we love can be particularly hard. Have you been experiencing mood swings or feeling like your emotions change quickly?",
    type: 'assessment',
    questionIndex: 17
  },
  {
    id: 'daily_stress',
    botMessage: "We're almost done! Last question - how difficult has it been for you to handle daily responsibilities and stress lately?",
    type: 'assessment',
    questionIndex: 18
  },
  {
    id: 'completion',
    botMessage: "Thank you so much for sharing all of that with me. You've been really brave and open. Let me analyze everything you've told me and provide you with some insights and recommendations. 🌟",
    type: 'completion'
  }
];

// Response options for natural conversation
const responseOptions = [
  { value: 0, labels: ["Not at all", "Never", "No issues", "I'm fine with this", "This doesn't apply to me"] },
  { value: 1, labels: ["Sometimes", "A few times", "Occasionally", "Once in a while", "Not too often"] },
  { value: 2, labels: ["Often", "Frequently", "Most days", "More than usual", "Quite a bit"] },
  { value: 3, labels: ["Almost always", "Every day", "Constantly", "All the time", "Very much so"] }
];

export default function ChatAssessment() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState>({
    currentTopic: 'greeting',
    responses: Array(19).fill(0),
    topicIndex: 0,
    isComplete: false
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationMode, setConversationMode] = useState<'assessment' | 'freeform'>('assessment');
  const [aiPersonality, setAiPersonality] = useState('empathetic'); // empathetic, professional, casual
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Start the conversation
    addBotMessage(conversationTopics[0].botMessage);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (content: string, prediction?: any, suggestions?: string[]) => {
    const messageId = Date.now().toString();
    const message: Message = {
      id: messageId,
      type: 'bot',
      content: '',
      streamedContent: '',
      timestamp: new Date(),
      prediction,
      suggestions,
      isStreaming: true
    };

    setIsTyping(true);
    
    // Add empty message first
    setTimeout(() => {
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
      setIsStreaming(true);
      setStreamingMessageId(messageId);
      
      // Start streaming the content
      streamBotResponse(messageId, content);
    }, 800 + Math.random() * 400);
  };

  const streamBotResponse = (messageId: string, fullContent: string) => {
    const words = fullContent.split(' ');
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentIndex >= words.length) {
        clearInterval(streamInterval);
        setIsStreaming(false);
        setStreamingMessageId(null);
        
        // Show quick replies after streaming completes
        const currentTopic = conversationTopics[conversationState.topicIndex];
        if (currentTopic?.type === 'assessment' && conversationMode === 'assessment') {
          setTimeout(() => setShowQuickReplies(true), 500);
        }
        return;
      }
      
      const wordsToAdd = Math.min(2 + Math.floor(Math.random() * 3), words.length - currentIndex);
      const newWords = words.slice(currentIndex, currentIndex + wordsToAdd);
      currentIndex += wordsToAdd;
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const newContent = msg.streamedContent + (msg.streamedContent ? ' ' : '') + newWords.join(' ');
          return {
            ...msg,
            streamedContent: newContent,
            content: currentIndex >= words.length ? fullContent : newContent
          };
        }
        return msg;
      }));
      
      scrollToBottom();
    }, 50 + Math.random() * 100); // Variable speed for natural feel
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    setShowQuickReplies(false);
  };

  const processUserResponse = async (input: string, responseValue?: number) => {
    addUserMessage(input);
    
    // Analyze user input for better responses
    const inputAnalysis = analyzeUserInput(input);
    
    if (conversationMode === 'freeform') {
      await handleFreeformConversation(input, inputAnalysis);
      return;
    }
    
    const currentTopic = conversationTopics[conversationState.topicIndex];
    
    if (currentTopic.type === 'greeting') {
      const name = extractName(input);
      setUserName(name);
      
      const response = generatePersonalizedGreeting(name, inputAnalysis);
      addBotMessage(response);
      
      setTimeout(() => moveToNextTopic(), 2000);
    } else if (currentTopic.type === 'age') {
      const age = extractAge(input);
      setConversationState(prev => ({ ...prev, userAge: age }));
      
      const response = generateAgeResponse(age, inputAnalysis);
      addBotMessage(response);
      
      setTimeout(() => moveToNextTopic(), 2000);
    } else if (currentTopic.type === 'assessment') {
      const newResponses = [...conversationState.responses];
      newResponses[currentTopic.questionIndex!] = responseValue ?? parseResponseToValue(input);
      
      setConversationState(prev => ({ ...prev, responses: newResponses }));
      
      const response = await generateContextualResponse(input, inputAnalysis, currentTopic, newResponses);
      addBotMessage(response.content, response.prediction, response.suggestions);
      
      // Provide intermediate predictions
      if ((currentTopic.questionIndex! + 1) % 4 === 0 && currentTopic.questionIndex! < 18) {
        setTimeout(() => provideIntermediatePrediction(newResponses), 3000);
      }
      
      setTimeout(() => moveToNextTopic(), 2500);
    } else if (currentTopic.type === 'completion') {
      await provideFinalPrediction();
    }
  };

  const analyzeUserInput = (input: string) => {
    const wordCount = input.trim().split(/\s+/).length;
    const sentiment = analyzeSentiment(input);
    const emotionalWords = extractEmotionalWords(input);
    const urgencyLevel = detectUrgency(input);
    
    return {
      wordCount,
      sentiment,
      emotionalWords,
      urgencyLevel,
      isDetailed: wordCount > 10,
      hasEmotionalContent: emotionalWords.length > 0
    };
  };

  const analyzeSentiment = (text: string) => {
    const positiveWords = ['good', 'great', 'happy', 'better', 'fine', 'okay', 'well', 'positive', 'hopeful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'depressed', 'anxious', 'worried', 'scared', 'angry', 'frustrated'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  };

  const extractEmotionalWords = (text: string) => {
    const emotionalWords = ['anxious', 'depressed', 'sad', 'angry', 'frustrated', 'overwhelmed', 'stressed', 'worried', 'scared', 'hopeless', 'lonely', 'tired', 'exhausted'];
    return text.toLowerCase().split(/\s+/).filter(word => emotionalWords.includes(word));
  };

  const detectUrgency = (text: string) => {
    const urgentPhrases = ['help', 'crisis', 'emergency', 'suicide', 'hurt myself', 'can\'t take it', 'desperate'];
    const hasUrgentContent = urgentPhrases.some(phrase => text.toLowerCase().includes(phrase));
    return hasUrgentContent ? 'high' : 'normal';
  };

  const extractName = (input: string) => {
    // More sophisticated name extraction
    const namePatterns = [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /call me (\w+)/i,
      /(\w+) here/i
    ];
    
    for (const pattern of namePatterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    
    // Fallback: first word if it looks like a name
    const firstWord = input.trim().split(' ')[0];
    if (firstWord.length > 1 && /^[A-Za-z]+$/.test(firstWord)) {
      return firstWord;
    }
    
    return 'Friend';
  };

  const extractAge = (input: string) => {
    const ageMatch = input.match(/(\d{1,2})/);
    if (ageMatch) {
      const age = parseInt(ageMatch[1]);
      if (age >= 4 && age <= 100) return age;
    }
    return 25;
  };

  const generatePersonalizedGreeting = (name: string, analysis: any) => {
    const greetings = [
      `Nice to meet you, ${name}! 😊 I can sense you're ready to have an open conversation about your wellbeing. That takes courage, and I'm honored you're sharing this space with me.`,
      `Hello ${name}! 👋 I'm really glad you're here. Taking the step to talk about mental health shows incredible self-awareness and strength.`,
      `Welcome ${name}! ✨ I'm here to listen and support you through this conversation. Your mental health journey is unique, and I'm here to help you understand it better.`
    ];
    
    const baseGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    if (analysis.urgencyLevel === 'high') {
      return baseGreeting + "\n\n⚠️ I notice you might be going through a difficult time right now. Please know that if you're in crisis, you can reach out to a crisis helpline immediately. I'm here to support you, but professional help is always available.";
    }
    
    return baseGreeting + "\n\nBefore we dive into our conversation, could you tell me your age? This helps me provide more personalized insights and recommendations.";
  };

  const generateAgeResponse = (age: number, analysis: any) => {
    let response = `Thank you for sharing that, ${userName}! `;
    
    if (age < 18) {
      response += `I understand that being ${age} can come with unique challenges. Adolescence and young adulthood bring many changes, and it's completely normal to have questions about your mental health during this time.`;
    } else if (age < 30) {
      response += `At ${age}, you're in a phase of life that often involves significant transitions - career, relationships, independence. These changes can impact mental health in various ways.`;
    } else if (age < 50) {
      response += `Being ${age} often means balancing many responsibilities. It's important to take care of your mental health alongside everything else you're managing.`;
    } else {
      response += `At ${age}, you bring valuable life experience to this conversation. Mental health is important at every stage of life, and I'm here to support you.`;
    }
    
    response += `\n\nNow, let's start our conversation naturally. I'd like to understand how you've been feeling lately. Over the past couple of weeks, how has your interest been in doing things you usually enjoy?\n\n💭 *Feel free to share as much or as little as you're comfortable with. I'm here to listen.*`;
    
    return response;
  };

  const generateContextualResponse = async (input: string, analysis: any, currentTopic: any, responses: number[]) => {
    const empathyResponses = {
      negative: [
        "I can hear that this has been really challenging for you. ",
        "That sounds incredibly difficult to deal with. ",
        "I'm sorry you've been experiencing this. ",
        "It takes strength to share something that's been hard for you. "
      ],
      positive: [
        "I'm glad to hear there are some positive aspects! ",
        "That's wonderful that you're managing well with this. ",
        "It's great to hear some brightness in your experience. ",
        "I appreciate you sharing both the challenges and the positives. "
      ],
      neutral: [
        "Thank you for sharing that with me. ",
        "I appreciate your openness about this. ",
        "That gives me a good sense of your experience. ",
        "I understand what you're describing. "
      ]
    };
    
    const baseResponse = empathyResponses[analysis.sentiment][Math.floor(Math.random() * empathyResponses[analysis.sentiment].length)];
    
    // Generate follow-up based on emotional content
    let followUp = "";
    if (analysis.hasEmotionalContent) {
      followUp = `I notice you mentioned feeling ${analysis.emotionalWords.join(' and ')}. These are important feelings to acknowledge. `;
    }
    
    // Add next question
    const nextQuestionIndex = currentTopic.questionIndex + 1;
    const nextQuestion = getNextQuestion(nextQuestionIndex, analysis);
    
    // Generate suggestions based on input
    const suggestions = generateSuggestions(input, analysis);
    
    return {
      content: baseResponse + followUp + nextQuestion,
      suggestions,
      prediction: null
    };
  };

  const getNextQuestion = (index: number, analysis: any) => {
    const questions = [
      "How have you been feeling emotionally these past two weeks? Have there been moments of sadness, hopelessness, or feeling down?",
      "Let's talk about sleep. How has your sleep been lately? Any trouble falling asleep, staying asleep, or changes in your sleep patterns?",
      "How are your energy levels? Have you been feeling more tired than usual or having less energy for daily activities?",
      "I'd like to understand your relationship with food lately. Have you noticed any changes in your appetite or eating patterns?",
      "Sometimes we can be our own harshest critics. Have you been having negative thoughts about yourself or feeling like you've disappointed others?",
      "How has your focus been? Any trouble concentrating on work, reading, conversations, or other activities?",
      "Let's explore anxiety. Have you been feeling nervous, anxious, or on edge more than usual?",
      "When worries come up, how easy or difficult is it for you to let them go or stop thinking about them?",
      "Do you find yourself worrying about many different things, even small ones?",
      "How about relaxation? Have you been having trouble winding down or feeling restless?",
      "Have you noticed changes in your patience or irritability? Getting annoyed or angry more easily than usual?",
      "Sometimes anxiety can make us feel like something bad might happen. Have you been experiencing fears or worries about awful things occurring?",
      "This is an important question, and please know you're safe here: Have you had any thoughts about death or harming yourself?",
      "How overwhelming do daily responsibilities feel right now? Work, relationships, household tasks - how manageable does it all seem?",
      "Have you been feeling jumpy, easily startled, or on high alert?",
      "What about activities you used to enjoy? Have you lost interest in hobbies, socializing, or things that used to bring you pleasure?",
      "How stable do your emotions feel? Any mood swings or feeling like your emotions change quickly?",
      "Finally, thinking about stress and daily life - how difficult has it been to handle your regular responsibilities lately?"
    ];
    
    if (index < questions.length) {
      let question = questions[index];
      
      // Personalize based on analysis
      if (analysis.sentiment === 'negative') {
        question = "I want to make sure I understand your experience fully. " + question;
      } else if (analysis.isDetailed) {
        question = "Thank you for sharing so thoughtfully. " + question;
      }
      
      return question;
    }
    
    return "We're almost done with our conversation. Is there anything else about your mental health that you'd like to share with me?";
  };

  const generateSuggestions = (input: string, analysis: any) => {
    if (analysis.sentiment === 'negative') {
      return [
        "It's been really difficult",
        "I'm struggling with this daily",
        "This affects everything I do",
        "I need help with this"
      ];
    } else if (analysis.sentiment === 'positive') {
      return [
        "I'm managing okay",
        "Some days are better than others",
        "I have good support",
        "I'm working on it"
      ];
    }
    
    return [
      "Sometimes yes, sometimes no",
      "It varies day to day",
      "I'm not sure how to describe it",
      "It's complicated"
    ];
  };

  const handleFreeformConversation = async (input: string, analysis: any) => {
    // Handle open-ended conversation outside of assessment
    const response = await generateFreeformResponse(input, analysis);
    addBotMessage(response.content, null, response.suggestions);
  };

  const generateFreeformResponse = async (input: string, analysis: any) => {
    // This would ideally call a more sophisticated AI service
    // For now, we'll use rule-based responses
    
    if (analysis.urgencyLevel === 'high') {
      return {
        content: "I'm concerned about what you're sharing. If you're in immediate danger, please contact emergency services or a crisis hotline right away. I'm here to support you, but professional help is crucial right now. Would you like me to provide some crisis resources?",
        suggestions: ["Yes, please provide resources", "I'm safe right now", "I want to continue talking"]
      };
    }
    
    const responses = [
      "I hear you, and what you're sharing is important. Can you tell me more about how this is affecting your daily life?",
      "That sounds like a significant experience. How long have you been feeling this way?",
      "Thank you for trusting me with this. What do you think might be helpful for you right now?",
      "I appreciate your openness. Have you been able to talk to anyone else about this?"
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      suggestions: ["Tell me more", "I'm not sure", "This is new for me", "I've felt this before"]
    };
  };

  const parseResponseToValue = (input: string): number => {
    const lowerInput = input.toLowerCase();
    
    // Strong indicators for each level
    if (lowerInput.includes('never') || lowerInput.includes('not at all') || lowerInput.includes('no')) return 0;
    if (lowerInput.includes('always') || lowerInput.includes('every day') || lowerInput.includes('constantly')) return 3;
    if (lowerInput.includes('often') || lowerInput.includes('frequently') || lowerInput.includes('most')) return 2;
    if (lowerInput.includes('sometimes') || lowerInput.includes('occasionally') || lowerInput.includes('few')) return 1;
    
    // Default to moderate if unclear
    return 1;
  };

  const moveToNextTopic = () => {
    const nextIndex = conversationState.topicIndex + 1;
    if (nextIndex < conversationTopics.length) {
      setConversationState(prev => ({ 
        ...prev, 
        topicIndex: nextIndex,
        currentTopic: conversationTopics[nextIndex].id
      }));
      
      setTimeout(() => {
        let message = conversationTopics[nextIndex].botMessage;
        if (userName && message.includes('you')) {
          message = message.replace(/\bLet's\b/g, `Let's`);
        }
        addBotMessage(message);
      }, 1500);
    }
  };

  const provideIntermediatePrediction = async (responses: number[]) => {
    try {
      const result = await mentalHealthService.predict({
        symptoms: responses,
        language: language,
        age: conversationState.userAge || 25
      });

      const encouragingMessages = [
        "Based on what you've shared so far, I'm getting a clearer picture. ",
        "Thank you for being so open with me. From our conversation, ",
        "I appreciate your honesty. Looking at your responses, "
      ];

      const randomEncouragement = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      
      const intermediateMessage = `${randomEncouragement}I'm seeing some patterns that suggest you might be experiencing ${result.prediction.toLowerCase()}. My confidence in this assessment is ${Math.round(result.confidence * 100)}%. Let's continue so I can give you more accurate insights! 💙`;
      
      setTimeout(() => {
        addBotMessage(intermediateMessage, {
          disorder: result.prediction,
          confidence: result.confidence,
          confidence_level: result.confidence_level,
          recommendation: result.recommendation
        });
      }, 2000);
    } catch (error) {
      console.error('Intermediate prediction error:', error);
    }
  };

  const provideFinalPrediction = async () => {
    setLoading(true);
    try {
      const result = await mentalHealthService.predict({
        symptoms: conversationState.responses,
        language: language,
        age: conversationState.userAge || 25
      });

      const finalMessage = `${userName ? `${userName}, ` : ''}based on our entire conversation, here's what I've learned about your mental health:

🎯 **Assessment Result**: ${result.prediction}
📊 **Confidence Level**: ${Math.round(result.confidence * 100)}% (${result.confidence_level})
💡 **My Recommendation**: ${result.recommendation}

${result.confidence >= 0.7 
  ? "I'm quite confident in this assessment. " 
  : "While there are some indicators, I'd recommend speaking with a professional for a more comprehensive evaluation. "
}

Remember, you've taken a brave step by being so open about your feelings. Mental health is just as important as physical health, and seeking support shows strength, not weakness. 🌟

Would you like me to help you find a therapist who specializes in ${result.prediction.toLowerCase()}?`;

      setTimeout(() => {
        addBotMessage(finalMessage, {
          disorder: result.prediction,
          confidence: result.confidence,
          confidence_level: result.confidence_level,
          recommendation: result.recommendation
        });
        
        setConversationState(prev => ({ ...prev, isComplete: true }));
      }, 2000);

      // Navigate to results after a delay
      setTimeout(() => {
        navigate('/assessment/result', {
          state: {
            prediction: result.prediction,
            confidence: result.confidence,
            recommendation: result.recommendation,
            chatMode: true
          }
        });
      }, 8000);

    } catch (error: any) {
      console.error('Final prediction error:', error);
      toast.error('Something went wrong with the assessment. Please try again.');
      addBotMessage("I'm sorry, I encountered an issue processing your assessment. Would you like to try again or speak with a human therapist instead?");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;
    processUserResponse(currentInput);
    setCurrentInput('');
  };

  const handleQuickReply = (value: number, label: string) => {
    processUserResponse(label, value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentTopic = conversationTopics[conversationState.topicIndex];
  const progress = (conversationState.topicIndex / conversationTopics.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Mental Health AI Assistant
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Online • Secure & Private</span>
                  <Shield className="w-3 h-3" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConversationMode(conversationMode === 'assessment' ? 'freeform' : 'assessment')}
              >
                {conversationMode === 'assessment' ? 'Free Chat' : 'Assessment'}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          {conversationMode === 'assessment' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Assessment Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Chat Container */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Mental Health Companion
              <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
                AI Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.prediction && (
                      <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4" />
                          <span className="text-xs font-medium">Live Assessment</span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div>Condition: {message.prediction.disorder}</div>
                          <div>Confidence: {Math.round(message.prediction.confidence * 100)}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {showQuickReplies && currentTopic?.type === 'assessment' && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">Quick responses:</p>
                <div className="grid grid-cols-2 gap-2">
                  {responseOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(option.value, option.labels[0])}
                      className="text-left justify-start h-auto py-2 px-3"
                    >
                      <span className="text-xs">{option.labels[0]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    conversationState.isComplete 
                      ? "Assessment complete! Check your results above." 
                      : "Type your response here..."
                  }
                  disabled={conversationState.isComplete || loading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || conversationState.isComplete || loading}
                  className="gradient-primary"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {conversationState.isComplete && (
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => navigate('/therapists')}
                    className="flex-1 gradient-primary"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Find a Therapist
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alternative Option */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Prefer a traditional questionnaire format?
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/assessment')}
            className="text-sm"
          >
            Switch to Questionnaire Mode
          </Button>
        </div>
      </div>
    </div>
  );
}