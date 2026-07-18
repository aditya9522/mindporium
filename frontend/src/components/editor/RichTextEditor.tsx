import { useEffect, useRef } from 'react';

type QuillRange = {
    index: number;
    length: number;
};

type TextChangeHandler = () => void;

type QuillEditor = {
    root: HTMLElement;
    clipboard: {
        dangerouslyPasteHTML: (html: string) => void;
    };
    getSelection: (focus?: boolean) => QuillRange | null;
    insertEmbed: (index: number, type: string, value: string | ArrayBuffer | null) => void;
    setSelection: (index: number, length: number) => void;
    on: (eventName: 'text-change', handler: TextChangeHandler) => void;
    off: (eventName: 'text-change', handler: TextChangeHandler) => void;
    disable: () => void;
    enable: () => void;
};

type QuillConstructor = new (
    element: HTMLElement,
    options: {
        theme: string;
        placeholder: string;
        modules: Record<string, unknown>;
    },
) => QuillEditor;

declare global {
    interface Window {
        Quill?: QuillConstructor;
    }
}

const QUILL_CSS = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css';
const QUILL_JS = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    height?: number;
    disabled?: boolean;
}

const loadDep = (type: 'script' | 'link', src: string): Promise<void> =>
    new Promise((resolve, reject) => {
        const selector = type === 'script' ? `script[src="${src}"]` : `link[href="${src}"]`;
        if (document.querySelector(selector)) {
            resolve();
            return;
        }

        const element = document.createElement(type === 'script' ? 'script' : 'link');
        if (type === 'script') {
            const script = element as HTMLScriptElement;
            script.src = src;
            script.async = false;
        } else {
            const link = element as HTMLLinkElement;
            link.rel = 'stylesheet';
            link.href = src;
        }

        element.onload = () => resolve();
        element.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(element);
    });

export const RichTextEditor = ({
    value,
    onChange,
    placeholder = 'Start writing your note...',
    height = 380,
    disabled = false,
}: RichTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<QuillEditor | null>(null);
    const textChangeHandlerRef = useRef<TextChangeHandler | null>(null);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    const placeholderRef = useRef(placeholder);
    const disabledRef = useRef(disabled);
    const initialized = useRef(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        placeholderRef.current = placeholder;
    }, [placeholder]);

    useEffect(() => {
        disabledRef.current = disabled;
    }, [disabled]);

    useEffect(() => {
        const init = async () => {
            await loadDep('link', QUILL_CSS);
            await loadDep('script', QUILL_JS);

            const Quill = window.Quill;
            if (!Quill || !editorRef.current || initialized.current) return;

            initialized.current = true;

            const imageHandler = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.click();
                input.onchange = () => {
                    const file = input.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = () => {
                        const quill = quillRef.current;
                        if (!quill) return;

                        const range = quill.getSelection(true);
                        if (!range) return;

                        quill.insertEmbed(range.index, 'image', reader.result);
                        quill.setSelection(range.index + 1, 0);
                    };
                    reader.readAsDataURL(file);
                };
            };

            const quill = new Quill(editorRef.current, {
                theme: 'snow',
                placeholder: placeholderRef.current,
                modules: {
                    toolbar: {
                        container: [
                            [{ header: [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ color: [] }, { background: [] }],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            [{ indent: '-1' }, { indent: '+1' }],
                            ['blockquote', 'code-block'],
                            ['link', 'image'],
                            ['clean'],
                        ],
                        handlers: { image: imageHandler },
                    },
                    clipboard: { matchVisual: false },
                },
            });

            quillRef.current = quill;

            if (valueRef.current) {
                quill.clipboard.dangerouslyPasteHTML(valueRef.current);
            }
            if (disabledRef.current) quill.disable();

            const handleTextChange = () => {
                const html = quill.root.innerHTML;
                const empty = html === '<p><br></p>' || html === '';
                const next = empty ? '' : html;
                valueRef.current = next;
                onChangeRef.current(next);
            };

            textChangeHandlerRef.current = handleTextChange;
            quill.on('text-change', handleTextChange);
        };

        init().catch(console.error);

        return () => {
            if (quillRef.current && textChangeHandlerRef.current) {
                quillRef.current.off('text-change', textChangeHandlerRef.current);
            }
            quillRef.current = null;
            textChangeHandlerRef.current = null;
            initialized.current = false;
        };
    }, []);

    useEffect(() => {
        if (!quillRef.current || value === valueRef.current) return;
        valueRef.current = value;
        quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
    }, [value]);

    useEffect(() => {
        if (!quillRef.current) return;
        if (disabled) quillRef.current.disable();
        else quillRef.current.enable();
    }, [disabled]);

    return (
        <div className="quill-wrapper">
            <style>{`
                .quill-wrapper .ql-toolbar.ql-snow {
                    border: none !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    background: #f9fafb;
                    padding: 8px 12px !important;
                    font-family: 'Inter', sans-serif;
                    flex-wrap: wrap;
                }
                .quill-wrapper .ql-container.ql-snow {
                    border: none !important;
                    font-family: 'Inter', system-ui, sans-serif;
                    font-size: 14px;
                    height: ${height}px;
                    overflow-y: auto;
                }
                .quill-wrapper .ql-editor {
                    min-height: 100%;
                    line-height: 1.85;
                    color: #111827;
                    padding: 16px 20px;
                }
                .quill-wrapper .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #9ca3af;
                    left: 20px;
                }
                .quill-wrapper .ql-editor ul,
                .quill-wrapper .ql-editor ol { padding-left: 1.5em; }
                .quill-wrapper .ql-editor li { margin: 2px 0; }
                .quill-wrapper .ql-editor blockquote {
                    border-left: 4px solid #6366f1;
                    padding-left: 1em;
                    color: #4b5563;
                    margin: 8px 0;
                    font-style: normal;
                }
                .quill-wrapper .ql-editor pre.ql-syntax {
                    background: #f3f4f6;
                    border-radius: 6px;
                    color: #1f2937;
                    padding: 12px 16px;
                    font-size: 13px;
                }
                .quill-wrapper .ql-editor h1 { font-size: 1.6em; font-weight: 700; margin-bottom: 6px; }
                .quill-wrapper .ql-editor h2 { font-size: 1.3em; font-weight: 600; margin-bottom: 4px; }
                .quill-wrapper .ql-editor h3 { font-size: 1.1em; font-weight: 600; margin-bottom: 4px; }
                .quill-wrapper .ql-editor a { color: #4f46e5; }
                .quill-wrapper .ql-editor img { max-width: 100%; border-radius: 8px; margin: 6px 0; }
                .quill-wrapper .ql-snow .ql-tooltip {
                    z-index: 200;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0,0,0,.12);
                }
                .dark .quill-wrapper .ql-toolbar.ql-snow {
                    background: #1f2937;
                    border-bottom-color: #374151 !important;
                }
                .dark .quill-wrapper .ql-toolbar .ql-stroke { stroke: #9ca3af; }
                .dark .quill-wrapper .ql-toolbar .ql-fill { fill: #9ca3af; }
                .dark .quill-wrapper .ql-toolbar .ql-picker-label { color: #9ca3af; }
                .dark .quill-wrapper .ql-toolbar .ql-picker-options {
                    background: #1f2937;
                    border-color: #374151;
                    color: #e5e7eb;
                }
                .dark .quill-wrapper .ql-toolbar button:hover .ql-stroke,
                .dark .quill-wrapper .ql-toolbar button.ql-active .ql-stroke { stroke: #a5b4fc; }
                .dark .quill-wrapper .ql-toolbar button:hover .ql-fill,
                .dark .quill-wrapper .ql-toolbar button.ql-active .ql-fill { fill: #a5b4fc; }
                .dark .quill-wrapper .ql-editor {
                    color: #e5e7eb;
                    background: #0f172a;
                }
                .dark .quill-wrapper .ql-editor.ql-blank::before { color: #475569; }
                .dark .quill-wrapper .ql-editor blockquote {
                    border-left-color: #818cf8;
                    color: #94a3b8;
                }
                .dark .quill-wrapper .ql-editor pre.ql-syntax {
                    background: #1e293b;
                    color: #e2e8f0;
                }
                .dark .quill-wrapper .ql-snow .ql-tooltip {
                    background: #1e293b;
                    color: #e2e8f0;
                    border-color: #334155;
                }
                .dark .quill-wrapper .ql-snow .ql-tooltip input[type=text] {
                    background: #334155;
                    color: #e2e8f0;
                    border-color: #475569;
                }
            `}</style>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div ref={editorRef} />
            </div>
        </div>
    );
};
