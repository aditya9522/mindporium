import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, ChevronLeft, Save, ShieldCheck, UploadCloud, BriefcaseBusiness } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '../../../components/ui/Button';
import { ResumeForm } from './components/ResumeForm';
import { ResumePdfDocument } from './components/ResumePdfDocument';
import { ResumePreview } from './components/ResumePreview';
import { ResumeEntryPanel } from './components/ResumeEntryPanel';
import { JobTailorModal } from './components/JobTailorModal';
import { ResetResumeConfirmationModal } from './components/ResetResumeConfirmationModal';
import { initialResumeData, normalizeResumeData, type ResumeData } from './types';
import { resumeService } from '../../../services/resume.service';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const getResumeFileName = (fullName: string) => {
    const safeName = fullName.trim().replace(/\s+/g, '_');
    return `${safeName || 'Resume'}_ATS_Resume.pdf`;
};

const getSavedResumeDraft = () => {
    const saved = localStorage.getItem('resume_draft');
    if (!saved) {
        return null;
    }

    try {
        return normalizeResumeData(JSON.parse(saved));
    } catch {
        localStorage.removeItem('resume_draft');
        return null;
    }
};

export const ResumeBuilderPage = () => {
    const [resumeData, setResumeData] = useState<ResumeData>(() => {
        return getSavedResumeDraft() ?? initialResumeData;
    });
    const [builderStarted, setBuilderStarted] = useState(false);
    const [hasSavedDraft, setHasSavedDraft] = useState(() => Boolean(localStorage.getItem('resume_draft')));
    const [isImporting, setIsImporting] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showJobTailor, setShowJobTailor] = useState(false);
    const pdfDocument = useMemo(() => <ResumePdfDocument data={resumeData} />, [resumeData]);

    useEffect(() => {
        if (!builderStarted) {
            return;
        }

        const timeoutId = setTimeout(() => {
            localStorage.setItem('resume_draft', JSON.stringify(resumeData));
            setHasSavedDraft(true);
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [builderStarted, resumeData]);

    const handleStartNew = () => {
        setResumeData(initialResumeData);
        setBuilderStarted(true);
        setSelectedFileName(null);
    };

    const handleContinueDraft = () => {
        setResumeData(getSavedResumeDraft() ?? initialResumeData);
        setBuilderStarted(true);
        setSelectedFileName(null);
    };

    const handleChangeSource = () => {
        setBuilderStarted(false);
    };

    const handleUploadResume = async (file: File) => {
        const isSupportedFile = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.docx');
        if (!isSupportedFile) {
            toast.error('Upload a PDF or DOCX resume');
            return;
        }

        setSelectedFileName(file.name);
        setIsImporting(true);
        const toastId = toast.loading('Extracting resume details...');

        try {
            const importedResume = await resumeService.importResume(file);
            const nextResume = normalizeResumeData(importedResume.data);
            setResumeData(nextResume);
            setBuilderStarted(true);
            localStorage.setItem('resume_draft', JSON.stringify(nextResume));
            setHasSavedDraft(true);
            toast.success('Resume imported. Review and refine it before downloading.', { id: toastId });
        } catch (error) {
            const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
            toast.error(detail || 'Failed to import resume. Please try another file.', { id: toastId });
        } finally {
            setIsImporting(false);
        }
    };

    const handleSave = () => {
        localStorage.setItem('resume_draft', JSON.stringify(resumeData));
        setHasSavedDraft(true);
        toast.success('Draft saved successfully');
    };

    const handleReset = () => {
        setResumeData(initialResumeData);
        localStorage.setItem('resume_draft', JSON.stringify(initialResumeData));
        setHasSavedDraft(true);
        setShowResetModal(false);
        toast.success('Reset to default template');
    };

    const handleApplyTailoredResume = (nextResumeData: ResumeData) => {
        setResumeData(nextResumeData);
        localStorage.setItem('resume_draft', JSON.stringify(nextResumeData));
        setHasSavedDraft(true);
    };

    const handleDownload = async () => {
        const toastId = toast.loading('Generating ATS-friendly PDF...');

        try {
            const blob = await pdf(pdfDocument).toBlob();
            const fileName = getResumeFileName(resumeData.personalInfo.fullName);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');

            anchor.href = url;
            anchor.download = fileName;
            anchor.click();

            URL.revokeObjectURL(url);
            toast.success('ATS-friendly PDF downloaded successfully', { id: toastId });
        } catch (error) {
            console.error('PDF Generation failed:', error);
            toast.error('Failed to generate ATS-friendly PDF', { id: toastId });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-600" />
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Resume Builder</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {builderStarted && (
                        <>
                            <Button variant="ghost" size="sm" className="gap-2" onClick={handleChangeSource}>
                                <UploadCloud className="w-4 h-4" /> Change Source
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowJobTailor(true)}>
                                <BriefcaseBusiness className="w-4 h-4" /> Tailor To Job
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 transition-colors" onClick={() => setShowResetModal(true)}>
                                Reset to Default
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2" onClick={handleSave}>
                                <Save className="w-4 h-4" /> Save
                            </Button>
                            <Button size="sm" className="gap-2" onClick={handleDownload}>
                                <Download className="w-4 h-4" /> Download ATS PDF
                            </Button>
                        </>
                    )}
                </div>
            </header>

            {builderStarted ? (
                <main className="flex-1 flex overflow-hidden">
                    <div className="w-full lg:w-1/2 overflow-y-auto p-4 md:p-8 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/20">
                        <div className="max-w-2xl mx-auto">
                            <div className="mb-8 space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Build an ATS-Friendly Resume</h2>
                                    <p className="text-sm text-gray-500">Your changes are automatically saved as you type.</p>
                                </div>

                                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Resume optimized for hiring platforms</h3>
                                            <p className="text-sm text-emerald-800/90 dark:text-emerald-100/80 mt-1">
                                                Create a clean, professional resume with standard sections, readable structure, and a format designed to be easy for recruiters and application systems to review.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ResumeForm data={resumeData} onChange={setResumeData} />
                        </div>
                    </div>

                    <div className="hidden lg:flex w-1/2 overflow-hidden bg-gray-100 dark:bg-gray-800/50 p-4 xl:p-8 justify-center items-start">
                        <div className="h-full w-full max-w-4xl overflow-hidden">
                            <ResumePreview document={pdfDocument} />
                        </div>
                    </div>
                </main>
            ) : (
                <ResumeEntryPanel
                    hasSavedDraft={hasSavedDraft}
                    isImporting={isImporting}
                    selectedFileName={selectedFileName}
                    onStartNew={handleStartNew}
                    onContinueDraft={handleContinueDraft}
                    onUploadResume={handleUploadResume}
                />
            )}

            <ResetResumeConfirmationModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                onConfirm={handleReset}
            />
            <JobTailorModal
                isOpen={showJobTailor}
                resumeData={resumeData}
                onClose={() => setShowJobTailor(false)}
                onApply={handleApplyTailoredResume}
            />
        </div>
    );
};
