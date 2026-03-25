import type {
  TodoList,
  TodoItem,
  CreateTodoListRequest,
  UpdateTodoListRequest,
  AddTodoItemRequest,
  UpdateTodoItemRequest,
} from '../types/api'

const BASE = '/api/todo-lists'

// Todo Lists

export async function getTodoLists(): Promise<TodoList[]> {
  const res = await fetch(BASE)
  return res.json()
}

export async function getTodoList(listId: number): Promise<TodoList> {
  const res = await fetch(`${BASE}/${listId}`)
  return res.json()
}

export async function createTodoList(data: CreateTodoListRequest): Promise<TodoList> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateTodoList(listId: number, data: UpdateTodoListRequest): Promise<TodoList> {
  const res = await fetch(`${BASE}/${listId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteTodoList(listId: number): Promise<void> {
  await fetch(`${BASE}/${listId}`, { method: 'DELETE' })
}

// Todo Items

export async function getTodoItems(listId: number): Promise<TodoItem[]> {
  const res = await fetch(`${BASE}/${listId}/todo-items`)
  return res.json()
}

export async function getTodoItem(listId: number, itemId: number): Promise<TodoItem> {
  const res = await fetch(`${BASE}/${listId}/todo-items/${itemId}`)
  return res.json()
}

export async function addTodoItem(listId: number, data: AddTodoItemRequest): Promise<TodoItem> {
  const res = await fetch(`${BASE}/${listId}/todo-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateTodoItem(listId: number, itemId: number, data: UpdateTodoItemRequest): Promise<TodoItem> {
  const res = await fetch(`${BASE}/${listId}/todo-items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteTodoItem(listId: number, itemId: number): Promise<void> {
  await fetch(`${BASE}/${listId}/todo-items/${itemId}`, { method: 'DELETE' })
}
