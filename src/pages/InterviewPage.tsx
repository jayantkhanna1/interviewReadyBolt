import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, Phone, PhoneOff } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { createPersona, createConversation, deletePersona } from '../services/tavusService';

const InterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [conversationUrl, setConversationUrl] = useState<string>('');
  const [personaId, setPersonaId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [interviewData, setInterviewData] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('interviewData');
    if (!data) {
      navigate('/upload');
      return;
    }

    const parsedData = JSON.parse(data);
    setInterviewData(parsedData);
    initializeInterview(parsedData);
  }, [navigate]);

  const initializeInterview = async (data: any) => {
    try {
      setIsLoading(true);

      // Create persona with interview-specific context
      const systemPrompt = `You are an AI interviewer conducting a ${data.interviewType} interview. 
        Ask relevant questions based on the candidate's resume and the job description provided. 
        Be professional, engaging, and provide a realistic interview experience. 
        Ask follow-up questions based on the candidate's responses and evaluate their suitability for the role.
        Keep questions concise and allow the candidate time to respond fully.`;

      const context = `Interview Type: ${data.interviewType}
        Resume: ${data.resume}
        Job Description: ${data.jobDescription}
        
        Conduct a thorough ${data.interviewType.toLowerCase()} interview focusing on relevant skills and experience.`;

      const persona = await createPersona({
        persona_name: `${data.interviewType} Interviewer`,
        system_prompt: systemPrompt,
        context: context,
        pipeline_mode: 'full'
      });

      setPersonaId(persona.persona_id);

      // Create conversation
      const conversation = await createConversation({
        persona_id: persona.persona_id,
        replica_id: import.meta.env.VITE_TAVUS_DEFAULT_REPLICA_ID,
        conversation_name: `${data.interviewType} Interview Session`,
        conversational_context: `Let's begin your mock ${data.interviewType} interview. I'll ask you questions tailored to your resume and the job role. Answer each question clearly and confidently.`,
        custom_greeting: `Hello! I'm excited to conduct your ${data.interviewType} interview today. Let's get started with some questions about your background and experience.`,
        properties: {
          enable_recording: true,
          enable_closed_captions: true,
          max_call_duration: 3600,
          participant_left_timeout: 60
        }
      });

      setConversationUrl(conversation.conversation_url);
      setConversationId(conversation.conversation_id);
      setIsCallActive(true);

      // Store persona ID for cleanup
      sessionStorage.setItem('currentPersonaId', persona.persona_id);
      sessionStorage.setItem('currentConversationId', conversation.conversation_id);

    } catch (error) {
      console.error('Failed to initialize interview:', error);
      alert('Failed to start interview. Please try again.');
      navigate('/upload');
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = async () => {
    try {
      setIsLoading(true);
      
      // Clean up persona
      if (personaId) {
        await deletePersona(personaId);
      }

      // Store interview completion data
      const completionData = {
        ...interviewData,
        completedAt: Date.now(),
        transcript: transcript,
        conversationId: conversationId
      };
      
      sessionStorage.setItem('completedInterview', JSON.stringify(completionData));
      sessionStorage.removeItem('currentPersonaId');
      sessionStorage.removeItem('currentConversationId');

      navigate('/feedback');
    } catch (error) {
      console.error('Error ending interview:', error);
      navigate('/feedback');
    }
  };

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const storedPersonaId = sessionStorage.getItem('currentPersonaId');
      if (storedPersonaId) {
        try {
          await deletePersona(storedPersonaId);
        } catch (error) {
          console.error('Failed to cleanup persona:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header showBackButton title="Preparing Interview" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Setting up your AI interviewer..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header showBackButton title={`${interviewData?.interviewType} Interview`} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Call Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Interview Session</h3>
                    <p className="text-sm text-gray-300">
                      {interviewData?.interviewType} Interview • AI Interviewer
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Live</span>
                  </div>
                </div>
              </div>
              
              <div className="relative aspect-video bg-gray-900">
                {conversationUrl ? (
                  <iframe
                    src={conversationUrl}
                    className="w-full h-full"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner size="lg" text="Loading video call..." />
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="bg-gray-700 px-6 py-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setMicEnabled(!micEnabled)}
                    className={`p-3 rounded-full transition-colors ${
                      micEnabled 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className={`p-3 rounded-full transition-colors ${
                      videoEnabled 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={endInterview}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Info & Tips */}
          <div className="space-y-6">
            {/* Interview Details */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">Interview Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white font-medium">{interviewData?.interviewType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Resume</p>
                  <p className="text-white font-medium">{interviewData?.resume}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-green-400 font-medium">In Progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interview Tips */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">Interview Tips</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Speak clearly and maintain eye contact with the camera</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Take your time to think before answering</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Use specific examples from your experience</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Ask questions about the role and company</p>
                </div>
              </div>
            </div>

            {/* End Interview Button */}
            <button
              onClick={endInterview}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
            >
              End Interview & Get Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;