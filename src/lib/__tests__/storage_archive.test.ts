import test from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../../types/task';
import {
  archiveExpiredCompletedTasks,
  archiveAllCompletedTasks,
  isTaskOlderThanDays,
  loadLifetimeCompletedCount,
  saveLifetimeCompletedCount,
} from '../storage';

// In-memory mock for localStorage in Node test environment
const mockStorage = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  // @ts-expect-error Mocking minimal localStorage interface for tests
  globalThis.localStorage = {
    getItem: (key: string) => mockStorage.get(key) ?? null,
    setItem: (key: string, val: string) => { mockStorage.set(key, String(val)); },
    removeItem: (key: string) => { mockStorage.delete(key); },
    clear: () => { mockStorage.clear(); },
  };
}

test('isTaskOlderThanDays correctly determines 30-day cutoff', () => {
  const now = Date.now();
  const twentyDaysAgo = new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyOneDaysAgo = new Date(now - 31 * 24 * 60 * 60 * 1000).toISOString();

  assert.strictEqual(isTaskOlderThanDays(twentyDaysAgo, 30), false);
  assert.strictEqual(isTaskOlderThanDays(thirtyOneDaysAgo, 30), true);
  assert.strictEqual(isTaskOlderThanDays(undefined, 30), false);
  assert.strictEqual(isTaskOlderThanDays('invalid-date', 30), false);
});

test('archiveExpiredCompletedTasks prunes tasks older than 30 days and increments lifetime EXP', () => {
  mockStorage.clear();
  saveLifetimeCompletedCount(5);

  const now = Date.now();
  const tasks: Task[] = [
    {
      id: 'active-1',
      title: 'Active quest',
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'completed-recent',
      title: 'Recent completed quest',
      completed: true,
      completedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      order: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'completed-old',
      title: 'Old completed quest',
      completed: true,
      completedAt: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString(),
      order: 2,
      createdAt: new Date().toISOString(),
    },
  ];

  const result = archiveExpiredCompletedTasks(tasks, 30);

  // Check returned tasks
  assert.strictEqual(result.archivedCount, 1);
  assert.strictEqual(result.updatedTasks.length, 2);
  assert.ok(result.updatedTasks.some(t => t.id === 'active-1'));
  assert.ok(result.updatedTasks.some(t => t.id === 'completed-recent'));
  assert.ok(!result.updatedTasks.some(t => t.id === 'completed-old'));

  // Check lifetime stats increment: 5 existing + 1 archived = 6
  assert.strictEqual(loadLifetimeCompletedCount(), 6);
});

test('archiveAllCompletedTasks cleans all done tasks and transfers count into lifetime EXP', () => {
  mockStorage.clear();
  saveLifetimeCompletedCount(10);

  const tasks: Task[] = [
    {
      id: 'active-1',
      title: 'Still active',
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'done-1',
      title: 'Done yesterday',
      completed: true,
      completedAt: new Date().toISOString(),
      order: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'done-2',
      title: 'Done today',
      completed: true,
      completedAt: new Date().toISOString(),
      order: 2,
      createdAt: new Date().toISOString(),
    },
  ];

  const result = archiveAllCompletedTasks(tasks);

  assert.strictEqual(result.archivedCount, 2);
  assert.strictEqual(result.updatedTasks.length, 1);
  assert.strictEqual(result.updatedTasks[0].id, 'active-1');

  // Lifetime count should now be 10 + 2 = 12
  assert.strictEqual(loadLifetimeCompletedCount(), 12);
});

test('Wizard EXP invariant: total completed count never drops after archiving', () => {
  mockStorage.clear();
  saveLifetimeCompletedCount(0);

  const tasks: Task[] = [
    { id: 't1', title: 'Task 1', completed: true, order: 0, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
    { id: 't2', title: 'Task 2', completed: true, order: 1, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
    { id: 't3', title: 'Task 3', completed: true, order: 2, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
  ];

  const totalBefore = loadLifetimeCompletedCount() + tasks.filter(t => t.completed).length;
  assert.strictEqual(totalBefore, 3);

  const archived = archiveAllCompletedTasks(tasks);
  const totalAfter = loadLifetimeCompletedCount() + archived.updatedTasks.filter(t => t.completed).length;

  assert.strictEqual(totalAfter, 3);
  assert.strictEqual(totalAfter, totalBefore);
});
