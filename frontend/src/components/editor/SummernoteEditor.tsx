import { useEffect, useRef, useCallback } from 'react';


declare global {
    interface Window {
        $: any;
        jQuery: any;
    }
}

interface SummernoteEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    height?: number;
    disabled?: boolean;
}

export const SummernoteEditor = ({ value, onChange, placeholder = 'Write your note here…', height = 320, disabled = false }: SummernoteEditorProps) => {
    const editorId = useRef(`sn-${Math.random().toString(36).slice(2)}`);
    const initialized = useRef(false);
    const valueRef = useRef(value);

    const getEditor = useCallback(() => {
        const $ = window.$;
        if (!$) return null;
        return $(`#${editorId.current}`);
    }, []);

    // Dynamically load jQuery → Summernote in order
    useEffect(() => {
        const loadScript = (src: string): Promise<void> =>
            new Promise((res, rej) => {
                if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
                const s = document.createElement('script');
                s.src = src;
                s.async = false;
                s.onload = () => res();
                s.onerror = () => rej(new Error(`Failed to load ${src}`));
                document.head.appendChild(s);
            });

        const loadLink = (href: string) => {
            if (document.querySelector(`link[href="${href}"]`)) return;
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = href;
            document.head.appendChild(l);
        };

        const init = async () => {
            loadLink('https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.18/summernote-lite.min.css');

            if (!window.jQuery) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js');
                window.$ = window.jQuery;
            }

            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.18/summernote-lite.min.js');

            const $ = window.$;
            if (!$ || !$.fn.summernote) return;
            if (initialized.current) return;
            initialized.current = true;

            $(`#${editorId.current}`).summernote({
                placeholder,
                height,
                tabsize: 2,
                focus: false,
                disableDragAndDrop: false,
                toolbar: [
                    ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
                    ['font', ['fontsize', 'color', 'highlight']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['insert', ['link', 'picture', 'hr', 'table']],
                    ['view', ['fullscreen', 'codeview']],
                ],
                styleTags: ['p', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'pre'],
                callbacks: {
                    onChange: (htmlContent: string) => {
                        valueRef.current = htmlContent;
                        onChange(htmlContent);
                    },
                },
            });

            if (disabled) {
                $(`#${editorId.current}`).summernote('disable');
            }

            // Set initial value
            if (valueRef.current) {
                $(`#${editorId.current}`).summernote('code', valueRef.current);
            }
        };

        init().catch(console.error);

        return () => {
            if (initialized.current) {
                const editor = getEditor();
                if (editor && window.$ && window.$.fn.summernote) {
                    try { editor.summernote('destroy'); } catch (_) { /* ignore */ }
                }
                initialized.current = false;
            }
        };
    }, []);  // only once on mount

    // Sync value from parent only if it actually changed externally (e.g. switching notes)
    useEffect(() => {
        if (!initialized.current) return;
        const editor = getEditor();
        if (!editor) return;
        const current = editor.summernote('code') as string;
        // Only update if parent sent a genuinely different value (avoids cursor jump)
        if (value !== current && value !== valueRef.current) {
            valueRef.current = value;
            editor.summernote('code', value || '');
        }
    }, [value, getEditor]);

    // Disabled state sync
    useEffect(() => {
        if (!initialized.current) return;
        const editor = getEditor();
        if (!editor) return;
        editor.summernote(disabled ? 'disable' : 'enable');
    }, [disabled, getEditor]);

    return (
        <div className="summernote-wrapper rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <style>{`
                .note-editor.note-airframe,
                .note-editor.note-frame {
                    border: none !important;
                    border-radius: 0 !important;
                }
                .note-toolbar {
                    background: #f9fafb !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    padding: 6px 10px !important;
                }
                .dark .note-toolbar {
                    background: #1f2937 !important;
                    border-bottom-color: #374151 !important;
                }
                .note-editable {
                    background: #fff !important;
                    color: #111827 !important;
                    font-family: 'Inter', system-ui, sans-serif !important;
                    font-size: 14px !important;
                    line-height: 1.8 !important;
                    padding: 16px 20px !important;
                    min-height: ${height}px;
                }
                .dark .note-editable {
                    background: #111827 !important;
                    color: #e5e7eb !important;
                }
                .note-statusbar {
                    display: none !important;
                }
                .note-btn {
                    border-radius: 6px !important;
                    border: none !important;
                    background: transparent !important;
                    color: #6b7280 !important;
                    font-size: 12px !important;
                }
                .note-btn:hover {
                    background: #f3f4f6 !important;
                    color: #111827 !important;
                }
                .note-icon-caret { display: none !important; }
                .note-dropdown-menu {
                    border-radius: 10px !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                    border: 1px solid #e5e7eb !important;
                    padding: 6px !important;
                }
            `}</style>
            <div id={editorId.current} />
        </div>
    );
};
