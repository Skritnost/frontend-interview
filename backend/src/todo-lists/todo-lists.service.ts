import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoListDto } from './dtos/create-todo-list.dto';
import { UpdateTodoListDto } from './dtos/update-todo-list.dto';
import { TodoList } from './entities/todo-list.entity';
import { TodoItem } from './entities/todo-item.entity';
import { AddTodoItemDto } from './dtos/add-todo-item.dto';
import { UpdateTodoItemDto } from './dtos/update-todo-item.dto';
import { todoListsData } from './data/todo-lists.data';

@Injectable()
export class TodoListsService {
  private readonly todolists: TodoList[];

  constructor() {
    this.todolists = todoListsData;
  }

  findAll(): TodoList[] {
    return this.todolists;
  }

  findOne(id: number): TodoList {
    return this.assertTodoListExists(id);
  }

  create(dto: CreateTodoListDto): TodoList {
    const todoList: TodoList = {
      id: this.nextId(this.todolists),
      name: dto.name,
      todoItems: [],
    };

    // Add the record
    this.todolists.push(todoList);

    return todoList;
  }

  update(id: number, dto: UpdateTodoListDto): TodoList {
    const todolist = this.assertTodoListExists(id);

    // Update the record
    todolist.name = dto.name;

    return todolist;
  }

  delete(id: number): void {
    const todoList = this.assertTodoListExists(id);

    // Delete the record
    this.todolists.splice(this.todolists.indexOf(todoList), 1);
  }

  /**
  --------------------------------------------------------------------
  # Todo-Lists Items
  --------------------------------------------------------------------
  **/

  addTodoItem(todoListId: number, todoItemDto: AddTodoItemDto): TodoItem {
    const todoList = this.assertTodoListExists(todoListId);

    const todoItem: TodoItem = {
      id: this.nextId(todoList.todoItems),
      name: todoItemDto.name,
      description: todoItemDto.description,
      done: false,
    };

    // Add the record
    todoList.todoItems.push(todoItem);

    return todoItem;
  }

  findAllTodoItems(todoListId: number): TodoItem[] {
    const todoList = this.assertTodoListExists(todoListId);

    return todoList.todoItems;
  }
  findOneTodoItem(todoListId: number, todoItemId: number): TodoItem {
    const todoList = this.assertTodoListExists(todoListId);

    return this.assertTodoItemExists(todoList, todoItemId);
  }

  updateTodoItem(
    todoListId: number,
    todoItemId: number,
    todoItemDto: UpdateTodoItemDto,
  ): TodoItem {
    const todoList = this.assertTodoListExists(todoListId);
    const todoItem = this.assertTodoItemExists(todoList, todoItemId);

    // Update the record
    todoItem.name = todoItemDto.name ?? todoItem.name;
    todoItem.description = todoItemDto.description ?? todoItem.description;
    todoItem.done = todoItemDto.done ?? todoItem.done;

    return todoItem;
  }

  removeTodoItem(todoListId: number, todoItemId: number): void {
    const todoList = this.assertTodoListExists(todoListId);
    const todoItem = this.assertTodoItemExists(todoList, todoItemId);

    // Delete the record
    todoList.todoItems.splice(todoList.todoItems.indexOf(todoItem), 1);
  }

  /**
  --------------------------------------------------------------------
  # Helper Methods
  --------------------------------------------------------------------
  **/
  private nextId(list: TodoList[] | TodoItem[]): number {
    const last = list
      .map((x: TodoItem | TodoList) => x.id)
      .sort((a, b) => a - b)
      .reverse()[0];

    return last ? last + 1 : 1;
  }

  private assertTodoListExists(id: number): TodoList {
    const index = this.todolists.findIndex((x) => x.id === Number(id));

    if (index === -1) {
      throw new NotFoundException(`Todo list with id ${id} not found`);
    }

    return this.todolists[index];
  }

  private assertTodoItemExists(
    todoList: TodoList,
    todoItemId: number,
  ): TodoItem {
    const index = todoList.todoItems.findIndex(
      (x) => x.id === Number(todoItemId),
    );

    if (index === -1) {
      throw new NotFoundException(`Todo item with id ${todoItemId} not found`);
    }

    return todoList.todoItems[index];
  }
}
