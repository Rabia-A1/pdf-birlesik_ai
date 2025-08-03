class PDFMerger {
    constructor() {
        this.files = [];
        this.mergedPDF = null;
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.filesSection = document.getElementById('filesSection');
        this.filesList = document.getElementById('filesList');
        this.mergeBtn = document.getElementById('mergeBtn');
        this.resultSection = document.getElementById('resultSection');
        this.downloadBtn = document.getElementById('downloadBtn');
    }

    setupEventListeners() {
        // Dosya yükleme alanı tıklama
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Dosya seçimi
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Sürükle-bırak
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFileSelection(e.dataTransfer.files);
        });

        // Birleştir butonu
        this.mergeBtn.addEventListener('click', () => {
            this.mergePDFs();
        });

        // İndir butonu
        this.downloadBtn.addEventListener('click', () => {
            this.downloadMergedPDF();
        });
    }

    handleFileSelection(files) {
        const pdfFiles = Array.from(files).filter(file => 
            file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        );

        if (pdfFiles.length === 0) {
            alert('Lütfen sadece PDF dosyaları seçin!');
            return;
        }

        // Yeni dosyaları ekle
        pdfFiles.forEach(file => {
            if (!this.files.some(existingFile => existingFile.name === file.name)) {
                this.files.push(file);
            }
        });

        this.updateFilesDisplay();
        this.showFilesSection();
    }

    updateFilesDisplay() {
        this.filesList.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const fileItem = this.createFileItem(file, index);
            this.filesList.appendChild(fileItem);
        });
    }

    createFileItem(file, index) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileSize = this.formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <p>${fileSize}</p>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-danger" onclick="pdfMerger.removeFile(${index})">Kaldır</button>
            </div>
        `;
        
        return fileItem;
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFilesDisplay();
        
        if (this.files.length === 0) {
            this.hideFilesSection();
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showFilesSection() {
        this.filesSection.style.display = 'block';
        this.resultSection.style.display = 'none';
    }

    hideFilesSection() {
        this.filesSection.style.display = 'none';
    }

    async mergePDFs() {
        if (this.files.length < 2) {
            alert('En az 2 PDF dosyası seçmelisiniz!');
            return;
        }

        try {
            this.mergeBtn.disabled = true;
            this.mergeBtn.textContent = 'Birleştiriliyor...';

            const mergedPdf = await PDFLib.PDFDocument.create();
            
            for (const file of this.files) {
                const fileArrayBuffer = await file.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(fileArrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            this.mergedPDF = await mergedPdf.save();
            this.showResultSection();
            
        } catch (error) {
            console.error('PDF birleştirme hatası:', error);
            alert('PDF dosyaları birleştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            this.mergeBtn.disabled = false;
            this.mergeBtn.textContent = 'PDF\'leri Birleştir';
        }
    }

    showResultSection() {
        this.resultSection.style.display = 'block';
        this.filesSection.style.display = 'none';
        
        // Sayfayı sonuca kaydır
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    downloadMergedPDF() {
        if (!this.mergedPDF) {
            alert('Birleştirilmiş PDF bulunamadı!');
            return;
        }

        const blob = new Blob([this.mergedPDF], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'birlesik_dosyalar.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Uygulamayı başlat
const pdfMerger = new PDFMerger(); 