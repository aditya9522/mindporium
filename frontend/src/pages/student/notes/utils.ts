export const stripHtml = (html: string): string => {
    if (!html) return '';

    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
};

export const wordCount = (html: string) => {
    const text = stripHtml(html);
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
};

export const readTime = (html: string) => {
    const minutes = Math.ceil(wordCount(html) / 200);
    return minutes < 1 ? '< 1 min' : `${minutes} min`;
};

export const relativeTime = (dateStr: string): string => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const isImage = (type: string) => type?.startsWith('image/');
export const isPDF = (type: string) => type === 'application/pdf';
export const isVideo = (type: string) => type?.startsWith('video/');
export const isAudio = (type: string) => type?.startsWith('audio/');
