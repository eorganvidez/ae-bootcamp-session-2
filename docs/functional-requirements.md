# Functional Requirements

This document defines the core functional requirements for the TODO application.

## Core Requirements

1. The user can create a new task by entering a title.
2. The user cannot create a task with an empty title.
3. The user can view a list of all existing tasks.
4. The user can edit the title of an existing task.
5. The user can mark a task as complete.
6. The user can mark a completed task as incomplete.
7. The user can delete a task.
8. The user can assign an optional due date to a task.
9. The user can update or remove a due date from an existing task.
10. The user can add an optional description or notes field to a task.
11. The user can view whether a task is overdue based on its due date.
12. The user can sort tasks in a consistent order.
13. The default task order places incomplete tasks before completed tasks.
14. Within the same completion state, tasks with earlier due dates appear before tasks with later due dates.
15. Tasks without a due date appear after tasks that have a due date.
16. When due dates are the same or absent, newer tasks appear after older tasks.
17. The user can filter the task list to view all, active, or completed tasks.
18. The application preserves tasks between sessions so the user does not lose data after refreshing or reopening the app.

## Expected Behavior Notes

- A task is considered complete only when the user explicitly marks it complete.
- Due dates are optional and should not block task creation.
- Sorting and filtering should update the visible list without modifying the underlying task data.