import React, { useState, useEffect, useRef } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID, getTodos, deleteTodo, createTodo } from './api/todos';
import { Todo } from './types/Todo';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { ErrorItem } from './components/ErrorItem';
import { FooterItem } from './components/Footer';
import { updateTodo } from './api/todos';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isTogglingAll, setIsTogglingAll] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    if (inputRef.current && !isSubmitting) {
      inputRef.current.focus();
    }
  }, [todos, isSubmitting]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [errorMessage]);

  useEffect(() => {
    setErrorMessage(null);
    getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'));
  }, []);

  const hasAllTodosCompleted = todos.every(todo => todo.completed);
  const notCompletedTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const onUpdate = (id: number, updatedStatus: Partial<Todo>) => {
    updateTodo({ id, ...updatedStatus })
      .then(updatedTodo => {
        setTodos(currentTodos =>
          currentTodos.map(todo => (todo.id === id ? updatedTodo : todo)),
        );
      })
      .catch(() => {
        setErrorMessage('Unable to update todo');
      });
  };

  const handleToggleAll = () => {
    setIsTogglingAll(true);

    const haveActive = todos.some(todo => !todo.completed);
    const todosToUpdate = haveActive
      ? todos.filter(todo => !todo.completed)
      : todos;

    Promise.all(
      todosToUpdate.map(todo => onUpdate(todo.id, { completed: haveActive })),
    ).finally(() => setIsTogglingAll(false));
  };

  const handleToggleTodo = (todo: Todo) => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  const handleDeleteTodo = (todoId: number) => {
    deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      })
      .finally(() => {
        setDeletingTodoId(null);
      });
  };

  const handleClearCompleted = () => {
    const deletePromises = completedTodos.map(todo =>
      handleDeleteTodo(todo.id),
    );

    Promise.all(deletePromises).catch(() => {
      setErrorMessage('Unable to delete one or more todos');
    });
  };

  const handleAddTodo = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = newTodoTitle.trim();

    if (!newTodoTitle.trim()) {
      setErrorMessage('Title should not be empty');

      return;
    }

    const tempTodoItem: Todo = {
      id: 0,
      title: newTodoTitle,
      completed: false,
      userId: USER_ID,
    };

    setTempTodo(tempTodoItem);
    setIsSubmitting(true);

    createTodo({
      title: trimmedTitle,
      userId: USER_ID,
      completed: false,
    })
      .then(newTodo => {
        setTodos(currentTodos => [...currentTodos, newTodo]);
        setNewTodoTitle('');
      })
      .catch(() => setErrorMessage('Unable to add a todo'))
      .finally(() => {
        setIsSubmitting(false);
        setTempTodo(null);
      });
  };

  const onDoubleClickHandler = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
    setIsEditing(true);
  };

  const handleBlur = (id: number) => {
    const updatedTitle = editingTitle.trim();

    if (!updatedTitle) {
      setErrorMessage('Title cannot be empty');

      return;
    }

    updateTodo({ id, title: updatedTitle })
      .then(updatedTodo => {
        setTodos(currentTodos =>
          currentTodos.map(todo => (todo.id === id ? updatedTodo : todo)),
        );
        setEditingTodoId(null);
        setEditingTitle('');
        setIsEditing(false);
      })
      .catch(() => {
        setErrorMessage('Unable to update title');
      });
  };

  const handleUpdateTodo = (id: number, event: React.FormEvent) => {
    event.preventDefault();

    const updatedTitle = editingTitle.trim();

    if (!updatedTitle) {
      setErrorMessage('Title cannot be empty');

      return;
    }

    const currentTodo = todos.find(todo => todo.id === id);

    if (currentTodo && currentTodo.title !== updatedTitle) {
      updateTodo({ id, title: updatedTitle })
        .then(updatedTodo => {
          setTodos(currentTodos =>
            currentTodos.map(todo => (todo.id === id ? updatedTodo : todo)),
          );
          setEditingTodoId(null);
          setEditingTitle('');
          setIsEditing(false);
        })
        .catch(() => {
          setErrorMessage('Unable to update todo');
        });
    }
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          hasAllTodosCompleted={hasAllTodosCompleted}
          handleAddTodo={handleAddTodo}
          newTodoTitle={newTodoTitle}
          setNewTodoTitle={setNewTodoTitle}
          inputRef={inputRef}
          isSubmitting={isSubmitting}
          handleToggleAll={handleToggleAll}
        />

        <TodoList
          todos={todos}
          filter={filter}
          isSubmitting={isSubmitting}
          deletingTodoId={deletingTodoId}
          tempTodo={tempTodo}
          onDelete={handleDeleteTodo}
          onDoubleClickHandler={onDoubleClickHandler}
          editingTodoId={editingTodoId}
          editingTitle={editingTitle}
          handleToggleTodo={handleToggleTodo}
          handleBlur={handleBlur}
          isEditing={isEditing}
          setEditingTodoId={setEditingTodoId}
          setEditingTitle={setEditingTitle}
          handleUpdateTodo={handleUpdateTodo}
          isTogglingAll={isTogglingAll}
        />

        {todos.length > 0 && (
          <FooterItem
            notCompletedTodos={notCompletedTodos}
            setFilter={setFilter}
            filter={filter}
            handleClearCompleted={handleClearCompleted}
            completedTodos={completedTodos}
            handleToggleTodo={handleToggleTodo}
          />
        )}
      </div>
      <ErrorItem
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
