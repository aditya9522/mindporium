import React from 'react';
import { FilePlus2, FileText, UploadCloud } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

interface Props {
    hasSavedDraft: boolean;
    isImporting: boolean;
    selectedFileName: string | null;
    onStartNew: () => void;
    onContinueDraft: () => void;
    onUploadResume: (file: File) => void;
}

const ACCEPTED_RESUME_TYPES = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const ResumeEntryPanel: React.FC<Props> = ({
    hasSavedDraft,
    isImporting,
    selectedFileName,
    onStartNew,
    onContinueDraft,
    onUploadResume,
}) => {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUploadResume(file);
        }
        event.target.value = '';
    };

    return (
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 px-4 py-8 md:py-12">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">Resume Builder</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">How would you like to begin?</h2>
                    <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                        Create a clean ATS resume from a guided form, or import your current resume and refine it in the editor.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <button
                        type="button"
                        onClick={onStartNew}
                        className="group rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300">
                            <FilePlus2 className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">Start From Scratch</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                            Use the existing guided form and live preview to build a fresh resume section by section.
                        </p>
                        <div className="mt-6">
                            <Button type="button" className="gap-2">
                                <FilePlus2 className="h-4 w-4" /> Build New Resume
                            </Button>
                        </div>
                    </button>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">Upload Existing Resume</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                            Import a PDF or DOCX resume, extract the content with AI, then edit the structured result before downloading.
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_RESUME_TYPES}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button
                                type="button"
                                variant="outline"
                                className="gap-2"
                                isLoading={isImporting}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="h-4 w-4" /> Choose Resume
                            </Button>
                            {selectedFileName && (
                                <span className="min-w-0 truncate text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {selectedFileName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {hasSavedDraft && (
                    <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                        <div className="flex min-w-0 items-center gap-3">
                            <FileText className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                You have a saved draft on this device.
                            </p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={onContinueDraft}>
                            Continue Draft
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
};
