import { useState, useRef, useEffect } from 'react';
import { Download, FileText, ChevronLeft, Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ResumeForm } from './components/ResumeForm';
import { ResumePreview } from './components/ResumePreview';
import { initialResumeData, type ResumeData } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const ResumeBuilderPage = () => {
    const [resumeData, setResumeData] = useState<ResumeData>(() => {
        const saved = localStorage.getItem('resume_draft');
        return saved ? JSON.parse(saved) : initialResumeData;
    });
    const resumeRef = useRef<HTMLDivElement>(null);

    // Auto-save draft
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
        if (window.confirm('Are you sure you want to reset to the default template? This will erase your current draft.')) {
            setResumeData(initialResumeData);
            localStorage.setItem('resume_draft', JSON.stringify(initialResumeData));
            toast.success('Reset to default template');
        }
    };

    const handleDownload = async () => {
        if (!resumeRef.current) return;

        const toastId = toast.loading('Generating PDF...');
        try {
            const canvas = await html2canvas(resumeRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: 794, // A4 width in px at 96dpi (approx)
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`);

            toast.success('PDF downloaded successfully', { id: toastId });
        } catch (error) {
            console.error('PDF Generation failed:', error);
            toast.error('Failed to generate PDF', { id: toastId });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            {/* Header */}
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
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 transition-colors" onClick={handleReset}>
                        Reset to Default
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleSave}>
                        <Save className="w-4 h-4" /> Save
                    </Button>
                    <Button size="sm" className="gap-2" onClick={handleDownload}>
                        <Download className="w-4 h-4" /> Download PDF
                    </Button>
                </div>
            </header>

            {/* Content Split Layout */}
            <main className="flex-1 flex overflow-hidden">
                {/* Form Section - Left */}
                <div className="w-full lg:w-1/2 overflow-y-auto p-4 md:p-8 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/20">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Personalize Your Resume</h2>
                            <p className="text-sm text-gray-500">Your changes are automatically saved as you type.</p>
                        </div>
                        <ResumeForm data={resumeData} onChange={setResumeData} />
                    </div>
                </div>

                {/* Preview Section - Right */}
                <div className="hidden lg:flex w-1/2 overflow-y-auto bg-gray-100 dark:bg-gray-800/50 p-12 justify-center">
                    <div className="scale-[0.6] xl:scale-[0.85] origin-top h-fit shadow-2xl transition-transform duration-500 hover:scale-[0.9] xl:hover:scale-[1.0]">
                        <ResumePreview data={resumeData} ref={resumeRef} />
                    </div>
                </div>
            </main>
        </div>
    );
};
