// Entities

export interface TodoItem {
  id: number
  name: string
  description?: string
  done: boolean
}

export interface TodoList {
  id: number
  name: string
  todoItems: TodoItem[]
}

// Requests

export interface CreateTodoListRequest {
  name: string
}

export interface UpdateTodoListRequest {
  name?: string
}

export interface AddTodoItemRequest {
  name: string
  description?: string
}

export interface UpdateTodoItemRequest {
  name?: string
  description?: string
  done?: boolean
}
