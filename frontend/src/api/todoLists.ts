import type {
  TodoList,
  TodoItem,
  CreateTodoListRequest,
  UpdateTodoListRequest,
  AddTodoItemRequest,
  UpdateTodoItemRequest,
} from '../types/api'

const BASE = '/api/todo-lists'

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

// Todo Lists

export async function getTodoLists(): Promise<TodoList[]> {
  return request(BASE)
}

export async function getTodoList(listId: number): Promise<TodoList> {
  return request(`${BASE}/${listId}`)
}

export async function createTodoList(data: CreateTodoListRequest): Promise<TodoList> {
  return request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function updateTodoList(listId: number, data: UpdateTodoListRequest): Promise<TodoList> {
  return request(`${BASE}/${listId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function deleteTodoList(listId: number): Promise<void> {
  return request(`${BASE}/${listId}`, { method: 'DELETE' })
}

// Todo Items

export async function getTodoItems(listId: number): Promise<TodoItem[]> {
  return request(`${BASE}/${listId}/todo-items`)
}

export async function getTodoItem(listId: number, itemId: number): Promise<TodoItem> {
  return request(`${BASE}/${listId}/todo-items/${itemId}`)
}

export async function addTodoItem(listId: number, data: AddTodoItemRequest): Promise<TodoItem> {
  return request(`${BASE}/${listId}/todo-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function updateTodoItem(listId: number, itemId: number, data: UpdateTodoItemRequest): Promise<TodoItem> {
  return request(`${BASE}/${listId}/todo-items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function deleteTodoItem(listId: number, itemId: number): Promise<void> {
  return request(`${BASE}/${listId}/todo-items/${itemId}`, { method: 'DELETE' })
}
