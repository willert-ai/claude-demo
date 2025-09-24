class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.initializeElements();
        this.attachEventListeners();
        this.initializeInteractiveBackground();
        this.render();
    }

    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalTasks = document.getElementById('totalTasks');
        this.clearCompleted = document.getElementById('clearCompleted');
    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    clearCompletedTodos() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = `${total} task${total !== 1 ? 's' : ''} (${pending} pending)`;
        this.clearCompleted.style.display = completed > 0 ? 'block' : 'none';
    }

    render() {
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = this.getEmptyStateHTML();
        } else {
            this.todoList.innerHTML = filteredTodos
                .map(todo => this.createTodoHTML(todo))
                .join('');
        }

        this.updateStats();
    }

    createTodoHTML(todo) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input
                    type="checkbox"
                    class="todo-checkbox"
                    ${todo.completed ? 'checked' : ''}
                    onchange="app.toggleTodo(${todo.id})"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">Delete</button>
            </li>
        `;
    }

    getEmptyStateHTML() {
        const messages = {
            all: 'No tasks yet. Add one above!',
            pending: 'No pending tasks. Great job!',
            completed: 'No completed tasks yet.'
        };

        return `
            <li class="empty-state">
                <h3>📝</h3>
                <p>${messages[this.currentFilter]}</p>
            </li>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initializeInteractiveBackground() {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;

            document.documentElement.style.setProperty('--mouse-x', x + '%');
            document.documentElement.style.setProperty('--mouse-y', y + '%');
        });

        document.addEventListener('click', (e) => {
            this.createRippleEffect(e.clientX, e.clientY);
        });
    }

    createRippleEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '10';
        ripple.style.animation = 'ripple 0.8s ease-out forwards';

        document.body.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 800);
    }
}

const app = new TodoApp();