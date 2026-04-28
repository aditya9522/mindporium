import type { ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { BlobProvider } from '@react-pdf/renderer';

interface Props {
    document: ReactElement<DocumentProps>;
}

const previewUrlSuffix = '#toolbar=0&navpanes=0&scrollbar=0&page=1&view=Fit';

export const ResumePreview = ({ document }: Props) => {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-white shadow-xl">
            <BlobProvider document={document}>
                {({ url, loading, error }) => {
                    if (loading) {
                        return (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                Loading preview...
                            </div>
                        );
                    }

                    if (error || !url) {
                        return (
                            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-500">
                                Unable to load resume preview.
                            </div>
                        );
                    }

                    return (
                        <iframe
                            title="Resume PDF preview"
                            src={`${url}${previewUrlSuffix}`}
                            className="absolute inset-0 h-full w-full border-0"
                            scrolling="no"
                        />
                    );
                }}
            </BlobProvider>
        </div>
    );
};
