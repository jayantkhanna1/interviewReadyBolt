import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Briefcase, User, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [interviewType, setInterviewType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const interviewTypes = [
    { value: 'HR', label: 'HR Interview', icon: User },
    { value: 'Technical', label: 'Technical Interview', icon: FileText },
    { value: 'System Design', label: 'System Design Interview', icon: Briefcase }
  ];

  const handleResumeUpload = (file: File) => {
    if (file.type === 'application/pdf') {
      setResume(file);
    } else {
      alert('Please upload a PDF file for your resume.');
    }
  };

  const handleJobDescriptionFileUpload = (file: File) => {
    if (file.type === 'application/pdf' || file.type === 'text/plain') {
      setJobDescriptionFile(file);
      // Read file content for text files
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setJobDescription(e.target?.result as string);
        };
        reader.readAsText(file);
      }
    } else {
      alert('Please upload a PDF or text file for the job description.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'resume' | 'job') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (type === 'resume') {
        handleResumeUpload(files[0]);
      } else {
        handleJobDescriptionFileUpload(files[0]);
      }
    }
  };

  const handleStartInterview = async () => {
    if (!resume || (!jobDescription && !jobDescriptionFile) || !interviewType) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Store data in sessionStorage for the interview
      const interviewData = {
        resume: resume.name,
        jobDescription: jobDescription || jobDescriptionFile?.name,
        interviewType,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem('interviewData', JSON.stringify(interviewData));
      
      // Navigate to interview page
      navigate('/interview');
    } catch (error) {
      console.error('Error preparing interview:', error);
      alert('Failed to prepare interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Upload Your Documents" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prepare for Your Dream Job
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your resume and job description to get personalized AI-powered interview practice
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Resume Upload */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Upload Resume
            </h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : resume
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, 'resume')}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${resume ? 'text-green-500' : 'text-gray-400'}`} />
              {resume ? (
                <div>
                  <p className="text-green-400 font-medium">{resume.name}</p>
                  <p className="text-sm text-gray-400 mt-1">Resume uploaded successfully</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-2">Drag and drop your resume here</p>
                  <p className="text-sm text-gray-400 mb-4">or</p>
                  <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PDF files only</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
              Job Description
            </h3>
            
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : jobDescriptionFile
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, 'job')}
              >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${jobDescriptionFile ? 'text-green-500' : 'text-gray-400'}`} />
                {jobDescriptionFile ? (
                  <div>
                    <p className="text-green-400 font-medium text-sm">{jobDescriptionFile.name}</p>
                    <p className="text-xs text-gray-400">File uploaded</p>
                  </div>
                ) : (
                  <div>
                    <label className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm">
                      Upload File
                      <input
                        type="file"
                        accept=".pdf,.txt"
                        onChange={(e) => e.target.files?.[0] && handleJobDescriptionFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PDF or TXT</p>
                  </div>
                )}
              </div>
              
              <div className="text-center text-gray-400 text-sm">or</div>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Interview Type Selection */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Select Interview Type</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {interviewTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setInterviewType(type.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    interviewType === type.value
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <h4 className="font-medium">{type.label}</h4>
                  <p className="text-sm opacity-75 mt-1">
                    {type.value === 'HR' && 'Behavioral questions and company culture fit'}
                    {type.value === 'Technical' && 'Coding problems and technical knowledge'}
                    {type.value === 'System Design' && 'Architecture and scalability discussions'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Interview Button */}
        <div className="text-center">
          <button
            onClick={handleStartInterview}
            disabled={isLoading || !resume || (!jobDescription && !jobDescriptionFile) || !interviewType}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Preparing Interview...</span>
              </div>
            ) : (
              'Start AI Interview'
            )}
          </button>
          
          {(!resume || (!jobDescription && !jobDescriptionFile) || !interviewType) && (
            <p className="text-gray-400 text-sm mt-2">
              Please complete all fields to start your interview
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;