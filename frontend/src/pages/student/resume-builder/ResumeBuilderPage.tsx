import { useMemo, useState, useEffect } from 'react';
import { Download, FileText, ChevronLeft, Save, ShieldCheck } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '../../../components/ui/Button';
import { ResumeForm } from './components/ResumeForm';
import { ResumePdfDocument } from './components/ResumePdfDocument';
import { ResumePreview } from './components/ResumePreview';
import { ResetResumeConfirmationModal } from './components/ResetResumeConfirmationModal';
import { initialResumeData, normalizeResumeData, type ResumeData } from './types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const getResumeFileName = (fullName: string) => {
    const safeName = fullName.trim().replace(/\s+/g, '_');
    return `${safeName || 'Resume'}_ATS_Resume.pdf`;
};

export const ResumeBuilderPage = () => {
    const [resumeData, setResumeData] = useState<ResumeData>(() => {
        const saved = localStorage.getItem('resume_draft');
        return saved ? normalizeResumeData(JSON.parse(saved)) : initialResumeData;
    });
    const [showResetModal, setShowResetModal] = useState(false);
    const pdfDocument = useMemo(() => <ResumePdfDocument data={resumeData} />, [resumeData]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localStorage.setItem('resume_draft', JSON.stringify(resumeData));
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [resumeData]);

    const handleSave = () => {
        localStorage.setItem('resume_draft', JSON.stringify(resumeData));
        toast.success('Draft saved successfully');
    };

    const handleReset = () => {
        setResumeData(initialResumeData);
        localStorage.setItem('resume_draft', JSON.stringify(initialResumeData));
        setShowResetModal(false);
        toast.success('Reset to default template');
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
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 transition-colors" onClick={() => setShowResetModal(true)}>
                        Reset to Default
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleSave}>
                        <Save className="w-4 h-4" /> Save
                    </Button>
                    <Button size="sm" className="gap-2" onClick={handleDownload}>
                        <Download className="w-4 h-4" /> Download ATS PDF
                    </Button>
                </div>
            </header>

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

            <ResetResumeConfirmationModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                onConfirm={handleReset}
            />
        </div>
    );
};
