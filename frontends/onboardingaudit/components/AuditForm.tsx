import React, { useState, useCallback, useMemo } from 'react';
import { OnboardingAuditForm } from '../types/form';
import { OnboardingAuditClient } from '../lib/api';
import { createAnalyticsTracker } from '../lib/analytics';
import Tooltip from './Tooltip';

interface AuditFormProps {
  onSubmit: (success: boolean, message: string) => void;
}

export default function AuditForm({ onSubmit }: AuditFormProps) {
  const [formData, setFormData] = useState<OnboardingAuditForm>({
    // Step 1 - Product Basics
    product_name: '',
    signup_link: '',
    target_user: '',
    value_prop: '',
    icp_company_size: '',
    icp_industry: '',
    icp_primary_role: '',
    day1_jtbd: '',
    pricing_tier: '',
    main_competitor: '',
    
    // Step 2 - Current Onboarding Flow
    signup_methods: [],
    first_screen: '',
    track_dropoffs: '',
    activation_definition: '',
    aha_moment: '',
    time_to_aha_minutes: undefined,
    blocking_steps: [],
    platforms: [],
    compliance_constraints: [],
    
    // Step 2.5 - Analytics & Access
    analytics_tool: '',
    key_events: [],
    signups_per_week: undefined,
    mau: undefined,
    mobile_percent: undefined,
    readonly_access: undefined,
    access_instructions: '',
    
    // Step 3 - Goal & Metrics
    main_goal: '',
    know_churn_rate: undefined,
    churn_when: undefined,
    target_improvement_percent: undefined,
    time_horizon: undefined,
    main_segments: [],
    constraints: '',
    
    // Step 4 - Delivery
    report_email: '',
    include_benchmarks: false,
    want_ab_plan: false,
    screenshots: undefined,
    walkthrough_url: '',
    demo_account: '',
    
    // Optional Evidence
    feature_flags: undefined,
    ab_tool: '',
    languages: [],
    empty_states_urls: '',
    notifications_provider: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
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

  // Memoizar constantes para evitar recálculos
  const maxFileSize = useMemo(() => 10 * 1024 * 1024, []); // 10MB
  const maxIndividualSize = useMemo(() => 10 * 1024 * 1024, []); // 10MB por archivo

  // Optimizar handlers con useCallback
  const handleInputChange = useCallback((field: keyof OnboardingAuditForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('🔍 File upload triggered:', files.length, 'files selected');
    console.log('🔍 Files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    const validateFiles = async () => {
      const newFilesSize = files.reduce((total, file) => total + file.size, 0);
      console.log('🔍 New files total size:', newFilesSize, 'bytes');
      console.log('🔍 Current total size:', totalFileSize, 'bytes');
      console.log('🔍 Max allowed size:', maxFileSize, 'bytes');
      
      if (totalFileSize + newFilesSize > maxFileSize) {
        alert('Total file size exceeds 10MB limit. Please select smaller files or fewer files.');
        return;
      }
      
      const validationPromises = files.map(async (file) => {
        try {
          const validation = await OnboardingAuditClient.validateFile(file);
          return { file, validation };
        } catch (error) {
          return { file, validation: { isValid: false, errors: ['Validation failed'] } };
        }
      });
      
      const validationResults = await Promise.all(validationPromises);
      const invalidFiles = validationResults.filter(result => !result.validation.isValid);
      
      if (invalidFiles.length > 0) {
        const errorMessages = invalidFiles.map(result => 
          `${result.file.name}: ${result.validation.errors.join(', ')}`
        ).join('\n');
        alert(`Some files are invalid:\n${errorMessages}`);
        return;
      }
      
      console.log('🔍 All files validated successfully, updating state...');
      setUploadedFiles(prev => {
        const newFiles = [...prev, ...files];
        console.log('🔍 Updated uploadedFiles:', newFiles.length, 'total files');
        return newFiles;
      });
      setTotalFileSize(prev => {
        const newTotal = prev + newFilesSize;
        console.log('🔍 Updated totalFileSize:', newTotal, 'bytes');
        return newTotal;
      });
    };
    
    validateFiles();
  }, [totalFileSize, maxFileSize]);

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev[index];
      setTotalFileSize(current => current - fileToRemove.size);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Memoizar validaciones de archivos con Web Worker
  const fileValidation = useMemo(() => {
    if (uploadedFiles.length === 0) return { isValid: true, error: null };
    
    const oversizedFiles = uploadedFiles.filter(file => file.size > maxIndividualSize);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      return { 
        isValid: false, 
        error: `File(s) exceed 10MB limit: ${fileNames}. Please compress or split large files.` 
      };
    }
    
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxFileSize) {
      const totalMB = Math.round(totalSize / 1024 / 1024 * 100) / 100;
      return { 
        isValid: false, 
        error: `Total file size (${totalMB}MB) exceeds 10MB limit. Please reduce file sizes or upload fewer files.` 
      };
    }
    
    return { isValid: true, error: null };
  }, [uploadedFiles, maxIndividualSize, maxFileSize]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Submit triggered');
    console.log('🔍 Current uploadedFiles state:', uploadedFiles);
    console.log('🔍 Current totalFileSize state:', totalFileSize);
    console.log('🔍 File validation result:', fileValidation);
    
    setIsSubmitting(true);

    // Usar validación memoizada
    if (!fileValidation.isValid) {
      console.log('❌ File validation failed:', fileValidation.error);
      setIsSubmitting(false);
      onSubmit(false, fileValidation.error!);
      return;
    }

    try {
              // Transform form data to match backend expectations
        const transformedFormData = {
          ...formData,
          // Ensure arrays are properly formatted
          signup_methods: formData.signup_methods || [],
          blocking_steps: formData.blocking_steps || [],
          platforms: formData.platforms || [],
          compliance_constraints: formData.compliance_constraints || [],
          key_events: formData.key_events || [],
          main_segments: formData.main_segments || [],
          languages: formData.languages || [],
        };

        const response = await OnboardingAuditClient.submitForm(transformedFormData);
        
        if (response.success && response.submissionId) {
          // Track form submission in analytics
          const tracker = createAnalyticsTracker('onboardingaudit');
          tracker.trackPageVisit('form_submission');

          // Upload additional files if any
          if (uploadedFiles.length > 0 && response.folderId) {
          // Inicializar progreso de upload
          setUploadProgress({
            isUploading: true,
            currentFile: 'Processing files...',
            currentIndex: 0,
            totalFiles: uploadedFiles.length,
            successfulUploads: 0,
            failedUploads: 0,
            errors: []
          });
          
          try {
            // Actualizar progreso - Compresión
            setUploadProgress(prev => ({
              ...prev,
              currentFile: 'Compressing images...',
              currentIndex: 0
            }));
            
            console.log('🔍 Processing files for upload:', {
              totalFiles: uploadedFiles.length,
              fileTypes: uploadedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
              userAgent: navigator.userAgent,
              isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            });
            
            // Procesar compresión de imágenes en paralelo
            const processedFiles = await Promise.all(
              uploadedFiles.map(async (file, index) => {
                // Actualizar progreso de compresión
                setUploadProgress(prev => ({
                  ...prev,
                  currentFile: `Compressing ${file.name}...`,
                  currentIndex: index + 1
                }));
                
                console.log(`🔍 Processing file ${index + 1}/${uploadedFiles.length}:`, {
                  filename: file.name,
                  type: file.type,
                  size: file.size,
                  isImage: file.type.startsWith('image/')
                });
                
                if (file.type.startsWith('image/')) {
                  try {
                    console.log(`🖼️ Attempting compression for: ${file.name}`);
                    const compressionResult = await OnboardingAuditClient.compressImage(file);
                    console.log(`📊 Compression result for ${file.name}:`, {
                      originalSize: compressionResult.originalSize,
                      compressedSize: compressionResult.compressedSize,
                      ratio: compressionResult.compressionRatio
                    });
                    
                    if (compressionResult.compressionRatio !== '0') {
                      // Usar archivo comprimido si la compresión fue exitosa
                      const compressedFile = new File([compressionResult.blob], file.name, {
                        type: 'image/jpeg'
                      });
                      console.log(`✅ Using compressed file for ${file.name}:`, {
                        originalSize: file.size,
                        compressedSize: compressedFile.size
                      });
                      return compressedFile;
                    }
                  } catch (error) {
                    console.warn('⚠️ Image compression failed for', file.name, 'using original file. Error:', error);
                  }
                }
                
                console.log(`📄 Using original file for ${file.name}`);
                return file;
              })
            );
            
            console.log('🔍 Final processed files:', {
              count: processedFiles.length,
              files: processedFiles.map(f => ({ name: f.name, type: f.type, size: f.size }))
            });
            
            // Actualizar progreso - Upload
            setUploadProgress(prev => ({
              ...prev,
              currentFile: 'Uploading files to server...',
              currentIndex: uploadedFiles.length
            }));
            
            // Subir todos los archivos de una vez usando el nuevo método
            console.log('🚀 Starting upload with OnboardingAuditClient.uploadMultipleAssets:', {
              submissionId: response.submissionId,
              folderId: response.folderId,
              userEmail: formData.report_email,
              processedFilesCount: processedFiles.length
            });
            
            const uploadResult = await OnboardingAuditClient.uploadMultipleAssets(
              processedFiles, 
              response.submissionId!, 
              response.folderId!, 
              formData.report_email
            );
            
            console.log('📤 Upload result:', uploadResult);
            
            if (uploadResult.success) {
              setUploadProgress(prev => ({
                ...prev,
                successfulUploads: uploadedFiles.length,
                failedUploads: 0,
                currentFile: 'Upload completed successfully!'
              }));
            } else {
              setUploadProgress(prev => ({
                ...prev,
                successfulUploads: 0,
                failedUploads: uploadedFiles.length,
                errors: [uploadResult.message || 'Upload failed'],
                currentFile: 'Upload failed'
              }));
            }
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setUploadProgress(prev => ({
              ...prev,
              successfulUploads: 0,
              failedUploads: uploadedFiles.length,
              errors: [errorMessage],
              currentFile: 'Upload failed'
            }));
          }
          
          // Mostrar resultado final por 2 segundos antes de finalizar
          setTimeout(() => {
            setUploadProgress(prev => ({
              ...prev,
              isUploading: false
            }));
          }, 2000);
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
  }, [formData, uploadedFiles, uploadProgress.failedUploads, fileValidation, onSubmit]);

  // Optimizar navegación de pasos
  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev === 2) return 2.5;
      if (prev === 2.5) return 3;
      return Math.min(prev + 1, 5);
    });
  }, []);
  const prevStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev === 3) return 2.5;
      if (prev === 2.5) return 2;
      return Math.max(prev - 1, 1);
    });
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep === 2.5 ? 2.5 : currentStep) / 5 * 100}%` }}
        ></div>
      </div>
      
      <div className="text-center text-white mb-6">
        <span className="text-sm">Step {currentStep === 2.5 ? '2.5' : currentStep} of 5</span>
      </div>

      {/* File Upload Progress */}
      {uploadProgress.isUploading && (
        <div className="card bg-blue-900/30 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium">Processing Files...</h4>
            <span className="text-blue-300 text-sm">
              {uploadProgress.currentIndex} / {uploadProgress.totalFiles}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(uploadProgress.currentIndex / uploadProgress.totalFiles) * 100}%` }}
            ></div>
          </div>
          
          {/* Current File */}
          <div className="text-sm text-blue-200 mb-2">
            <span className="font-medium">Status:</span> {uploadProgress.currentFile}
          </div>
          
          {/* Status */}
          <div className="flex justify-between text-xs mb-2">
            <span className="text-green-400">
              ✅ {uploadProgress.successfulUploads} successful
            </span>
            <span className="text-red-400">
              ❌ {uploadProgress.failedUploads} failed
            </span>
          </div>
          
          {/* Progress Percentage */}
          <div className="text-center text-xs text-blue-300">
            {Math.round((uploadProgress.currentIndex / uploadProgress.totalFiles) * 100)}% Complete
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
                <Tooltip content="Name of the product being audited.">
                  Product name *
                </Tooltip>
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.product_name}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                placeholder="e.g., Acme Analytics"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Public link where a new user can start.">
                  Link to signup or homepage *
                </Tooltip>
              </label>
              <input
                type="url"
                required
                className="form-input"
                value={formData.signup_link}
                onChange={(e) => handleInputChange('signup_link', e.target.value)}
                placeholder="https://..."
              />
            </div>
            
                         <div>
               <label className="block text-white text-sm font-medium mb-2">
                 <Tooltip content="Main audience for your product.">
                   Who is your target user? *
                 </Tooltip>
               </label>
               <select
                 required
                 className="form-select"
                 value={formData.target_user}
                 onChange={(e) => handleInputChange('target_user', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="founders">Founders</option>
                 <option value="product_managers">Product Managers</option>
                 <option value="growth">Growth</option>
                 <option value="customer_success">Customer Success</option>
                 <option value="marketing">Marketing</option>
                 <option value="sales">Sales</option>
                 <option value="operations">Operations</option>
                 <option value="other">Other</option>
               </select>
             </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Short sentence describing the unique value your product provides.">
                  Value proposition (1 line) *
                </Tooltip>
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.value_prop}
                onChange={(e) => handleInputChange('value_prop', e.target.value)}
                placeholder="One-sentence unique value"
              />
            </div>

                         <div>
               <label className="block text-white text-sm font-medium mb-2">
                 <Tooltip content="Company size your product serves best.">
                   ICP — Company size *
                 </Tooltip>
               </label>
               <select
                 required
                 className="form-select"
                 value={formData.icp_company_size}
                 onChange={(e) => handleInputChange('icp_company_size', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="startup_1_20">Startup 1–20 employees</option>
                 <option value="smb_21_200">SMB 21–200 employees</option>
                 <option value="mid_200_1000">Mid-Market 200–1000</option>
                 <option value="enterprise_1000_plus">Enterprise 1000+</option>
               </select>
             </div>

                         <div>
               <label className="block text-white text-sm font-medium mb-2">
                 <Tooltip content="Industry your product serves best.">
                   ICP — Industry *
                 </Tooltip>
               </label>
               <select
                 required
                 className="form-select"
                 value={formData.icp_industry}
                 onChange={(e) => handleInputChange('icp_industry', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="saas">SaaS</option>
                 <option value="fintech">Fintech</option>
                 <option value="ecommerce">E-commerce</option>
                 <option value="healthtech">Healthtech</option>
                 <option value="edtech">Edtech</option>
                 <option value="cybersecurity">Cybersecurity</option>
                 <option value="logistics">Logistics</option>
                 <option value="productivity">Productivity</option>
                 <option value="devtools">DevTools</option>
                 <option value="other">Other</option>
               </select>
             </div>

                         <div>
               <label className="block text-white text-sm font-medium mb-2">
                 <Tooltip content="Primary role of the user who will use your product.">
                   ICP — Primary role *
                 </Tooltip>
               </label>
               <select
                 required
                 className="form-select"
                 value={formData.icp_primary_role}
                 onChange={(e) => handleInputChange('icp_primary_role', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="admin">Admin</option>
                 <option value="end_user">End-user</option>
                 <option value="technical_champion">Technical champion</option>
                 <option value="buyer">Buyer/Decision-maker</option>
                 <option value="finance_procurement">Finance/Procurement</option>
                 <option value="other">Other</option>
               </select>
             </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Main task or problem the user wants to solve on their first day.">
                  Primary JTBD (Job To Be Done) for Day-1 *
                </Tooltip>
              </label>
              <textarea
                required
                className="form-input"
                rows={3}
                value={formData.day1_jtbd}
                onChange={(e) => handleInputChange('day1_jtbd', e.target.value)}
                placeholder="Main task/problem the user aims to solve on day 1"
              />
            </div>

                         <div>
               <label className="block text-white text-sm font-medium mb-2">
                 <Tooltip content="Which pricing tier you want us to analyze for the audit.">
                   Pricing tier analyzed *
                 </Tooltip>
               </label>
               <select
                 required
                 className="form-select"
                 value={formData.pricing_tier}
                 onChange={(e) => handleInputChange('pricing_tier', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="free">Free</option>
                 <option value="trial">Trial</option>
                 <option value="starter">Starter</option>
                 <option value="pro">Pro</option>
                 <option value="business">Business</option>
                 <option value="enterprise">Enterprise</option>
               </select>
             </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Primary competitor for comparison.">
                  Main competitor
                </Tooltip>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.main_competitor}
                onChange={(e) => handleInputChange('main_competitor', e.target.value)}
                placeholder="e.g., Competitor Inc."
              />
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
                <Tooltip content="Available sign-up methods for new users.">
                  How do new users sign up today? *
                </Tooltip>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { value: 'email_password', label: 'Email & Password' },
                  { value: 'social_google', label: 'Social login (Google)' },
                  { value: 'social_facebook', label: 'Social login (Facebook)' },
                  { value: 'social_linkedin', label: 'Social login (LinkedIn)' },
                  { value: 'sso', label: 'SSO' },
                  { value: 'invitation_only', label: 'Invitation-only' },
                  { value: 'other', label: 'Other' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.signup_methods.includes(option.value)}
                      onChange={(e) => {
                        const newMethods = e.target.checked
                          ? [...formData.signup_methods, option.value]
                          : formData.signup_methods.filter(m => m !== option.value);
                        handleInputChange('signup_methods', newMethods);
                      }}
                    />
                    <span className="text-white text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
                         <div>
               <label className="block text-white text-sm font-medium mb-2">
                 <Tooltip content="What users encounter immediately after completing signup.">
                   After signup, what do users see first? *
                 </Tooltip>
               </label>
               <select
                 required
                 className="form-select"
                 value={formData.first_screen}
                 onChange={(e) => handleInputChange('first_screen', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="walkthrough">Guided walkthrough / tutorial</option>
                 <option value="empty_dashboard">Empty dashboard</option>
                 <option value="welcome_page">Welcome page</option>
                 <option value="setup_wizard">Setup wizard</option>
                 <option value="task_checklist">Task list / checklist</option>
                 <option value="other">Other</option>
               </select>
             </div>
            
                         <div>
               <label className="block text-white text-sm font-medium mb-2">
                 <Tooltip content="Whether you monitor where users abandon the onboarding process.">
                   Do you track drop-off points during onboarding? *
                 </Tooltip>
               </label>
               <select
                 required
                 className="form-select"
                 value={formData.track_dropoffs}
                 onChange={(e) => handleInputChange('track_dropoffs', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="full">Yes — full tracking</option>
                 <option value="partial">Yes — partial tracking</option>
                 <option value="no">No</option>
                 <option value="not_sure">Not sure</option>
               </select>
             </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Exact action(s) that define an activated user.">
                  Activation definition (event/condition) *
                </Tooltip>
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.activation_definition}
                onChange={(e) => handleInputChange('activation_definition', e.target.value)}
                placeholder="e.g., created_project & invited_user"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="The moment when users realize the value of your product.">
                  Aha moment (short)
                </Tooltip>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.aha_moment}
                onChange={(e) => handleInputChange('aha_moment', e.target.value)}
                placeholder="e.g., First report generated"
              />
            </div>

                         <div>
               <label className="block text-white text-sm font-medium mb-2">
                 <Tooltip content="How long it takes users to reach their aha moment. Specify the time and unit (e.g., 12 minutes, 2 hours, 3 days).">
                   Time-to-Aha
                 </Tooltip>
               </label>
               <input
                 type="text"
                 className="form-input"
                 value={formData.time_to_aha_minutes || ''}
                 onChange={(e) => handleInputChange('time_to_aha_minutes', e.target.value)}
                 placeholder="e.g., 12 minutes, 2 hours, 3 days"
               />
             </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Steps that might prevent users from completing onboarding.">
                  Blocking steps
                </Tooltip>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { value: 'email_verify', label: 'Email verification' },
                  { value: 'phone_sms', label: 'Phone/SMS' },
                  { value: 'credit_card', label: 'Credit card' },
                  { value: 'manual_approval', label: 'Manual approval' },
                  { value: 'paywall', label: 'Paywall' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.blocking_steps?.includes(option.value) || false}
                      onChange={(e) => {
                        const newSteps = e.target.checked
                          ? [...(formData.blocking_steps || []), option.value]
                          : (formData.blocking_steps || []).filter(s => s !== option.value);
                        handleInputChange('blocking_steps', newSteps);
                      }}
                    />
                    <span className="text-white text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Platforms where your onboarding flow is available.">
                  Platforms
                </Tooltip>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { value: 'web', label: 'Web' },
                  { value: 'ios', label: 'iOS' },
                  { value: 'android', label: 'Android' },
                  { value: 'extension', label: 'Extension' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.platforms?.includes(option.value) || false}
                      onChange={(e) => {
                        const newPlatforms = e.target.checked
                          ? [...(formData.platforms || []), option.value]
                          : (formData.platforms || []).filter(p => p !== option.value);
                        handleInputChange('platforms', newPlatforms);
                      }}
                    />
                    <span className="text-white text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Compliance requirements or SSO constraints that affect your onboarding.">
                  SSO / compliance constraints
                </Tooltip>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { value: 'sso', label: 'SSO' },
                  { value: 'gdpr', label: 'GDPR' },
                  { value: 'soc2', label: 'SOC2' },
                  { value: 'hipaa', label: 'HIPAA' },
                  { value: 'other', label: 'Other' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.compliance_constraints?.includes(option.value) || false}
                      onChange={(e) => {
                        const newConstraints = e.target.checked
                          ? [...(formData.compliance_constraints || []), option.value]
                          : (formData.compliance_constraints || []).filter(c => c !== option.value);
                        handleInputChange('compliance_constraints', newConstraints);
                      }}
                    />
                    <span className="text-white text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2.5: Analytics & Access */}
      {currentStep === 2.5 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Analytics & Access</h3>
          <div className="space-y-4">
                         <div>
               <label className="block text-white text-sm font-medium mb-2">
                 <Tooltip content="Which analytics platform you use to track user behavior.">
                   Analytics tool *
                 </Tooltip>
               </label>
               <select
                 required
                 className="form-select"
                 value={formData.analytics_tool}
                 onChange={(e) => handleInputChange('analytics_tool', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="ga4">GA4</option>
                 <option value="amplitude">Amplitude</option>
                 <option value="mixpanel">Mixpanel</option>
                 <option value="heap">Heap</option>
                 <option value="in_house">In-house</option>
                 <option value="other">Other</option>
               </select>
             </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Important user actions you currently track in your analytics.">
                  Key events available
                </Tooltip>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.key_events?.join(', ') || ''}
                onChange={(e) => handleInputChange('key_events', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                placeholder="signup, verified, tutorial_completed, aha_event, activated, invited_user, payment_started"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Average number of new user signups per week.">
                  Signups/week
                </Tooltip>
              </label>
              <input
                type="number"
                min={0}
                className="form-input"
                value={formData.signups_per_week || ''}
                onChange={(e) => handleInputChange('signups_per_week', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Monthly Active Users - users who engage with your product monthly.">
                  MAU
                </Tooltip>
              </label>
              <input
                type="number"
                min={0}
                className="form-input"
                value={formData.mau || ''}
                onChange={(e) => handleInputChange('mau', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Percentage of users who access your product via mobile devices.">
                  % mobile
                </Tooltip>
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="form-input"
                value={formData.mobile_percent || ''}
                onChange={(e) => handleInputChange('mobile_percent', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Whether you can provide read-only access or demo environment for the audit.">
                  Read-only access / demo
                </Tooltip>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="readonly_access"
                    value="yes"
                    checked={formData.readonly_access === 'yes'}
                    onChange={(e) => handleInputChange('readonly_access', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white text-sm">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="readonly_access"
                    value="no"
                    checked={formData.readonly_access === 'no'}
                    onChange={(e) => handleInputChange('readonly_access', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white text-sm">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Instructions for accessing your demo or read-only environment.">
                  Access instructions
                </Tooltip>
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.access_instructions}
                onChange={(e) => handleInputChange('access_instructions', e.target.value)}
                placeholder="How to access demo or read-only environment"
              />
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
                 <Tooltip content="Primary metric you want to improve through this audit.">
                   Main goal for this audit *
                 </Tooltip>
               </label>
               <select
                 required
                 className="form-select"
                 value={formData.main_goal}
                 onChange={(e) => handleInputChange('main_goal', e.target.value)}
               >
                 <option value="">Select...</option>
                 <option value="activation_rate">Activation rate</option>
                 <option value="time_to_aha">Time-to-Aha</option>
                 <option value="trial_to_paid">Trial→Paid</option>
                 <option value="retention_30">30-day retention</option>
                 <option value="retention_90">90-day retention</option>
                 <option value="other">Other</option>
               </select>
             </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Whether you currently track user churn rates.">
                  Do you know your churn rate?
                </Tooltip>
              </label>
              <select
                className="form-select"
                value={formData.know_churn_rate || ''}
                onChange={(e) => handleInputChange('know_churn_rate', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="not_sure">Not sure</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="At what point in the user journey do users typically leave.">
                  When does churn usually happen?
                </Tooltip>
              </label>
              <select
                className="form-select"
                value={formData.churn_when || ''}
                onChange={(e) => handleInputChange('churn_when', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="during_onboarding">During onboarding</option>
                <option value="first_week">First week</option>
                <option value="first_month">First month</option>
                <option value="one_to_three_months">1–3 months</option>
                <option value="after_three_months">After 3 months</option>
                <option value="not_sure">Not sure</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Percentage improvement you're aiming for in your main goal metric.">
                  Target improvement (%)
                </Tooltip>
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="form-input"
                value={formData.target_improvement_percent || ''}
                onChange={(e) => handleInputChange('target_improvement_percent', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 15"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Timeframe for implementing the improvements from the audit.">
                  Time horizon
                </Tooltip>
              </label>
              <select
                className="form-select"
                value={formData.time_horizon || ''}
                onChange={(e) => handleInputChange('time_horizon', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="4_weeks">4 weeks</option>
                <option value="8_weeks">8 weeks</option>
                <option value="12_weeks">12 weeks</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Primary user segments you want to focus on for this audit.">
                  Main segments
                </Tooltip>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { value: 'self_serve', label: 'Self-serve' },
                  { value: 'smb_admin', label: 'SMB admin' },
                  { value: 'end_user', label: 'End-user' },
                  { value: 'technical_champion', label: 'Technical champion' },
                  { value: 'buyer', label: 'Buyer' },
                  { value: 'other', label: 'Other' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.main_segments?.includes(option.value) || false}
                      onChange={(e) => {
                        const newSegments = e.target.checked
                          ? [...(formData.main_segments || []), option.value]
                          : (formData.main_segments || []).filter(s => s !== option.value);
                        handleInputChange('main_segments', newSegments);
                      }}
                    />
                    <span className="text-white text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Limitations or risks to consider when implementing improvements.">
                  Specific constraints/risks
                </Tooltip>
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.constraints}
                onChange={(e) => handleInputChange('constraints', e.target.value)}
                placeholder="Limitations or risks to consider"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Optional Evidence */}
      {currentStep === 4 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Optional Evidence</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Whether you have the infrastructure to run A/B tests or feature flags.">
                  Feature flags / A/B infrastructure available
                </Tooltip>
              </label>
              <select
                className="form-select"
                value={formData.feature_flags || ''}
                onChange={(e) => handleInputChange('feature_flags', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Specific tool you use for A/B testing or feature flags.">
                  A/B or feature flag tool (if any)
                </Tooltip>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.ab_tool}
                onChange={(e) => handleInputChange('ab_tool', e.target.value)}
                placeholder="e.g., LaunchDarkly, Optimizely"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Languages and regions your product supports.">
                  Languages / regions
                </Tooltip>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { value: 'english', label: 'English' },
                  { value: 'spanish', label: 'Spanish' },
                  { value: 'french', label: 'French' },
                  { value: 'german', label: 'German' },
                  { value: 'other', label: 'Other' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.languages?.includes(option.value) || false}
                      onChange={(e) => {
                        const newLanguages = e.target.checked
                          ? [...(formData.languages || []), option.value]
                          : (formData.languages || []).filter(l => l !== option.value);
                        handleInputChange('languages', newLanguages);
                      }}
                    />
                    <span className="text-white text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Links to screenshots or descriptions of your current empty states.">
                  Current empty states (screenshots or URLs)
                </Tooltip>
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.empty_states_urls}
                onChange={(e) => handleInputChange('empty_states_urls', e.target.value)}
                placeholder="Links to empty state screenshots or descriptions"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Tool you use for push notifications and in-app messaging.">
                  Push/in-app notifications (provider)
                </Tooltip>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.notifications_provider}
                onChange={(e) => handleInputChange('notifications_provider', e.target.value)}
                placeholder="e.g., OneSignal, Braze"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Delivery */}
      {currentStep === 5 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Delivery</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Email address where you want to receive your audit report.">
                  Your email to send the report *
                </Tooltip>
              </label>
              <input
                type="email"
                required
                className="form-input"
                value={formData.report_email}
                onChange={(e) => handleInputChange('report_email', e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Whether to include industry benchmarks in your audit report.">
                  Include benchmarks
                </Tooltip>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.include_benchmarks}
                  onChange={(e) => handleInputChange('include_benchmarks', e.target.checked)}
                />
                <span className="text-white text-sm">Include industry benchmarks in the report</span>
              </label>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Whether to include A/B testing recommendations in your audit report.">
                  Do you want an A/B experiment plan?
                </Tooltip>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.want_ab_plan}
                  onChange={(e) => handleInputChange('want_ab_plan', e.target.checked)}
                />
                <span className="text-white text-sm">Include A/B testing recommendations</span>
              </label>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Upload screenshots of your onboarding flow to help us provide more specific recommendations.">
                  Upload screenshots (optional)
                </Tooltip>
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
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Link to a video walkthrough of your onboarding flow (Loom, etc.).">
                  Walkthrough video (Loom)
                </Tooltip>
              </label>
              <input
                type="url"
                className="form-input"
                value={formData.walkthrough_url}
                onChange={(e) => handleInputChange('walkthrough_url', e.target.value)}
                placeholder="https://www.loom.com/share/..."
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Tooltip content="Demo account credentials or sandbox access for testing your onboarding flow.">
                  Demo account / sandbox
                </Tooltip>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.demo_account}
                onChange={(e) => handleInputChange('demo_account', e.target.value)}
                placeholder="Demo credentials or sandbox access"
              />
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
        
        {currentStep < 5 ? (
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
              ? `Processing Files... (${uploadProgress.currentIndex}/${uploadProgress.totalFiles})`
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