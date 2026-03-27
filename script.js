document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const openBtn = document.getElementById('open-btn');
    const saveBtn = document.getElementById('save-btn');
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

    // Save file button click
    saveBtn.addEventListener('click', function() {
        const content = editor.value;
        
        // DEBUG: Show current state
        console.log('Current filename before save:', currentFilename);
        console.log('Content preview:', content.substring(0, 50));
        
        // If new file (not loaded), use first # Title as filename
        if (currentFilename === 'document.md' && content.trim()) {
            console.log('Condition met - extracting title...');
            const titleMatch = content.match(/^# +(.+)$/m);
            if (titleMatch) {
                let title = titleMatch[1].trim();
                let sanitized = title.replace(/[<>:"/\\\\|?*]/g, '-');
                sanitized = sanitized.replace(/\\s+/g, ' ').trim().substring(0, 100);
                console.log('Title match:', title, 'Sanitized:', sanitized);
                if (sanitized.length > 0) {
                    currentFilename = sanitized + '.md';
                    console.log('New filename:', currentFilename);
                } else {
                    currentFilename = 'untitled.md';
                    console.log('Sanitized empty, using untitled.md');
                }
            } else {
                console.log('No title match');
                currentFilename = 'untitled.md';
            }
        } else {
            console.log('Condition NOT met (already named or no content)');
        }
        
        document.title = currentFilename + ' - MD Editor';
        
        const blob = new Blob([content], { type: 'text/markdown' });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = currentFilename;
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
        
        // DEBUG: Final filename
        console.log('Final download filename:', currentFilename);
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
        
        if (e.ctrlKey && e.key === 'o') {
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
