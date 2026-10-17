import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, FilterView, NewTaskInput } from '../types/task';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadLifetimeCompletedCount,
  archiveExpiredCompletedTasks,
  archiveAllCompletedTasks,
} from '../lib/storage';
import { getTodayString, isToday } from '../lib/dateUtils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const loaded = loadTasksFromStorage();
    const result = archiveExpiredCompletedTasks(loaded);
    return result.updatedTasks;
  });
  const [lifetimeCompleted, setLifetimeCompleted] = useState<number>(() => loadLifetimeCompletedCount());
  const [filter, setFilter] = useState<FilterView>('active');

  // Sync to local storage whenever tasks state changes
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const addTask = useCallback((input: NewTaskInput): Task => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: input.title.trim(),
      completed: false,
      order: 0,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => {
      // Re-index existing tasks so new item starts at order 0
      const shifted = prev.map(t => ({ ...t, order: t.order + 1 }));
      return [newTask, ...shifted];
    });

    return newTask;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== id) return task;
        const willComplete = !task.completed;
        return {
          ...task,
          completed: willComplete,
          completedAt: willComplete ? new Date().toISOString() : undefined,
        };
      })
    );
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates } : task))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const archiveCompleted = useCallback(() => {
    setTasks(prev => {
      const result = archiveAllCompletedTasks(prev);
      setLifetimeCompleted(loadLifetimeCompletedCount());
      return result.updatedTasks;
    });
  }, []);

  const reorderTasks = useCallback((activeId: string, overId: string) => {
    setTasks(prev => {
      const oldIndex = prev.findIndex(t => t.id === activeId);
      const newIndex = prev.findIndex(t => t.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;

      const updated = [...prev];
      const [movedItem] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, movedItem);

      // Re-assign explicit order indices
      return updated.map((item, idx) => ({ ...item, order: idx }));
    });
  }, []);

  const filteredTasks = useMemo(() => {
    const today = getTodayString();
    return tasks.filter(task => {
      if (filter === 'completed') return task.completed;
      if (task.completed) return false; // Filter out completed tasks from active views

      if (filter === 'today') {
        return task.dueDate ? isToday(task.dueDate) : false;
      }
      if (filter === 'upcoming') {
        return task.dueDate ? task.dueDate > today : false;
      }
      // 'active' returns all uncompleted tasks
      return true;
    });
  }, [tasks, filter]);

  return {
    tasks,
    filter,
    setFilter,
    filteredTasks,
    lifetimeCompleted,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    reorderTasks,
    archiveCompleted,
  };
}
