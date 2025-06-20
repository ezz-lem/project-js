class NotesApp {
    constructor() {
        // ... existing constructor code ...
    }
    
    init() {
        this.loadNotes();
        this.bindEvents();
        this.updateCharCount();
        this.renderNotes();
    }
    
    // ... other existing methods ...
    
    deleteNote() {
        if (!this.currentDeleteId) return;
        
        const noteIndex = this.notes.findIndex(n => n.id === this.currentDeleteId);
        if (noteIndex === -1) return;
        
        this.notes.splice(noteIndex, 1);
        this.saveNotes();
        this.showNotification('Note supprimée avec succès', 'success');
        this.closeDeleteModal();
        this.reloadApp();
    }
    
    closeDeleteModal() {
        this.deleteModal.classList.remove('show');
        this.currentDeleteId = null;
    }
    
    reloadApp() {
        // Small delay to allow notification to show
        setTimeout(() => {
            location.reload();
        }, 500);
    }
    
    bindEvents() {
        // ... other event listeners ...
        
        this.closeDeleteModal.addEventListener('click', () => {
            this.closeDeleteModal();
            this.reloadApp();
        });
        
        this.cancelDelete.addEventListener('click', () => {
            this.closeDeleteModal();
            this.reloadApp();
        });
        
        this.confirmDelete.addEventListener('click', (e) => {
            e.preventDefault();
            this.deleteNote();
        });
        
        // ... rest of existing event bindings ...
    }
    
    // ... rest of existing methods ...
}

document.addEventListener('DOMContentLoaded', () => {
    window.notesApp = new NotesApp();
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            document.getElementById('noteInput').focus();
        }
        
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            alert('Fonctionnalité d\'export serait ici');
        }
    });
});
