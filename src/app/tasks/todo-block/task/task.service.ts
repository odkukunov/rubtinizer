import { ElementRef, Injectable } from '@angular/core';
import { ToDoTask } from '../../../../types/task';
import { IsPointInRect } from '../../../../utils';
import { TasksService } from '../../tasks.service';
import { TasksCategoriesService } from '../tasks-categories.service';
import { TaskLabelService } from '../../task-forms/shared/add-label-form/task-label.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  isTaskMoving = false;
  editingTask: ToDoTask | undefined;

  private taskDeleteBlock: ElementRef | undefined;

  constructor(
    private tasksService: TasksService,
    private tasksCategoriesService: TasksCategoriesService,
    private taskLabelService: TaskLabelService
  ) {}

  setTaskDeleteBlock(taskDeleteBlock) {
    this.taskDeleteBlock = taskDeleteBlock;
  }

  addTask({ task, index }) {
    this.tasksService.tasks[index].push({
      ...task,
      timestamp: Date.now(),
      subtasks: [],
      labels: [...this.taskLabelService.labels],
    });
    this.tasksService.saveTasks();
    this.taskLabelService.labels = [];
  }

  removeTask(task: ToDoTask) {
    const currentCategory = this.tasksCategoriesService.currentMovingTaskBaseCategory;

    this.tasksService.tasks[currentCategory] = this.tasksService.tasks[currentCategory].filter(
      (_task) => _task.timestamp !== task.timestamp
    );

    this.tasksCategoriesService.setUndefinedMovingCategory();
    this.tasksService.saveTasks();
  }

  taskMoving({ event, taskRect, taskCategoryIndex }) {
    this.isTaskMoving = true;
    this.tasksCategoriesService.currentMovingTaskBaseCategory = +taskCategoryIndex;

    const isInSomeRect = this.tasksCategoriesService.todoCategoriesBlocks.some((todoBlock, categoryIndex) => {
      if (this.tasksCategoriesService.currentMovingTaskBaseCategory !== categoryIndex) {
        const rect = todoBlock.nativeElement.getBoundingClientRect();
        const moveBlock = todoBlock.nativeElement.getElementsByClassName('todo-block__move')[0];

        if (
          IsPointInRect(event, {
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom + taskRect.height,
            right: rect.right,
          })
        ) {
          moveBlock.style.height = `${taskRect.height}px`;
          moveBlock.classList.add('active');
          this.tasksCategoriesService.currentMovingTaskCategory = categoryIndex;

          return true;
        } else {
          moveBlock.classList.remove('active');
          moveBlock.style.height = 0;

          return false;
        }
      }
    });

    if (!isInSomeRect) {
      this.tasksCategoriesService.setUndefinedMovingCategory();
    }

    if (IsPointInRect(event, this.taskDeleteBlock.nativeElement.getBoundingClientRect())) {
      this.tasksCategoriesService.setDeleteMovingCategory();
    }
  }

  taskStopMoving(task: ToDoTask) {
    if (this.isTaskMoving) {
      this.isTaskMoving = false;

      if (this.tasksCategoriesService.isDeleteMovingCategory()) {
        this.removeTask(task);
      }

      this.tasksCategoriesService.todoCategoriesBlocks.forEach((todoBlock, categoryIndex) => {
        if (this.tasksCategoriesService.currentMovingTaskCategory === categoryIndex) {
          this.tasksService.tasks[categoryIndex].push(task);
          this.removeTask(task);
        }

        const moveBlock = todoBlock.nativeElement.getElementsByClassName('todo-block__move')[0];
        moveBlock.classList.remove('active');
        moveBlock.style.height = 0;
      });

      this.tasksService.saveTasks();
    }
  }

  changeTask(newTask: ToDoTask) {
    this.tasksService.tasks = this.tasksService.tasks.map((taskCategory) => {
      return taskCategory.map((task) => {
        if (task.timestamp === this.editingTask.timestamp) {
          const result = { ...task, ...newTask, labels: [...this.taskLabelService.labels], timestamp: task.timestamp };
          this.taskLabelService.labels = [];

          return result;
        }

        return task;
      });
    });

    this.tasksService.saveTasks();
  }
}
