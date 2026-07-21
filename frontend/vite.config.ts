import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          const moduleId = id.replace(/\\/g, '/');

          if (moduleId.includes('@react-pdf') || moduleId.includes('pdfjs-dist') || moduleId.includes('jspdf') || moduleId.includes('html2canvas')) return 'pdf-vendor';
          if (moduleId.includes('react-player') || moduleId.includes('@mux') || moduleId.includes('hls.js')) return 'media-vendor';
          if (moduleId.includes('mammoth') || moduleId.includes('diff') || moduleId.includes('react-markdown')) return 'document-vendor';
          if (moduleId.includes('recharts') || moduleId.includes('d3-')) return 'charts-vendor';
          if (moduleId.includes('lucide-react') || moduleId.includes('@radix-ui') || moduleId.includes('react-hot-toast')) return 'ui-vendor';
          if (moduleId.includes('react-hook-form') || moduleId.includes('@hookform') || moduleId.includes('zod')) return 'form-vendor';
          if (
            moduleId.includes('/node_modules/react/') ||
            moduleId.includes('/node_modules/react-dom/') ||
            moduleId.includes('/node_modules/react-router-dom/')
          ) return 'react-vendor';
        },
      },
    },
  },
})
