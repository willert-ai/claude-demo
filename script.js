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

        // Add input animation
        this.todoInput.classList.add('animate-input');
        setTimeout(() => {
            this.todoInput.classList.remove('animate-input');
        }, 300);

        this.saveTodos();
        this.render();

        // Animate new todo item
        setTimeout(() => {
            const newItem = this.todoList.querySelector('.todo-item:first-child');
            if (newItem) {
                newItem.classList.add('todo-item-enter');
            }
        }, 10);
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

        let statsText = '';
        if (total === 0) {
            statsText = 'No tasks yet';
        } else if (pending === 0) {
            statsText = `🎉 All ${total} task${total !== 1 ? 's' : ''} completed!`;
        } else {
            statsText = `${pending} of ${total} task${total !== 1 ? 's' : ''} remaining`;
        }

        this.totalTasks.textContent = statsText;
        this.clearCompleted.style.display = completed > 0 ? 'flex' : 'none';
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
                <button class="delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete task">
                    🗑️
                </button>
            </li>
        `;
    }

    getEmptyStateHTML() {
        const states = {
            all: {
                icon: '✨',
                title: 'Ready to get started?',
                message: 'Add your first task above and make today productive!'
            },
            pending: {
                icon: '🎉',
                title: 'All caught up!',
                message: 'No pending tasks. You\'re doing amazing!'
            },
            completed: {
                icon: '💪',
                title: 'Keep going!',
                message: 'Complete some tasks to see them here.'
            }
        };

        const state = states[this.currentFilter];
        return `
            <li class="empty-state">
                <h3>${state.title}</h3>
                <p>${state.message}</p>
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
        ripple.style.background = 'rgba(99, 102, 241, 0.4)';
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