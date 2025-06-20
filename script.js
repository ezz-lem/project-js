class NotesApp {
    constructor() {
        this.notes = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        
        this.noteInput = document.getElementById('noteInput');
        this.addNoteBtn = document.getElementById('addNoteBtn');
        this.notesList = document.getElementById('notesList');
        this.emptyState = document.getElementById('emptyState');
        this.notesCount = document.getElementById('notesCount');
        this.charCount = document.getElementById('charCount');
        
        this.editModal = document.getElementById('editModal');
        this.editNoteInput = document.getElementById('editNoteInput');
        this.editCharCount = document.getElementById('editCharCount');
        this.closeModal = document.getElementById('closeModal');
        this.cancelEdit = document.getElementById('cancelEdit');
        this.saveEdit = document.getElementById('saveEdit');
        
        this.deleteModal = document.getElementById('deleteModal');
        this.closeDeleteModal = document.getElementById('closeDeleteModal');
        this.cancelDelete = document.getElementById('cancelDelete');
        this.confirmDelete = document.getElementById('confirmDelete');
        
        this.init();
    }
    
    init() {
        this.loadNotes();
        this.bindEvents();
        this.updateCharCount();
        this.renderNotes();
    }
    
    loadNotes() {
        try {
            const savedNotes = localStorage.getItem('notesApp_notes');
            this.notes = savedNotes ? JSON.parse(savedNotes) : [];
        } catch (error) {
            console.error('Erreur lors du chargement des notes:', error);
            this.notes = [];
        }
    }
    
    saveNotes() {
        try {
            localStorage.setItem('notesApp_notes', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des notes:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    bindEvents() {
        this.addNoteBtn.addEventListener('click', () => this.addNote());
        this.noteInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.addNote();
            }
        });
        
        this.noteInput.addEventListener('input', () => this.updateCharCount());
        this.editNoteInput.addEventListener('input', () => this.updateEditCharCount());
        
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEdit.addEventListener('click', () => this.closeEditModal());
        this.saveEdit.addEventListener('click', () => this.saveEditedNote());
        
        this.closeDeleteModal.addEventListener('click', () => this.closeDeleteModal());
        this.cancelDelete.addEventListener('click', () => this.closeDeleteModal());
        this.confirmDelete.addEventListener('click', (e) => {
            e.preventDefault();
            this.deleteNote();
        });
        
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.closeEditModal();
            }
        });
        
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) {
                this.closeDeleteModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditModal();
                this.closeDeleteModal();
            }
        });
    }
    
    addNote() {
        const content = this.noteInput.value.trim();
        
        if (!content) {
            this.showNotification('Veuillez saisir du contenu pour la note', 'warning');
            this.noteInput.focus();
            return;
        }
        
        if (content.length > 500) {
            this.showNotification('La note ne peut pas dépasser 500 caractères', 'error');
            return;
        }
        
        const note = {
            id: this.generateId(),
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.unshift(note); 
        this.saveNotes();
        this.renderNotes();
        this.noteInput.value = '';
        this.updateCharCount();
        this.showNotification('Note ajoutée avec succès', 'success');
        
        setTimeout(() => {
            const firstNote = this.notesList.querySelector('.note-item');
            if (firstNote) {
                firstNote.style.animation = 'none';
                firstNote.offsetHeight; 
                firstNote.style.animation = 'slideInRight 0.3s ease';
            }
        }, 10);
    }
    
    renderNotes() {
        this.updateNotesCount();
        
        if (this.notes.length === 0) {
            this.notesList.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }
        
        this.notesList.style.display = 'block';
        this.emptyState.style.display = 'none';
        
        this.notesList.innerHTML = this.notes.map(note => this.createNoteHTML(note)).join('');
        
        this.bindNoteEvents();
    }
    
    createNoteHTML(note) {
        const createdDate = new Date(note.createdAt).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const updatedDate = note.updatedAt !== note.createdAt ? 
            new Date(note.updatedAt).toLocaleString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : null;
        
        return `
            <div class="note-item" data-id="${note.id}">
                <div class="note-content">
                    <div class="note-text">${this.escapeHtml(note.content)}</div>
                </div>
                <div class="note-meta">
                    <div class="note-date">
                        Créée le ${createdDate}
                        ${updatedDate ? `<br>Modifiée le ${updatedDate}` : ''}
                    </div>
                    <div class="note-id">ID: ${note.id.substring(0, 8)}</div>
                </div>
                <div class="note-actions">
                    <button class="btn btn-small btn-edit" data-action="edit" data-id="${note.id}">
                         Modifier
                    </button>
                    <button class="btn btn-small btn-delete" data-action="delete" data-id="${note.id}">
                         Supprimer
                    </button>
                </div>
            </div>
        `;
    }
    
    bindNoteEvents() {
        const editButtons = this.notesList.querySelectorAll('[data-action="edit"]');
        const deleteButtons = this.notesList.querySelectorAll('[data-action="delete"]');
        
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const noteId = e.target.getAttribute('data-id');
                this.openEditModal(noteId);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const noteId = e.target.getAttribute('data-id');
                this.openDeleteModal(noteId);
            });
        });
    }
    
    openEditModal(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.currentEditId = noteId;
        this.editNoteInput.value = note.content;
        this.updateEditCharCount();
        this.editModal.classList.add('show');
        this.editNoteInput.focus();
        
        this.editNoteInput.setSelectionRange(note.content.length, note.content.length);
    }
    
    saveEditedNote() {
        const content = this.editNoteInput.value.trim();
        
        if (!content) {
            this.showNotification('Veuillez saisir du contenu pour la note', 'warning');
            this.editNoteInput.focus();
            return;
        }
        
        if (content.length > 500) {
            this.showNotification('La note ne peut pas dépasser 500 caractères', 'error');
            return;
        }
        
        const noteIndex = this.notes.findIndex(n => n.id === this.currentEditId);
        if (noteIndex === -1) return;
        
        if (this.notes[noteIndex].content === content) {
            this.closeEditModal();
            this.showNotification('Aucune modification détectée', 'info');
            return;
        }
        
        this.notes[noteIndex].content = content;
        this.notes[noteIndex].updatedAt = new Date().toISOString();
        
        this.saveNotes();
        this.renderNotes();
        this.closeEditModal();
        this.showNotification('Note modifiée avec succès', 'success');
    }
    
    closeEditModal() {
        this.editModal.classList.remove('show');
        this.currentEditId = null;
        this.editNoteInput.value = '';
    }
    
    openDeleteModal(noteId) {
        this.currentDeleteId = noteId;
        this.deleteModal.classList.add('show');
    }
    
    deleteNote() {
        if (!this.currentDeleteId) return;
        
        const noteIndex = this.notes.findIndex(n => n.id === this.currentDeleteId);
        if (noteIndex === -1) return;
        
        this.notes.splice(noteIndex, 1);
        this.saveNotes();
        this.renderNotes();
        this.closeDeleteModal();
        this.showNotification('Note supprimée avec succès', 'success');
    }
    
    closeDeleteModal() {
        this.deleteModal.classList.remove('show');
        this.currentDeleteId = null;
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    updateCharCount() {
        const count = this.noteInput.value.length;
        this.charCount.textContent = count;
        
        if (count > 450) {
            this.charCount.style.color = '#dc3545';
        } else if (count > 400) {
            this.charCount.style.color = '#ffc107';
        } else {
            this.charCount.style.color = '#666';
        }
        
        this.addNoteBtn.disabled = count === 0 || count > 500;
    }
    
    updateEditCharCount() {
        const count = this.editNoteInput.value.length;
        this.editCharCount.textContent = count;
        
        if (count > 450) {
            this.editCharCount.style.color = '#dc3545';
        } else if (count > 400) {
            this.editCharCount.style.color = '#ffc107';
        } else {
            this.editCharCount.style.color = '#666';
        }
        
        this.saveEdit.disabled = count === 0 || count > 500;
    }
    
    updateNotesCount() {
        const count = this.notes.length;
        this.notesCount.textContent = `${count} note${count !== 1 ? 's' : ''}`;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutToRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
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
