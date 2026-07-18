import { useMemo, useRef, useState } from 'react';
import { diffLines, diffWordsWithSpace, type Change } from 'diff';
import {
    ArrowLeftRight,
    CheckCircle2,
    Copy,
    Download,
    Eraser,
    FileDiff,
    FileText,
    Highlighter,
    Loader2,
    Minus,
    Plus,
    RotateCcw,
    UploadCloud,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';

type CompareMode = 'word' | 'line';

const sampleLeft = `Mindporium helps students organize learning notes, course resources, and career preparation in one workspace.

The old comparison view counted changed words, but it was hard to see exactly where edits happened.`;

const sampleRight = `Mindporium helps learners organize notes, uploaded resources, and career preparation inside one focused workspace.

The improved comparison view highlights inserted text in green and marks removed text in red directly where the edits happened.`;

const statCardClass = 'rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4';

const normalizeForCompare = (value: string, ignoreWhitespace: boolean) => (
    ignoreWhitespace ? value.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') : value
);

const countWords = (value: string) => value.trim().match(/\S+/g)?.length ?? 0;

const downloadText = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

const extractPdfText = async (file: File) => {
    const [pdfjsLib, workerModule] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.mjs?url'),
    ]);
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const text = textContent.items
            .map(item => 'str' in item ? item.str : '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        pages.push(text);
    }

    return pages.join('\n\n');
};

const extractDocxText = async (file: File) => {
    const mammoth = await import('mammoth');
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
};

const extractTextFromFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();

    if (
        file.type.startsWith('text/') ||
        lowerName.endsWith('.txt') ||
        lowerName.endsWith('.md') ||
        lowerName.endsWith('.csv')
    ) {
        return file.text();
    }

    if (file.type === 'application/pdf' || lowerName.endsWith('.pdf')) {
        return extractPdfText(file);
    }

    if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        lowerName.endsWith('.docx')
    ) {
        return extractDocxText(file);
    }

    throw new Error('Unsupported file type');
};

const buildPatchText = (changes: Change[]) => changes.map(change => {
    if (change.added) return `+ ${change.value}`;
    if (change.removed) return `- ${change.value}`;
    return `  ${change.value}`;
}).join('');

export const TextComparePage = () => {
    const leftFileRef = useRef<HTMLInputElement>(null);
    const rightFileRef = useRef<HTMLInputElement>(null);
    const [left, setLeft] = useState('');
    const [right, setRight] = useState('');
    const [ignoreCase, setIgnoreCase] = useState(true);
    const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
    const [compareMode, setCompareMode] = useState<CompareMode>('word');
    const [loadingSide, setLoadingSide] = useState<'left' | 'right' | null>(null);

    const comparison = useMemo(() => {
        const leftComparable = normalizeForCompare(left, ignoreWhitespace);
        const rightComparable = normalizeForCompare(right, ignoreWhitespace);
        const lineLeft = ignoreCase ? leftComparable.toLowerCase() : leftComparable;
        const lineRight = ignoreCase ? rightComparable.toLowerCase() : rightComparable;
        const changes = compareMode === 'line'
            ? diffLines(lineLeft, lineRight)
            : diffWordsWithSpace(leftComparable, rightComparable, { ignoreCase });

        const addedText = changes.filter(change => change.added).map(change => change.value).join(' ');
        const removedText = changes.filter(change => change.removed).map(change => change.value).join(' ');
        const sameText = changes.filter(change => !change.added && !change.removed).map(change => change.value).join(' ');
        const added = countWords(addedText);
        const removed = countWords(removedText);
        const same = countWords(sameText);
        const leftWords = countWords(left);
        const rightWords = countWords(right);
        const changed = changes.some(change => change.added || change.removed);

        return {
            changes,
            leftWords,
            rightWords,
            same,
            added,
            removed,
            changed,
            patchText: buildPatchText(changes),
            similarity: leftWords || rightWords
                ? Math.round((same / Math.max(leftWords, rightWords)) * 100)
                : 100,
        };
    }, [left, right, ignoreCase, ignoreWhitespace, compareMode]);

    const handleFile = async (side: 'left' | 'right', file?: File) => {
        if (!file) return;

        setLoadingSide(side);
        try {
            const text = await extractTextFromFile(file);
            if (side === 'left') setLeft(text);
            if (side === 'right') setRight(text);
            toast.success(`Imported ${file.name}`);
        } catch {
            toast.error('Could not extract text. Try TXT, MD, CSV, PDF, or DOCX.');
        } finally {
            setLoadingSide(null);
        }
    };

    const copySummary = async () => {
        const summary = [
            `Similarity: ${comparison.similarity}%`,
            `Matching words: ${comparison.same}`,
            `Added words: ${comparison.added}`,
            `Removed words: ${comparison.removed}`,
        ].join('\n');
        await navigator.clipboard.writeText(summary);
        toast.success('Comparison summary copied');
    };

    const copyPatch = async () => {
        await navigator.clipboard.writeText(comparison.patchText);
        toast.success('Review diff copied');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                            <FileDiff className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Text Comparison</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review edits inline, import documents, and copy a clean change summary.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => {
                            setLeft(sampleLeft);
                            setRight(sampleRight);
                        }}>
                            Load sample
                        </Button>
                        <Button variant="outline" onClick={() => {
                            setLeft(right);
                            setRight(left);
                        }}>
                            <ArrowLeftRight className="w-4 h-4 mr-2" /> Swap
                        </Button>
                        <Button variant="outline" onClick={() => {
                            setLeft('');
                            setRight('');
                        }}>
                            <Eraser className="w-4 h-4 mr-2" /> Clear
                        </Button>
                    </div>
                </div>

                <section className="rounded-2xl border border-primary-100/70 dark:border-primary-900/30 bg-primary-50/40 dark:bg-primary-950/10 p-4 sm:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className={statCardClass}>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Result</p>
                            <p className={`text-2xl font-bold mt-2 ${comparison.changed ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {comparison.changed ? 'Edited' : 'Match'}
                            </p>
                        </div>
                        <div className={statCardClass}>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Similarity</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{comparison.similarity}%</p>
                        </div>
                        <div className={statCardClass}>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Added</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{comparison.added}</p>
                        </div>
                        <div className={statCardClass}>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Removed</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{comparison.removed}</p>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row gap-3 justify-between xl:items-center">
                        <div className="flex flex-wrap gap-4">
                            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={ignoreCase} onChange={event => setIgnoreCase(event.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                Ignore case
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <input type="checkbox" checked={ignoreWhitespace} onChange={event => setIgnoreWhitespace(event.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                Normalize spacing
                            </label>
                            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-1">
                                {(['word', 'line'] as const).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setCompareMode(mode)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize ${compareMode === mode ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={copySummary}>
                                <Copy className="w-4 h-4 mr-2" /> Copy summary
                            </Button>
                            <Button variant="outline" onClick={copyPatch}>
                                <Copy className="w-4 h-4 mr-2" /> Copy diff
                            </Button>
                            <Button variant="outline" onClick={() => downloadText('comparison-diff.txt', comparison.patchText)}>
                                <Download className="w-4 h-4 mr-2" /> Export
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-800">
                        <TextPanel
                            title="Original text"
                            value={left}
                            onChange={setLeft}
                            words={comparison.leftWords}
                            onUpload={() => leftFileRef.current?.click()}
                            isLoading={loadingSide === 'left'}
                            inputRef={leftFileRef}
                            onFile={file => handleFile('left', file)}
                        />
                        <TextPanel
                            title="Changed text"
                            value={right}
                            onChange={setRight}
                            words={comparison.rightWords}
                            onUpload={() => rightFileRef.current?.click()}
                            isLoading={loadingSide === 'right'}
                            inputRef={rightFileRef}
                            onFile={file => handleFile('right', file)}
                        />
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Highlighter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                Inline Review
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Removed text is struck through in red. Added text appears green exactly where it was inserted.</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-gray-400" /> Same</span>
                            <span className="inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5 text-emerald-500" /> Added</span>
                            <span className="inline-flex items-center gap-1"><Minus className="w-3.5 h-3.5 text-red-500" /> Removed</span>
                        </div>
                    </div>
                    <div className="p-5 min-h-60 max-h-[620px] overflow-y-auto">
                        {comparison.changes.length && (left || right) ? (
                            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-5 text-[15px] leading-8 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {comparison.changes.map((change, index) => (
                                    <DiffChunk key={`${change.value}-${index}`} change={change} />
                                ))}
                            </div>
                        ) : (
                            <div className="h-44 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-center">
                                <RotateCcw className="w-8 h-8 mb-3 text-gray-300 dark:text-gray-700" />
                                <p className="font-semibold">Paste text or import documents to compare versions.</p>
                                <p className="text-sm mt-1">Supported imports: TXT, MD, CSV, PDF, and DOCX.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

const DiffChunk = ({ change }: { change: Change }) => {
    if (change.added) {
        return (
            <mark className="rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 px-1 py-0.5 font-semibold decoration-emerald-600 underline decoration-1 underline-offset-4">
                {change.value}
            </mark>
        );
    }

    if (change.removed) {
        return (
            <del className="rounded-md bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-1 py-0.5 font-semibold decoration-red-700 dark:decoration-red-300 decoration-1">
                {change.value}
            </del>
        );
    }

    return <span>{change.value}</span>;
};

const TextPanel = ({
    title,
    value,
    words,
    onChange,
    onUpload,
    isLoading,
    inputRef,
    onFile,
}: {
    title: string;
    value: string;
    words: number;
    onChange: (value: string) => void;
    onUpload: () => void;
    isLoading: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onFile: (file?: File) => void;
}) => (
    <div className="p-4">
        <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".txt,.md,.csv,.pdf,.docx,text/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={event => onFile(event.target.files?.[0])}
        />
        <div className="flex items-center justify-between gap-3 mb-3">
            <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{words} words</span>
            </div>
            <Button variant="outline" size="sm" onClick={onUpload} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                Import
            </Button>
        </div>
        <textarea
            value={value}
            onChange={event => onChange(event.target.value)}
            placeholder="Paste text here or import TXT, PDF, or DOCX..."
            className="w-full h-80 resize-none rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-sm leading-6 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <FileText className="w-3.5 h-3.5" />
            TXT, MD, CSV, PDF, and DOCX imports extract text locally in your browser.
        </div>
    </div>
);
