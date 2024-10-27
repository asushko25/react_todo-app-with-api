/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';

interface TodoItemProps {
  todo: Todo;
  onDelete: (todoId: number) => void;
  isSubmitting: boolean;
  deletingTodoId: number | null;
  tempTodo: Todo | null;
  onDoubleClickHandler: () => void;
  setEditingTitle: (title: string) => void;
  editingTodoId: (todoId: number) => void;
  handleToggleTodo: (todoId: number) => void;
  editingTitle: string;
  handleAddTodo: () => void;
  handleBlur: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onDelete,
  isSubmitting,
  deletingTodoId,
  tempTodo,
  onDoubleClickHandler,
  setEditingTitle,
  editingTitle,
  editingTodoId,
  handleToggleTodo,
  handleAddTodo,
  handleBlur,
}) => {
  const { id, title, completed } = todo;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && editingTitle) {
      inputRef.current.focus();
    }
  }, [editingTitle, editingTodoId]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTodo();
    } else if (event.key === 'Escape') {
      setEditingTitle(todo.title);
      editingTodoId(null);
    }
  };

  return (
    <div data-cy="Todo" className={classNames('todo', { completed })}>
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={() => handleToggleTodo(todo)}
        />
      </label>

      {editingTitle ? (
        <form onSubmit={handleAddTodo}>
          <input
            ref={inputRef}
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={editingTitle}
            onChange={event => setEditingTitle(event.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        </form>
      ) : (
        <span
          data-cy="TodoTitle"
          className="todo__title"
          onDoubleClick={() => onDoubleClickHandler(todo)}
        >
          {title}
        </span>
      )}

      {!editingTitle && (
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={() => onDelete(id)}
        >
          ×
        </button>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': (isSubmitting && !tempTodo) || deletingTodoId === id,
        })}
      >
        <div className="loader" />
        <div className="modal-background has-background-white-ter" />
      </div>
    </div>
  );
};
