import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TasksService } from './tasks.service';
import { TasksCategoriesService } from './todo-block/tasks-categories.service';
import { TaskService } from './todo-block/task/task.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit, OnDestroy {
  @ViewChild('taskdelete', { static: true })
  taskDeleteBlock: ElementRef | undefined;

  searchStr = '';

  constructor(
    public tasksService: TasksService,
    public tasksCategoriesService: TasksCategoriesService,
    public taskService: TaskService
  ) {}

  ngOnDestroy(): void {
    this.tasksCategoriesService.todoCategoriesBlocks = [];
  }

  ngOnInit(): void {
    this.tasksService.loadTasks();
    this.taskService.setTaskDeleteBlock(this.taskDeleteBlock);
    this.taskService.editingTask = undefined;
  }

  onInitTodoBlock(block: ElementRef) {
    this.tasksCategoriesService.todoCategoriesBlocks.push(block);
  }

  onSearchChange(value: string) {
    this.searchStr = value;
  }
}
