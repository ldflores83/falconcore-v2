import React, { useState } from 'react';
import { OnboardingAuditForm } from '../types/form';
import { OnboardingAuditAPI } from '../lib/api';
import { getAnalytics } from '../lib/analytics';

interface AuditFormProps {
  onSubmit: (success: boolean, message: string) => void;
}

export default function AuditForm({ onSubmit }: AuditFormProps) {
  const [formData, setFormData] = useState<OnboardingAuditForm>({
    productName: '',
    productUrl: '',
    targetUser: 'Founders',
    signupMethod: 'Email & Password',
    signupMethodOther: '',
    firstTimeExperience: 'A guided walkthrough or tutorial',
    firstTimeExperienceOther: '',
    trackDropoff: 'No',
    hasTestAccess: false,
    testInstructions: '',
    onboardingEmails: 'Email',
    mainGoal: 'Activation',
    knowChurnRate: 'No',
    churnTiming: 'Not sure',
    specificConcerns: '',
    email: '',
    preferredFormat: 'Google Doc',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<{
    isUploading: boolean;
    currentFile: string;
    currentIndex: number;
    totalFiles: number;
    successfulUploads: number;
    failedUploads: number;
    errors: string[];
  }>({
    isUploading: false,
    currentFile: '',
    currentIndex: 0,
    totalFiles: 0,
    successfulUploads: 0,
    failedUploads: 0,
    errors: []
  });

  const handleInputChange = (field: keyof OnboardingAuditForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFilesSize = files.reduce((total, file) => total + file.size, 0);
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    
    if (totalFileSize + newFilesSize > maxSize) {
      alert('Total file size exceeds 10MB limit. Please select smaller files or fewer files.');
      return;
    }
    
    setUploadedFiles(prev => [...prev, ...files]);
    setTotalFileSize(prev => prev + newFilesSize);
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setTotalFileSize(prev => prev - fileToRemove.size);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar archivos antes de enviar
    const maxIndividualSize = 10 * 1024 * 1024; // 10MB por archivo
    const maxTotalSize = 10 * 1024 * 1024; // 10MB total
    
    if (uploadedFiles.length > 0) {
      // Validar archivos individuales
      const oversizedFiles = uploadedFiles.filter(file => file.size > maxIndividualSize);
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        setIsSubmitting(false);
        onSubmit(false, `File(s) exceed 10MB limit: ${fileNames}. Please compress or split large files.`);
        return;
      }
      
      // Validar tamaño total
      const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > maxTotalSize) {
        const totalMB = Math.round(totalSize / 1024 / 1024 * 100) / 100;
        setIsSubmitting(false);
        onSubmit(false, `Total file size (${totalMB}MB) exceeds 10MB limit. Please reduce file sizes or upload fewer files.`);
        return;
      }
    }

    try {
      const response = await OnboardingAuditAPI.submitForm(formData);
      console.log('🔍 Form submission response:', response);
      
      if (response.success && response.submissionId) {
        // Track form submission in analytics
        const analytics = getAnalytics();
        if (analytics) {
          analytics.trackFormSubmission(formData);
        }

        // Upload additional files if any
        if (uploadedFiles.length > 0 && response.folderId) {
          console.log('🔍 Uploading files with:', {
            submissionId: response.submissionId,
            folderId: response.folderId,
            userEmail: formData.email,
            filesCount: uploadedFiles.length
          });
          
          // Inicializar progreso de upload
          setUploadProgress({
            isUploading: true,
            currentFile: '',
            currentIndex: 0,
            totalFiles: uploadedFiles.length,
            successfulUploads: 0,
            failedUploads: 0,
            errors: []
          });
          
          const uploadResults = [];
          for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            
            // Actualizar progreso actual
            setUploadProgress(prev => ({
              ...prev,
              currentFile: file.name,
              currentIndex: i + 1
            }));
            
            try {
              console.log(`🔍 Uploading file: ${file.name} (${Math.round(file.size / 1024)}KB)`);
              const uploadResult = await OnboardingAuditAPI.uploadAsset(file, response.submissionId!, response.folderId!, formData.email);
              uploadResults.push({ file: file.name, success: true, result: uploadResult });
              console.log(`✅ File uploaded successfully: ${file.name}`);
              
              // Actualizar contador de éxitos
              setUploadProgress(prev => ({
                ...prev,
                successfulUploads: prev.successfulUploads + 1
              }));
            } catch (error) {
              console.error(`❌ Error uploading file ${file.name}:`, error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              uploadResults.push({ file: file.name, success: false, error: error });
              
              // Actualizar contador de errores
              setUploadProgress(prev => ({
                ...prev,
                failedUploads: prev.failedUploads + 1,
                errors: [...prev.errors, `${file.name}: ${errorMessage}`]
              }));
            }
          }
          
          // Finalizar progreso
          setUploadProgress(prev => ({
            ...prev,
            isUploading: false
          }));
          
          // Log upload summary
          const successfulUploads = uploadResults.filter(r => r.success).length;
          const failedUploads = uploadResults.filter(r => !r.success).length;
          console.log(`📊 Upload summary: ${successfulUploads} successful, ${failedUploads} failed`);
          
          if (failedUploads > 0) {
            console.warn('⚠️ Some files failed to upload:', uploadResults.filter(r => !r.success));
          }
        } else {
          console.log('⚠️ Skipping file upload:', {
            hasFiles: uploadedFiles.length > 0,
            hasFolderId: !!response.folderId,
            folderId: response.folderId
          });
        }
        
        // Mostrar mensaje final basado en el resultado de los uploads
        const finalMessage = uploadProgress.failedUploads > 0 
          ? `Your audit request has been submitted successfully! However, ${uploadProgress.failedUploads} file(s) failed to upload. You will receive your report within 48 hours.`
          : 'Your audit request has been submitted successfully! You will receive your report within 48 hours.';
        
        onSubmit(true, finalMessage);
      } else {
        // Handle specific backend errors
        let errorMessage = response.message || 'An error occurred. Please try again.';
        
        // Handle specific backend error messages
        if (errorMessage.includes('You already have a pending request')) {
          errorMessage = 'You already have a pending request. Please wait for it to be completed before submitting another. We want to give space to other users who also want to request analysis.';
        } else if (errorMessage.includes('We are currently working on pending requests')) {
          errorMessage = 'We are currently working on pending requests. Please try again later when more slots become available. We want to ensure the quality of each analysis.';
        } else if (errorMessage.includes('Missing required fields')) {
          errorMessage = 'Please complete all required fields.';
        } else if (errorMessage.includes('Service temporarily unavailable')) {
          errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
        }
        
        onSubmit(false, errorMessage);
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      let errorMessage = 'An error occurred. Please try again.';
      
      // Extract specific error message if available
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Handle specific errors
      if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (errorMessage.includes('413')) {
        errorMessage = 'File size too large. Please reduce file sizes and try again.';
      } else if (errorMessage.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      onSubmit(false, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        ></div>
      </div>
      
      <div className="text-center text-white mb-6">
        <span className="text-sm">Step {currentStep} of 4</span>
      </div>

      {/* File Upload Progress */}
      {uploadProgress.isUploading && (
        <div className="card bg-blue-900/30 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium">Uploading Files...</h4>
            <span className="text-blue-300 text-sm">
              {uploadProgress.currentIndex} / {uploadProgress.totalFiles}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(uploadProgress.currentIndex / uploadProgress.totalFiles) * 100}%` }}
            ></div>
          </div>
          
          {/* Current File */}
          <div className="text-sm text-blue-200 mb-2">
            <span className="font-medium">Current:</span> {uploadProgress.currentFile}
          </div>
          
          {/* Status */}
          <div className="flex justify-between text-xs">
            <span className="text-green-400">
              ✅ {uploadProgress.successfulUploads} successful
            </span>
            <span className="text-red-400">
              ❌ {uploadProgress.failedUploads} failed
            </span>
          </div>
          
          {/* Error Messages */}
          {uploadProgress.errors.length > 0 && (
            <div className="mt-3 p-2 bg-red-900/30 border border-red-500/30 rounded">
              <p className="text-red-200 text-xs font-medium mb-1">Upload Errors:</p>
              <ul className="text-red-300 text-xs space-y-1">
                {uploadProgress.errors.map((error, index) => (
                  <li key={index} className="truncate">• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Product Basics */}
      {currentStep === 1 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Product Basics</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Product name *
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="Enter your product name"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Link to your signup or homepage *
              </label>
              <input
                type="url"
                required
                className="form-input"
                value={formData.productUrl}
                onChange={(e) => handleInputChange('productUrl', e.target.value)}
                placeholder="https://yourproduct.com"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Who is your target user? *
              </label>
              <select
                required
                className="form-select"
                value={formData.targetUser}
                onChange={(e) => handleInputChange('targetUser', e.target.value)}
              >
                <option value="Founders">Founders</option>
                <option value="Developers">Developers</option>
                <option value="SMBs">SMBs</option>
                <option value="Consumers">Consumers</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Current Onboarding Flow */}
      {currentStep === 2 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Current Onboarding Flow</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                How do new users sign up today? *
              </label>
              <select
                required
                className="form-select"
                value={formData.signupMethod}
                onChange={(e) => handleInputChange('signupMethod', e.target.value)}
              >
                <option value="Email & Password">Email & Password</option>
                <option value="Google">Google</option>
                <option value="Invite-only">Invite-only</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Conditional field for signup method other */}
            {formData.signupMethod === 'Other' && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Please describe your signup method *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.signupMethodOther || ''}
                  onChange={(e) => handleInputChange('signupMethodOther', e.target.value)}
                  placeholder="Describe your signup process..."
                />
              </div>
            )}
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                After a new user signs up, what do they see first? *
              </label>
              <select
                required
                className="form-select"
                value={formData.firstTimeExperience}
                onChange={(e) => handleInputChange('firstTimeExperience', e.target.value)}
              >
                <option value="A guided walkthrough or tutorial">A guided walkthrough or tutorial</option>
                <option value="A blank/empty dashboard with a call-to-action">A blank/empty dashboard with a call-to-action</option>
                <option value="A checklist or progress bar to complete setup">A checklist or progress bar to complete setup</option>
                <option value="Something else (please describe)">Something else (please describe)</option>
              </select>
            </div>
            
            {/* Conditional field for first time experience other */}
            {formData.firstTimeExperience === 'Something else (please describe)' && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Please describe what new users see first *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.firstTimeExperienceOther || ''}
                  onChange={(e) => handleInputChange('firstTimeExperienceOther', e.target.value)}
                  placeholder="Describe what new users experience first..."
                />
              </div>
            )}
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Do you track drop-off points during onboarding? *
              </label>
              <select
                required
                className="form-select"
                value={formData.trackDropoff}
                onChange={(e) => handleInputChange('trackDropoff', e.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Goal & Metrics */}
      {currentStep === 3 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Goal & Metrics</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Main goal for this audit *
              </label>
              <select
                required
                className="form-select"
                value={formData.mainGoal}
                onChange={(e) => handleInputChange('mainGoal', e.target.value)}
              >
                <option value="Activation">Activation</option>
                <option value="Conversion">Conversion</option>
                <option value="Reduce churn">Reduce churn</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Do you know your churn rate? *
              </label>
              <select
                required
                className="form-select"
                value={formData.knowChurnRate}
                onChange={(e) => handleInputChange('knowChurnRate', e.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not yet">Not yet</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                When does churn usually happen? *
              </label>
              <select
                required
                className="form-select"
                value={formData.churnTiming}
                onChange={(e) => handleInputChange('churnTiming', e.target.value)}
              >
                <option value="24h">24h</option>
                <option value="1 week">1 week</option>
                <option value="1 month">1 month</option>
                <option value="Longer">Longer</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Any specific concerns? (Optional)
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.specificConcerns}
                onChange={(e) => handleInputChange('specificConcerns', e.target.value)}
                placeholder="Tell us about any specific issues you're facing..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Delivery */}
      {currentStep === 4 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Delivery</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Your email to send the report *
              </label>
              <input
                type="email"
                required
                className="form-input"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Preferred format *
              </label>
              <select
                required
                className="form-select"
                value={formData.preferredFormat}
                onChange={(e) => handleInputChange('preferredFormat', e.target.value)}
              >
                <option value="Google Doc">Google Doc</option>
                <option value="Google Slides">Google Slides</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Upload screenshots (Optional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="form-input"
                onChange={handleFileUpload}
              />
              <p className="text-xs text-gray-300 mt-1">
                Upload screenshots of your onboarding flow to help us provide more specific recommendations.
                <br />
                <strong>Limit: 10MB total</strong> • {uploadedFiles.length} file(s) uploaded • {Math.round(totalFileSize / 1024 / 1024 * 100) / 100}MB used
              </p>
              {uploadedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-300">
                    <strong>Uploaded files:</strong>
                  </p>
                  <ul className="text-xs text-gray-300 mt-1 space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="ml-2">{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-200">
                  <strong>Need to send more files?</strong> If you have additional screenshots or documents to share, 
                  please send them to <a href="mailto:luisdaniel883gmail.com" className="text-yellow-300 hover:text-yellow-200 underline">luisdaniel883gmail.com</a> 
                  with your product name in the subject line.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="btn-secondary"
          >
            Previous
          </button>
        )}
        
        {currentStep < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="btn-primary ml-auto"
          >
            Next
          </button>
        ) : (
                     <button
             type="submit"
             disabled={isSubmitting || uploadProgress.isUploading}
             className="btn-primary ml-auto"
           >
             {uploadProgress.isUploading 
               ? `Uploading Files... (${uploadProgress.currentIndex}/${uploadProgress.totalFiles})`
               : isSubmitting 
                 ? 'Submitting...' 
                 : 'Submit Audit Request'
             }
           </button>
        )}
      </div>
    </form>
  );
} 