document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const openBtn = document.getElementById('open-btn');
    const saveBtn = document.getElementById('save-btn');
    const savePdfBtn = document.getElementById('save-pdf-btn');
    const fileInput = document.getElementById('file-input');
    const downloadLink = document.getElementById('download-link');

    // Help Modal Elements
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeHelpBtn = helpModal ? helpModal.querySelector('.close') : null;

    // State
    let currentFilename = 'document.md';
    let debounceTimer;

    // Configure marked.js
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
    });

    // Debounced preview update
    function updatePreview() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const markdown = editor.value;
            if (markdown.trim()) {
                preview.innerHTML = marked.parse(markdown);
            } else {
                preview.innerHTML = '';
            }
        }, 150);
    }

    // Initial preview update
    updatePreview();

    // Editor input event
    editor.addEventListener('input', updatePreview);

    // Open file button click
    openBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // File input change event
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['.md', '.txt', 'text/markdown', 'text/plain'];
            const fileName = file.name.toLowerCase();
            const isValid = validTypes.some(type => 
                fileName.endsWith(type) || file.type === type
            );

            if (!isValid && file.type && !file.type.includes('markdown') && !file.type.includes('text')) {
                alert('Please select a Markdown (.md) or text (.txt) file.');
                return;
            }

            currentFilename = file.name;

            const reader = new FileReader();
            reader.onload = function(e) {
                editor.value = e.target.result;
                updatePreview();
            };
            reader.onerror = function() {
                alert('Error reading file. Please try again.');
            };
            reader.readAsText(file);
        }

        fileInput.value = '';
    });

    function resolveFilenameFromContent(content) {
        // If new file (not loaded), use first # Title as filename
        if (currentFilename === 'document.md' && content.trim()) {
            const titleMatch = content.match(/^# +(.+)$/m);
            if (titleMatch) {
                let title = titleMatch[1].trim();
                let sanitized = title.replace(/[<>:"/\\\\|?*]/g, '-');
                sanitized = sanitized.replace(/\\s+/g, ' ').trim().substring(0, 100);
                if (sanitized.length > 0) {
                    currentFilename = sanitized + '.md';
                } else {
                    currentFilename = 'untitled.md';
                }
            } else {
                currentFilename = 'untitled.md';
            }
        }

        return currentFilename;
    }

    function getResolvedFilename(content) {
        if (currentFilename === 'document.md' && content.trim()) {
            const titleMatch = content.match(/^# +(.+)$/m);
            if (titleMatch) {
                let title = titleMatch[1].trim();
                let sanitized = title.replace(/[<>:"/\\\\|?*]/g, '-');
                sanitized = sanitized.replace(/\\s+/g, ' ').trim().substring(0, 100);
                if (sanitized.length > 0) {
                    currentFilename = sanitized + '.md';
                } else {
                    currentFilename = 'untitled.md';
                }
            } else {
                currentFilename = 'untitled.md';
            }
        }
        return currentFilename;
    }

    function openLightPrintPdfFromMarkdown(markdown, filename) {
        const htmlContent = marked.parse(markdown || '');
        const safeTitle = (filename || 'document').replace(/\.md$/i, '').replace(/[<>]/g, '');

        const lightCss = `
/* =========================
   GLOBAL
========================= */

body{
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    background:#fff;
    color:#111;
    line-height:1.65;
    font-size:14px;
    margin:40px;
}

*{
    box-sizing:border-box;
}

#content{
    max-width:900px;
    margin:0 auto;
}

/* =========================
   TYPOGRAPHY
========================= */

h1,h2,h3,h4,h5,h6{
    line-height:1.25;
    margin-top:32px;
    margin-bottom:14px;
    page-break-after:avoid;
}

#content h1{
    font-size:32px;
    font-weight:700;
    padding-bottom:10px;
    border-bottom:2px solid #e5e7eb;
}

#content h2{
    font-size:26px;
    border-bottom:1px solid #ececec;
    padding-bottom:6px;
}

#content h3{
    font-size:22px;
}

#content h4{
    font-size:18px;
}

p{
    margin:0 0 18px;
}

ul,ol{
    margin:14px 0 18px;
    padding-left:28px;
}

li{
    margin-bottom:8px;
}

/* =========================
   LINKS
========================= */

a{
    color:#6a0dad;
    text-decoration:none;
    border-bottom:1px solid rgba(106,13,173,.25);
}

/* =========================
   CODE
========================= */

pre{
    background:#f6f8fa;
    border:1px solid #e1e4e8;
    border-radius:10px;
    padding:16px;
    overflow:auto;
    margin:24px 0;
    page-break-inside:avoid;
}

code{
    font-family:JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size:13px;
}

/* =========================
   BLOCKQUOTE
========================= */

blockquote{
    border-left:4px solid #9b59b6;
    padding:12px 18px;
    margin:24px 0;
    color:#444;
    font-style:italic;
    background:#faf7ff;
    border-radius:6px;
}

/* =========================
   IMAGES
========================= */

img{
    display:block;
    max-width:100%;
    max-height:500px;
    width:auto;
    height:auto;

    margin:24px auto;
    border-radius:10px;

    object-fit:contain;

    page-break-inside:avoid;
    break-inside:avoid;
}

/* =========================
   TABLES
========================= */

table{
    width:100%;
    border-collapse:collapse;
    margin:28px 0;

    font-size:13px;

    overflow:hidden;

    page-break-inside:auto;
}

thead{
    display:table-header-group;
}

tr{
    page-break-inside:avoid;
    page-break-after:auto;
}

th, td{
    border:1px solid #dfe2e5;

    padding:12px 16px;

    text-align:left;
    vertical-align:top;

    line-height:1.5;
}

th{
    background:#f6f8fa;
    font-weight:600;
}

tbody tr:nth-child(even){
    background:#fafafa;
}

/* =========================
   HR
========================= */

hr{
    border:none;
    border-top:2px solid #e5e7eb;
    margin:36px 0;
}

/* =========================
   PRINT OPTIMIZATION
========================= */

@page{
    margin:22mm 18mm;
}

@media print{

    body{
        -webkit-print-color-adjust:exact;
        print-color-adjust:exact;
    }

    img,
    table,
    pre,
    blockquote{
        page-break-inside:avoid;
        break-inside:avoid;
    }

    h1,h2,h3,h4{
        page-break-after:avoid;
    }

    p, li{
        orphans:3;
        widows:3;
    }
}
`;

        const printDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${safeTitle}</title>
<style>
${lightCss}
/* Basic markdown element sizing */
#content h1{font-size:28px;font-weight:700;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;}
#content h2{font-size:24px;font-weight:700;margin:28px 0 12px;}
#content h3{font-size:20px;font-weight:600;margin:24px 0 10px;}
#content h4{font-size:18px;font-weight:600;margin:20px 0 8px;}
#content h5,#content h6{font-size:16px;font-weight:600;margin:16px 0 8px;color:#555;}
#content p{margin:0 0 16px;}
#content ul,#content ol{margin:16px 0;padding-left:24px;}
#content li{margin-bottom:8px;}
#content hr{border:none}
</style>
</head>
<body>
<div id="content">${htmlContent}</div>
<script>
// Ensure layout is ready before print
setTimeout(()=>{ try{ window.focus(); window.print(); }catch(e){} }, 50);
</script>
</body>
</html>`;

        const win = window.open('', '_blank');
        if (!win) {
            alert('Popup blocked. Please allow popups to save PDF.');
            return;
        }
        win.document.open();
        win.document.write(printDoc);
        win.document.close();
    }

    if (savePdfBtn) {
        savePdfBtn.addEventListener('click', function() {
            const content = editor.value;
            const filename = getResolvedFilename(content);
            document.title = filename.replace(/\.md$/i, '') + ' - MD Editor';
            openLightPrintPdfFromMarkdown(content, filename);
        });
    }

    // Save file button click
    saveBtn.addEventListener('click', function() {
        const content = editor.value;
        const filename = getResolvedFilename(content);

        document.title = filename + ' - MD Editor';

        const blob = new Blob([content], { type: 'text/markdown' });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
    });

    // Keyboard shortcuts
    editor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            
            editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
            
            updatePreview();
        }
        
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveBtn.click();
        }
        
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            openBtn.click();
        }
    });

    /* =========================
       HELP MODAL FUNCTIONALITY
       ========================= */

    if (helpBtn && helpModal && closeHelpBtn) {
        // Open modal
        helpBtn.addEventListener('click', function() {
            helpModal.style.display = 'block';
        });

        // Close via X
        closeHelpBtn.addEventListener('click', function() {
            helpModal.style.display = 'none';
        });

        // Close when clicking outside modal
        window.addEventListener('click', function(event) {
            if (event.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });

        // Close with ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                helpModal.style.display = 'none';
            }
        });
    }
});
