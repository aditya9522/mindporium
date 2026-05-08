import React from 'react';
import toast from 'react-hot-toast';
import { BriefcaseBusiness, Sparkles, X } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { careerToolsService, type JobMatchedResumeResult } from '../../../../services/career-tools.service';
import { normalizeResumeData, type ResumeData } from '../types';

interface Props {
    isOpen: boolean;
    resumeData: ResumeData;
    onClose: () => void;
    onApply: (resumeData: ResumeData) => void;
}

export const JobTailorModal: React.FC<Props> = ({ isOpen, resumeData, onClose, onApply }) => {
    const [targetRole, setTargetRole] = React.useState('');
    const [jobDescription, setJobDescription] = React.useState('');
    const [result, setResult] = React.useState<JobMatchedResumeResult | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (jobDescription.trim().length < 30) {
            toast.error('Paste a complete job description first');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await careerToolsService.generateJobMatchedResume(resumeData, jobDescription, targetRole);
            setResult({ ...response, tailoredResumeData: normalizeResumeData(response.tailoredResumeData) });
            toast.success('Tailored resume draft ready');
        } catch (error) {
            console.error(error);
            toast.error('Unable to tailor resume right now');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = () => {
        if (!result) return;
        onApply(normalizeResumeData(result.tailoredResumeData));
        toast.success('Tailored resume applied. Review it before downloading.');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40">
                            <BriefcaseBusiness className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tailor Resume To A Job</h2>
                            <p className="text-sm text-gray-500">Optimize your current resume draft for one specific role.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-4 border-b border-gray-200 p-6 dark:border-gray-800 lg:border-b-0 lg:border-r">
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Target Role</label>
                            <input
                                value={targetRole}
                                onChange={(event) => setTargetRole(event.target.value)}
                                placeholder="AI Engineer, Frontend Developer, Product Analyst..."
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Job Description</label>
                            <textarea
                                value={jobDescription}
                                onChange={(event) => setJobDescription(event.target.value)}
                                rows={16}
                                placeholder="Paste the job description here..."
                                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                            />
                        </div>
                        <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full gap-2">
                            <Sparkles className="h-4 w-4" /> Generate Tailored Draft
                        </Button>
                    </div>

                    <div className="p-6">
                        {result ? (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800/70">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-gray-500">Match Score</p>
                                        <p className="text-4xl font-bold text-primary-600">{result.matchScore}<span className="text-base text-gray-400">/100</span></p>
                                    </div>
                                    <Button onClick={handleApply}>Apply To Resume</Button>
                                </div>
                                <Insight title="Strong Keywords" items={result.strongKeywords} />
                                <Insight title="Missing Keywords" items={result.missingKeywords} />
                                <Insight title="Rewrite Notes" items={result.rewriteNotes} />
                                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tailored Summary</h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{result.tailoredResumeData.summary}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
                                <BriefcaseBusiness className="h-12 w-12 text-gray-300" />
                                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Job intelligence appears here</h3>
                                <p className="mt-2 max-w-sm text-sm text-gray-500">
                                    You will get a match score, missing keywords, rewrite notes, and an apply-ready resume draft.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Insight = ({ title, items }: { title: string; items: string[] }) => (
    <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
            {items.length > 0 ? items.map((item) => (
                <span key={item} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">{item}</span>
            )) : <span className="text-sm text-gray-500">No items returned.</span>}
        </div>
    </div>
);
